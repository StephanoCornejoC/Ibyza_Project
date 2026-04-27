import { useState, useEffect } from 'react'
import api from '@/shared/services/api'

/**
 * Hook que carga todos los departamentos disponibles (estado='disponible')
 * de TODOS los proyectos activos. Cada item incluye `proyecto` con datos bancarios.
 */
const useDepartamentosDisponibles = () => {
  const [deptos, setDeptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchDeptos = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await api.get('/api/departamentos/disponibles/')
        if (isMounted) {
          // Endpoint pagination_class=None -> array directo
          setDeptos(Array.isArray(data) ? data : data?.results ?? [])
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Error al cargar departamentos')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDeptos()
    return () => { isMounted = false }
  }, [])

  return { deptos, loading, error }
}

export default useDepartamentosDisponibles
