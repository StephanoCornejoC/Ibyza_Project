import { useState, useCallback } from 'react';
import api from '@/shared/services/api';
import useUIStore from '@/shared/stores/useUIStore';

/**
 * Hook para gestionar el flujo de separación de departamento.
 *
 * Flujo de 3 pasos:
 * 1. Formulario de datos del comprador
 * 2. Pago con Culqi (token generado en el cliente)
 * 3. POST al backend con datos + token → confirmación
 *
 * @returns {{
 *   step: number,
 *   formData: object,
 *   loading: boolean,
 *   error: string|null,
 *   success: boolean,
 *   separationResult: object|null,
 *   goToPayment: (data: object) => void,
 *   processPayment: (culqiToken: string, departmentId: number) => Promise<void>,
 *   reset: () => void,
 * }}
 */
const useSeparation = () => {
  const [step, setStep] = useState(1);     // 1: datos, 2: pago, 3: éxito
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [separationResult, setSeparationResult] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('culqi'); // 'culqi' | 'transferencia'
  const { showToast } = useUIStore();

  const goToPayment = useCallback((data) => {
    setFormData(data);
    setError(null);
    setStep(2);
  }, []);

  const processPayment = useCallback(
    async (culqiToken, departmentId) => {
      if (!formData) return;

      try {
        setLoading(true);
        setError(null);

        const payload = {
          departamento: departmentId,
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          dni: formData.dni,
          monto: formData.monto,
          culqi_token: culqiToken,
        };

        const res = await api.post('/api/pagos/separacion/', payload);

        setSeparationResult(res.data);
        setSuccess(true);
        setStep(3);
        showToast('Separacion exitosa! Te enviamos un correo de confirmacion.', 'success');
      } catch (err) {
        const msg = err.message || 'Error al procesar el pago. Intenta nuevamente.';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [formData, showToast]
  );

  /**
   * Enviar comprobante de transferencia bancaria al backend.
   * El backend registra la separacion como pendiente.
   */
  const processTransfer = useCallback(
    async (file, departmentId) => {
      if (!formData || !file) return;

      try {
        setLoading(true);
        setError(null);

        const fd = new FormData();
        fd.append('departamento', departmentId);
        fd.append('nombre', formData.nombre);
        fd.append('apellido', formData.apellido);
        fd.append('email', formData.email);
        fd.append('telefono', formData.telefono);
        fd.append('dni', formData.dni);
        fd.append('monto', formData.monto);
        fd.append('comprobante', file);

        const res = await api.post('/api/pagos/separacion-transferencia/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setSeparationResult(res.data);
        setSuccess(true);
        setStep(3);
        showToast('Comprobante enviado. Te notificaremos cuando sea verificado.', 'success');
      } catch (err) {
        const msg = err.message || 'Error al enviar el comprobante. Intenta nuevamente.';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [formData, showToast]
  );

  const goBackToForm = useCallback(() => {
    setError(null);
    setStep(1);
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setFormData(null);
    setLoading(false);
    setError(null);
    setSuccess(false);
    setSeparationResult(null);
    setPaymentMethod('culqi');
  }, []);

  return {
    step,
    formData,
    loading,
    error,
    success,
    separationResult,
    paymentMethod,
    setPaymentMethod,
    goToPayment,
    goBackToForm,
    processPayment,
    processTransfer,
    reset,
  };
};

export default useSeparation;
