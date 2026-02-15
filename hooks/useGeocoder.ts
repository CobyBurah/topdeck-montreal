'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

const CACHE_KEY = 'map-geocode-cache'
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 200

interface GeocoderResult {
  cache: Map<string, google.maps.LatLngLiteral>
  isLoading: boolean
  progress: { done: number; total: number }
  geocodeAddress: (address: string) => Promise<google.maps.LatLngLiteral | null>
}

function loadCache(): Record<string, google.maps.LatLngLiteral> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore parse errors
  }
  return {}
}

function saveCache(cache: Map<string, google.maps.LatLngLiteral>) {
  try {
    const obj: Record<string, google.maps.LatLngLiteral> = {}
    cache.forEach((v, k) => { obj[k] = v })
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch {
    // ignore storage errors
  }
}

export function useGeocoder(addresses: string[]): GeocoderResult {
  const geocodingLib = useMapsLibrary('geocoding')
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const [cache, setCache] = useState<Map<string, google.maps.LatLngLiteral>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const processingRef = useRef(false)
  const cacheLoadedRef = useRef(false)

  // Load sessionStorage cache after mount (avoids hydration mismatch)
  useEffect(() => {
    if (cacheLoadedRef.current) return
    cacheLoadedRef.current = true
    const stored = loadCache()
    const entries = Object.entries(stored)
    if (entries.length > 0) {
      setCache(new Map(entries))
    }
  }, [])

  // Initialize geocoder when library loads
  useEffect(() => {
    if (geocodingLib) {
      geocoderRef.current = new google.maps.Geocoder()
    }
  }, [geocodingLib])

  // Geocode a single address (for on-demand use after realtime updates)
  const geocodeAddress = useCallback(async (address: string): Promise<google.maps.LatLngLiteral | null> => {
    if (!geocoderRef.current) return null

    // Check cache first
    const cached = cache.get(address)
    if (cached) return cached

    try {
      const result = await geocoderRef.current.geocode({ address })
      if (result.results.length > 0) {
        const location = result.results[0].geometry.location
        const coords = { lat: location.lat(), lng: location.lng() }
        setCache(prev => {
          const next = new Map(prev)
          next.set(address, coords)
          saveCache(next)
          return next
        })
        return coords
      }
    } catch {
      // geocode failed
    }
    return null
  }, [cache])

  // Batch geocode all missing addresses
  useEffect(() => {
    if (!geocoderRef.current || processingRef.current) return

    const missing = addresses.filter(a => a && !cache.has(a))
    if (missing.length === 0) return

    processingRef.current = true
    setIsLoading(true)
    setProgress({ done: 0, total: missing.length })

    let cancelled = false

    async function processBatches() {
      const geocoder = geocoderRef.current!
      let done = 0
      const newEntries: [string, google.maps.LatLngLiteral][] = []

      for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        if (cancelled) break

        const batch = missing.slice(i, i + BATCH_SIZE)
        const results = await Promise.allSettled(
          batch.map(addr =>
            geocoder.geocode({ address: addr }).then(res => ({
              address: addr,
              result: res,
            }))
          )
        )

        for (const r of results) {
          if (r.status === 'fulfilled' && r.value.result.results.length > 0) {
            const location = r.value.result.results[0].geometry.location
            newEntries.push([r.value.address, { lat: location.lat(), lng: location.lng() }])
          }
        }

        done += batch.length
        if (!cancelled) {
          setProgress({ done, total: missing.length })
        }

        // Delay between batches
        if (i + BATCH_SIZE < missing.length && !cancelled) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
        }
      }

      if (!cancelled && newEntries.length > 0) {
        setCache(prev => {
          const next = new Map(prev)
          for (const [addr, coords] of newEntries) {
            next.set(addr, coords)
          }
          saveCache(next)
          return next
        })
      }

      if (!cancelled) {
        setIsLoading(false)
        processingRef.current = false
      }
    }

    processBatches()

    return () => {
      cancelled = true
      processingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocodingLib, addresses.join('|')])

  return { cache, isLoading, progress, geocodeAddress }
}
