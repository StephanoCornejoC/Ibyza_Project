import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Upload, Building2, AlertCircle, CheckCircle2, FileImage, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { formatPriceUSD } from '@/shared/utils/formatters';
import api from '@/shared/services/api';

/**
 * TransferStep — Paso 2 alternativo: pago por transferencia bancaria.
 *
 * Solicita los datos bancarios al backend mediante:
 *   POST /api/proyectos/<slug>/datos-bancarios/  body: { nombre, email }
 * El endpoint tiene throttle de 5/min/IP. Se maneja error 429 con un mensaje claro
 * y error 400 (datos faltantes) — aunque el flujo ya garantiza que vienen del paso 1.
 */
const TransferStep = ({
  formData,
  department,
  project,
  loading,
  error,
  onSubmitTransfer,
  onBack,
}) => {
  const monto = formData?.monto || department?.precio || 0;

  // Estado de la solicitud de datos bancarios
  const [bank, setBank] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState(null);

  const fetchBankData = useCallback(async () => {
    if (!project?.slug) {
      setBankError('No se pudo identificar el proyecto. Volvé al paso anterior y reintentá.');
      return;
    }
    if (!formData?.nombre || !formData?.email) {
      setBankError('Faltan datos del comprador (nombre / email). Volvé al paso 1 y completá el formulario.');
      return;
    }

    try {
      setBankLoading(true);
      setBankError(null);

      const { data } = await api.post(
        `/api/proyectos/${project.slug}/datos-bancarios/`,
        {
          nombre: `${formData.nombre} ${formData.apellido || ''}`.trim(),
          email: formData.email,
        }
      );

      setBank({
        empresa: data.empresa_receptora || 'IB Y ZA INGENIERIA Y CONSTRUCCION SAC',
        ruc: data.empresa_ruc || '',
        banco: data.empresa_banco || '',
        cuentaSoles: data.cuenta_soles || '',
        cciSoles: data.cci_soles || '',
        cuentaDolares: data.cuenta_dolares || '',
        cciDolares: data.cci_dolares || '',
      });
    } catch (err) {
      // axios interceptor ya devuelve un Error con un mensaje amigable.
      // Detectamos throttle (429) y 400 a partir del status si está disponible.
      const status = err.response?.status;
      const rawMsg = err.message || '';

      if (status === 429 || /429|throttl|too many|demasiad/i.test(rawMsg)) {
        setBankError('Estás haciendo demasiadas solicitudes. Esperá un minuto y volvé a intentar.');
      } else if (status === 400 || /400|nombre|email/i.test(rawMsg)) {
        setBankError('Faltan datos del comprador (nombre / email). Volvé al paso 1 y revisá los campos.');
      } else {
        setBankError(rawMsg || 'No pudimos cargar los datos bancarios. Reintentá.');
      }
    } finally {
      setBankLoading(false);
    }
  }, [project?.slug, formData?.nombre, formData?.apellido, formData?.email]);

  // Pedimos los datos bancarios al montar el step.
  useEffect(() => {
    fetchBankData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(selected.type)) {
      alert('Solo se permiten archivos JPEG, PNG, WebP o PDF.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      alert('El archivo no debe exceder 10 MB.');
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    onSubmitTransfer(file, department?.id);
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <Spinner size="lg" />
        <LoadingText>Enviando comprobante...</LoadingText>
        <LoadingSubtext>No cierres esta ventana</LoadingSubtext>
      </LoadingWrapper>
    );
  }

  return (
    <StepWrapper>
      {/* Datos bancarios: loading / error / data */}
      <BankInfo>
        <BankHeader>
          <Building2 size={18} />
          Datos para transferencia
        </BankHeader>

        {bankLoading && (
          <BankLoadingWrapper>
            <Spinner size="md" />
            <BankLoadingText>Cargando datos bancarios...</BankLoadingText>
          </BankLoadingWrapper>
        )}

        {!bankLoading && bankError && (
          <BankErrorWrapper>
            <AlertCircle size={16} />
            <span>{bankError}</span>
            <RetryButton type="button" onClick={fetchBankData}>
              <RefreshCw size={14} />
              Reintentar
            </RetryButton>
          </BankErrorWrapper>
        )}

        {!bankLoading && !bankError && bank && (
          <BankDetails>
            <BankRow>
              <BankLabel>Empresa</BankLabel>
              <BankValue>{bank.empresa}</BankValue>
            </BankRow>
            {bank.ruc && (
              <BankRow>
                <BankLabel>RUC</BankLabel>
                <BankValue>{bank.ruc}</BankValue>
              </BankRow>
            )}
            {bank.banco && (
              <BankRow>
                <BankLabel>Banco</BankLabel>
                <BankValue>{bank.banco}</BankValue>
              </BankRow>
            )}
            {bank.cuentaSoles && (
              <BankRow>
                <BankLabel>Cuenta corriente (S/)</BankLabel>
                <BankValue $mono>{bank.cuentaSoles}</BankValue>
              </BankRow>
            )}
            {bank.cciSoles && (
              <BankRow>
                <BankLabel>CCI (S/)</BankLabel>
                <BankValue $mono>{bank.cciSoles}</BankValue>
              </BankRow>
            )}
            {bank.cuentaDolares && (
              <BankRow>
                <BankLabel>Cuenta corriente (US$)</BankLabel>
                <BankValue $mono>{bank.cuentaDolares}</BankValue>
              </BankRow>
            )}
            {bank.cciDolares && (
              <BankRow>
                <BankLabel>CCI (US$)</BankLabel>
                <BankValue $mono>{bank.cciDolares}</BankValue>
              </BankRow>
            )}
            <BankRow $total>
              <BankLabel>Monto a depositar</BankLabel>
              <TotalValue>{formatPriceUSD(monto)}</TotalValue>
            </BankRow>
          </BankDetails>
        )}
      </BankInfo>

      {/* Resumen del comprador */}
      <PaymentSummary>
        <SummaryHeader>Resumen</SummaryHeader>
        <SummaryItems>
          <SummaryItem>
            <SummaryKey>Comprador</SummaryKey>
            <SummaryValue>{formData?.nombre} {formData?.apellido}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryKey>Departamento</SummaryKey>
            <SummaryValue>{department?.codigo || '-'}</SummaryValue>
          </SummaryItem>
        </SummaryItems>
      </PaymentSummary>

      {/* Upload de comprobante */}
      <UploadSection>
        <UploadLabel>Sube tu comprobante de transferencia *</UploadLabel>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!file ? (
          <UploadArea onClick={() => fileInputRef.current?.click()}>
            <Upload size={32} />
            <UploadText>Haz clic para seleccionar tu comprobante</UploadText>
            <UploadHint>JPEG, PNG, WebP o PDF (max 10 MB)</UploadHint>
          </UploadArea>
        ) : (
          <FilePreview>
            {preview ? (
              <PreviewImage src={preview} alt="Comprobante" />
            ) : (
              <FileIcon>
                <FileImage size={24} />
              </FileIcon>
            )}
            <FileInfo>
              <FileName>
                <CheckCircle2 size={14} />
                {file.name}
              </FileName>
              <FileSize>{(file.size / 1024).toFixed(0)} KB</FileSize>
            </FileInfo>
            <ChangeBtn onClick={() => fileInputRef.current?.click()}>
              Cambiar
            </ChangeBtn>
          </FilePreview>
        )}
      </UploadSection>

      <InfoNote>
        Tu separación quedará en estado <strong>pendiente</strong> hasta que
        nuestro equipo verifique el comprobante. Te notificaremos por correo.
      </InfoNote>

      {error && (
        <ErrorAlert>
          <AlertCircle size={16} />
          <span>{error}</span>
        </ErrorAlert>
      )}

      <Actions>
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Volver
        </Button>
        <SubmitButton
          onClick={handleSubmit}
          disabled={!file || loading || bankLoading || !!bankError || !bank}
        >
          <Upload size={18} />
          Enviar comprobante
        </SubmitButton>
      </Actions>
    </StepWrapper>
  );
};

const StepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

const LoadingSubtext = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BankInfo = styled.div`
  background: rgba(14,165,233,0.04);
  border: 1px solid rgba(14,165,233,0.2);
  border-radius: 14px;
  overflow: hidden;
`;

const BankHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(14,165,233,0.08);
  color: #38bdf8;
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid rgba(14,165,233,0.15);
`;

const BankLoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const BankLoadingText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BankErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  color: #f87171;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  svg { flex-shrink: 0; }
  span { line-height: 1.5; }
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.3);
  color: ${({ theme }) => theme.colors.gold};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;

  &:hover {
    background: rgba(214,179,112,0.2);
  }
`;

const BankDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const BankRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: ${({ $total }) => $total ? 'rgba(214,179,112,0.05)' : 'transparent'};
  gap: ${({ theme }) => theme.spacing.sm};

  &:last-child { border-bottom: none; }

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  }
`;

const BankLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BankValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  font-family: ${({ $mono, theme }) => $mono ? 'monospace' : theme.fonts.body};
  letter-spacing: ${({ $mono }) => $mono ? '1px' : 'normal'};
  text-align: right;
  word-break: break-word;

  ${({ theme }) => theme.media.mobile} {
    text-align: left;
    letter-spacing: ${({ $mono }) => $mono ? '0.5px' : 'normal'};
  }
`;

const TotalValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PaymentSummary = styled.div`
  background: rgba(214,179,112,0.04);
  border: 1px solid rgba(214,179,112,0.2);
  border-radius: 14px;
  overflow: hidden;
`;

const SummaryHeader = styled.div`
  background: rgba(214,179,112,0.08);
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid rgba(214,179,112,0.15);
`;

const SummaryItems = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-bottom: 1px solid rgba(255,255,255,0.03);
  &:last-child { border-bottom: none; }
`;

const SummaryKey = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SummaryValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: rgba(255,255,255,0.8);
`;

const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UploadLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UploadArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 2px dashed rgba(214,179,112,0.3);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(214,179,112,0.02);

  &:hover {
    border-color: rgba(214,179,112,0.5);
    background: rgba(214,179,112,0.05);
  }

  svg {
    color: ${({ theme }) => theme.colors.gold};
    opacity: 0.6;
  }
`;

const UploadText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gold};
`;

const UploadHint = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid rgba(74,222,128,0.3);
  border-radius: 14px;
  background: rgba(74,222,128,0.04);

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    text-align: center;
  }
`;

const PreviewImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const FileIcon = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.gold};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: #4ade80;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

const ChangeBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(214,179,112,0.4);
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const InfoNote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  background: rgba(14,165,233,0.04);
  border-left: 2px solid rgba(14,165,233,0.35);
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => `0 ${theme.radii.sm} ${theme.radii.sm} 0`};

  strong {
    color: #38bdf8;
    font-weight: 600;
  }
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #f87171;

  svg { flex-shrink: 0; }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column-reverse;
    & > * { width: 100%; }
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #0284c7 100%);
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xxl}`};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  box-shadow: 0 4px 20px rgba(14,165,233,0.4);

  &:hover:not(:disabled) {
    box-shadow: 0 8px 28px rgba(14,165,233,0.5);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default TransferStep;
