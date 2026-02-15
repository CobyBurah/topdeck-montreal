'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { cn } from '@/lib/utils'

interface AddressAutocompleteProps {
  label?: string
  error?: string
  value: string
  onChange: (value: string) => void
  onAddressSelect: (address: string) => void
  placeholder?: string
  name?: string
  id?: string
}

const QUEBEC_BOUNDS = {
  north: 62.5,
  south: 44.99,
  east: -57.1,
  west: -79.76,
}

const baseInputStyles = 'w-full px-4 py-3 rounded-xl border border-secondary-300 bg-white text-secondary-900 placeholder:text-secondary-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
const labelStyles = 'block text-sm font-medium text-secondary-700 mb-2'
const errorInputStyles = 'border-red-500 focus:ring-red-500 focus:border-red-500'
const errorTextStyles = 'text-red-500 text-xs leading-none'
const errorContainerStyles = 'min-h-[1rem] pt-1'

export function AddressAutocomplete({
  label,
  error,
  value,
  onChange,
  onAddressSelect,
  placeholder,
  name,
  id,
}: AddressAutocompleteProps) {
  const places = useMapsLibrary('places')
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  // Initialize session token when places library loads
  useEffect(() => {
    if (places) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
    }
  }, [places])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!places || input.length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    try {
      const request: google.maps.places.AutocompleteRequest = {
        input,
        sessionToken: sessionTokenRef.current!,
        includedRegionCodes: ['ca'],
        locationRestriction: new google.maps.LatLngBounds(
          { lat: QUEBEC_BOUNDS.south, lng: QUEBEC_BOUNDS.west },
          { lat: QUEBEC_BOUNDS.north, lng: QUEBEC_BOUNDS.east },
        ),
      }

      const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setActiveIndex(-1)
    } catch {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [places])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  async function handleSelect(suggestion: google.maps.places.AutocompleteSuggestion) {
    const prediction = suggestion.placePrediction
    if (!prediction) return

    // Fetch place details to get the formatted address
    const place = prediction.toPlace()
    await place.fetchFields({ fields: ['formattedAddress'] })
    const address = place.formattedAddress || prediction.text.text

    onAddressSelect(address)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)

    // Reset session token after a selection (per Google billing best practices)
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(baseInputStyles, error && errorInputStyles)}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={isOpen ? `${inputId}-listbox` : undefined}
        aria-activedescendant={activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined}
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const text = suggestion.placePrediction?.text.text
            if (!text) return null
            return (
              <li
                key={text + index}
                id={`${inputId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  'px-4 py-3 cursor-pointer text-secondary-700 text-sm transition-colors',
                  index === activeIndex ? 'bg-primary-50' : 'hover:bg-primary-50',
                )}
                onMouseDown={() => handleSelect(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {text}
              </li>
            )
          })}
        </ul>
      )}

      <div className={errorContainerStyles}>
        {error && <p className={errorTextStyles}>{error}</p>}
      </div>
    </div>
  )
}
