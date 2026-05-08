import { useEffect, useState } from 'react'
import api from '@/shared/services/api'

/**
 * useAvance — Carga el avance de obra para un comprador con código.
 *
 * Endpoint: GET /api/avance/<codigo>/
 *
 * Estados de error normalizados:
 * - 'CODE_NOT_FOUND' → 404 (código inválido o expirado)
 * - 'THROTTLED'      → 429 (rate limit)
 * - 'NETWORK'        → todo lo demás (5xx, sin red, timeout, etc.)
 *
 * Si `codigo` viene vacío o null, no dispara la request.
 */
export default function useAvance(codigo) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!codigo) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setData(null)

    api
      .get(`/api/avance/${encodeURIComponent(codigo)}/`)
      .then((res) => {
        if (cancelled) return
        setData(res.data)
      })
      .catch((err) => {
        if (cancelled) return
        const status = err.status || err.response?.status
        if (status === 404) setError('CODE_NOT_FOUND')
        else if (status === 429) setError('THROTTLED')
        else setError('NETWORK')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [codigo])

  return { data, loading, error }
}
