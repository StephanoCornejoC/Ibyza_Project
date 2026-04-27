import { useState, useEffect } from 'react'
import api from '@/shared/services/api'

/**
 * useConfiguracion — Hook para obtener la configuracion global del sitio.
 * Cachea en sessionStorage para evitar peticiones repetidas.
 */
const CACHE_KEY = 'ibyza_config'

const useConfiguracion = () => {
  const [config, setConfig] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(!config)

  useEffect(() => {
    if (config) return

    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/api/configuracion/')
        setConfig(data)
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
      } catch (err) {
        console.warn('[useConfiguracion] No se pudo cargar la configuracion:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [config])

  return { config, loading }
}

export default useConfiguracion
