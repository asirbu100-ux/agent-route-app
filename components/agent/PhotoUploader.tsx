'use client'

import { useRef, useState } from 'react'
import { getPhotoUploadUrl, confirmPhotoUpload, deletePhoto } from '@/lib/actions/photos'

interface Photo {
  id: string
  storagePath: string
  previewUrl: string
}

interface Props {
  visitId: string
  taskId?: string
  taskDescription?: string
  required?: boolean
  initialPhotos?: { id: string; storage_path: string }[]
  onPhotoAdded?: (taskId?: string) => void
  onPhotoRemoved?: (taskId?: string) => void
}

export default function PhotoUploader({
  visitId,
  taskId,
  taskDescription,
  required = false,
  initialPhotos = [],
  onPhotoAdded,
  onPhotoRemoved,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>(
    initialPhotos.map(p => ({
      id: p.id,
      storagePath: p.storage_path,
      previewUrl: '',
    }))
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const { signedUrl, storagePath } = await getPhotoUploadUrl(visitId, taskId)

      // Upload directly to Supabase Storage
      const res = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      })

      if (!res.ok) throw new Error('Ошибка загрузки файла')

      await confirmPhotoUpload(visitId, storagePath, taskId)

      const previewUrl = URL.createObjectURL(file)
      const newPhoto: Photo = { id: storagePath, storagePath, previewUrl }
      setPhotos(prev => [...prev, newPhoto])
      onPhotoAdded?.(taskId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(photo: Photo) {
    try {
      await deletePhoto(photo.id, photo.storagePath)
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
      onPhotoRemoved?.(taskId)
    } catch {
      setError('Не удалось удалить фото')
    }
  }

  const hasPhoto = photos.length > 0

  return (
    <div className="space-y-2">
      {taskDescription && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">{taskDescription}</p>
          {required && (
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
              {hasPhoto ? '✓ фото' : '📷 обязательно'}
            </span>
          )}
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative w-20 h-20">
              {photo.previewUrl ? (
                <img
                  src={photo.previewUrl}
                  alt="Фото"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                  Фото
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
          required && !hasPhoto
            ? 'border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100'
            : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
        } disabled:opacity-50`}
      >
        <span>{uploading ? 'Загрузка...' : '📷 Добавить фото'}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
