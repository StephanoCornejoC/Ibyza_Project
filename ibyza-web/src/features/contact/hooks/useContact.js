import { useState, useCallback } from 'react';
import api from '@/shared/services/api';
import useUIStore from '@/shared/stores/useUIStore';

/**
 * Hook para manejar el envío de formularios de contacto.
 * Soporta tanto contacto general como solicitud de citas.
 */
const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const { showToast } = useUIStore();

  /**
   * Envía el formulario de contacto general.
   * POST /api/contacto/
   *
   * @param {object} data - Datos del formulario (validados por Zod)
   */
  const sendContact = useCallback(
    async (data) => {
      try {
        setLoading(true);
        setError(null);
        await api.post('/api/contacto/', data);
        setContactSuccess(true);
        showToast('Mensaje enviado. Te responderemos pronto.', 'success');
      } catch (err) {
        const msg = err.message || 'No se pudo enviar el mensaje. Intenta nuevamente.';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  /**
   * Envía la solicitud de cita/visita.
   * POST /api/contacto/citas/
   *
   * @param {object} data - Datos del formulario de cita
   */
  const sendAppointment = useCallback(
    async (data) => {
      try {
        setLoading(true);
        setError(null);
        await api.post('/api/contacto/citas/', data);
        setAppointmentSuccess(true);
        showToast('Cita solicitada. Un asesor confirmará pronto.', 'success');
      } catch (err) {
        const msg = err.message || 'No se pudo enviar la solicitud. Intenta nuevamente.';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const resetContact = useCallback(() => {
    setContactSuccess(false);
    setError(null);
  }, []);

  const resetAppointment = useCallback(() => {
    setAppointmentSuccess(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    contactSuccess,
    appointmentSuccess,
    sendContact,
    sendAppointment,
    resetContact,
    resetAppointment,
  };
};

export default useContact;
