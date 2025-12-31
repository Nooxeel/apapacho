'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Navbar } from '@/components/layout'
import { Button } from '@/components/ui'
import { InterestSelector } from '@/components/interests'
import { interestsApi } from '@/lib/api'
import type { Interest } from '@/types'

export default function InterestsSettingsPage() {
  const router = useRouter()
  const { user, token, hasHydrated } = useAuthStore()
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isCreator = user?.isCreator || false
  const minInterests = isCreator ? 5 : 3
  const maxInterests = isCreator ? 15 : 10

  useEffect(() => {
    if (!hasHydrated) return

    if (!token) {
      router.push('/login')
      return
    }

    loadMyInterests()
  }, [token, hasHydrated, router, isCreator])

  const loadMyInterests = async () => {
    try {
      setLoading(true)
      setError(null)

      const interests = isCreator
        ? await interestsApi.getMyCreatorInterests(token!)
        : await interestsApi.getMyInterests(token!)

      setSelectedInterests(interests)
    } catch (err) {
      console.error('Error loading interests:', err)
      setError('Error al cargar tus intereses')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (selectedInterests.length < minInterests) {
      setError(`Debes seleccionar al menos ${minInterests} intereses`)
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const interestIds = selectedInterests.map(i => i.id)

      // Get current interests
      const currentInterests = isCreator
        ? await interestsApi.getMyCreatorInterests(token!)
        : await interestsApi.getMyInterests(token!)

      const currentIds = currentInterests.map(i => i.id)

      // Find interests to add
      const toAdd = interestIds.filter(id => !currentIds.includes(id))

      // Find interests to remove
      const toRemove = currentIds.filter(id => !interestIds.includes(id))

      // Add new interests
      if (toAdd.length > 0) {
        if (isCreator) {
          await interestsApi.addMyCreatorInterests(toAdd, token!)
        } else {
          await interestsApi.addMyInterests(toAdd, token!)
        }
      }

      // Remove old interests
      for (const interestId of toRemove) {
        try {
          if (isCreator) {
            await interestsApi.removeMyCreatorInterest(interestId, token!)
          } else {
            await interestsApi.removeMyInterest(interestId, token!)
          }
        } catch (err) {
          // Ignore errors for removing (might be due to minimum constraint)
          console.warn('Could not remove interest:', err)
        }
      }

      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push(isCreator ? '/creator/edit' : '/dashboard')
      }, 1500)
    } catch (err: any) {
      console.error('Error saving interests:', err)
      setError(err.message || 'Error al guardar los intereses')
    } finally {
      setSaving(false)
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
            {isCreator ? 'Intereses del Perfil' : 'Mis Intereses'}
          </h1>
          <p className="text-white/60">
            {isCreator
              ? 'Selecciona los temas que representan tu contenido para que los fans te encuentren más fácilmente'
              : 'Selecciona tus intereses para descubrir creadores relevantes'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <p className="text-green-300">¡Intereses guardados correctamente!</p>
          </div>
        )}

        {/* Interest Selector */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <InterestSelector
            selectedInterests={selectedInterests}
            onSelectionChange={setSelectedInterests}
            minInterests={minInterests}
            maxInterests={maxInterests}
            mode={isCreator ? 'creator' : 'user'}
            showNSFW={isCreator}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving || selectedInterests.length < minInterests}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
