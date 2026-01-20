'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { LeadPhoto } from '@/types/lead'

interface PhotoGalleryProps {
  photos: LeadPhoto[]
  leadId: string
  initialIndex?: number
  onClose?: () => void
  editable?: boolean
  onUpload?: (photo: LeadPhoto) => void
  onDelete?: (photoId: string) => void
}

export function PhotoGallery({
  photos,
  leadId,
  initialIndex,
  onClose,
  editable = false,
  onUpload,
  onDelete,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(initialIndex ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('lead-photos').getPublicUrl(storagePath)
    return data.publicUrl
  }

  const goToPrev = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null))
  }, [photos.length])

  const goToNext = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i + 1) % photos.length : null))
  }, [photos.length])

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null)
    onClose?.()
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, goToPrev, goToNext, closeLightbox])

  // Update selectedIndex when initialIndex changes (for external control)
  useEffect(() => {
    if (initialIndex !== undefined) {
      setSelectedIndex(initialIndex)
    }
  }, [initialIndex])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !onUpload) return

    setIsUploading(true)

    for (const file of Array.from(files)) {
      const fileName = `${leadId}/${Date.now()}-${file.name}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('lead-photos')
        .upload(fileName, file, {
          contentType: file.type,
        })

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        continue
      }

      // Create database record
      const { data: photoRecord, error: insertError } = await supabase
        .from('lead_photos')
        .insert({
          lead_id: leadId,
          storage_path: fileName,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating photo record:', insertError)
        // Try to clean up the uploaded file
        await supabase.storage.from('lead-photos').remove([fileName])
        continue
      }

      onUpload(photoRecord as LeadPhoto)
    }

    setIsUploading(false)
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string, storagePath: string) => {
    if (!onDelete) return

    setIsDeleting(true)

    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from('lead-photos')
      .remove([storagePath])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      setIsDeleting(false)
      setDeleteConfirmId(null)
      return
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('lead_photos')
      .delete()
      .eq('id', photoId)

    if (dbError) {
      console.error('Error deleting photo record:', dbError)
      setIsDeleting(false)
      setDeleteConfirmId(null)
      return
    }

    onDelete(photoId)
    setIsDeleting(false)
    setDeleteConfirmId(null)
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative group">
            <button
              onClick={() => setSelectedIndex(index)}
              className="aspect-square w-full rounded-lg overflow-hidden bg-secondary-100 hover:opacity-80 transition-opacity"
            >
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.original_filename || 'Lead photo'}
                className="w-full h-full object-cover"
              />
            </button>

            {/* Delete button overlay */}
            {editable && onDelete && (
              <>
                {deleteConfirmId === photo.id ? (
                  <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                    <span className="text-white text-xs text-center">Delete?</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(photo.id, photo.storage_path)}
                        disabled={isDeleting}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? '...' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-secondary-500 hover:bg-secondary-600 text-white text-xs rounded transition-colors"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirmId(photo.id)
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add photo button */}
        {editable && onUpload && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-lg border-2 border-dashed border-secondary-300 hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center gap-1 text-secondary-400 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Empty state */}
      {photos.length === 0 && !editable && (
        <div className="text-sm text-secondary-500 py-4">
          No photos uploaded
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Previous button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image */}
            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={getPhotoUrl(photos[selectedIndex].storage_path)}
              alt={photos[selectedIndex].original_filename || 'Full size photo'}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Counter */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                {selectedIndex + 1} / {photos.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Standalone lightbox component for use in LeadRow
export function PhotoLightbox({
  photos,
  selectedIndex,
  onClose,
  onPrev,
  onNext,
}: {
  photos: LeadPhoto[]
  selectedIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const supabase = createClient()

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('lead-photos').getPublicUrl(storagePath)
    return data.publicUrl
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPrev, onNext, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Previous button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <motion.img
        key={selectedIndex}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        src={getPhotoUrl(photos[selectedIndex].storage_path)}
        alt={photos[selectedIndex].original_filename || 'Full size photo'}
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
          {selectedIndex + 1} / {photos.length}
        </div>
      )}
    </motion.div>
  )
}
