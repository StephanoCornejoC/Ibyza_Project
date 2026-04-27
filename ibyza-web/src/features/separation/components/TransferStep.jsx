import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, Building2, AlertCircle, CheckCircle2, FileImage } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { formatPriceUSD } from '@/shared/utils/formatters';

/**
 * TransferStep — Paso 2 alternativo: pago por transferencia bancaria.
 * Muestra datos bancarios + upload de comprobante.
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

  // Datos bancarios dinámicos del proyecto (cargados desde admin)
  const bank = {
    empresa: project?.empresa_receptora || 'IB Y ZA INGENIERIA Y CONSTRUCCION SAC',
    ruc: project?.empresa_ruc || '20606454776',
    banco: project?.empresa_banco || 'BCP - Banco de Crédito del Perú',
    cuentaSoles: project?.cuenta_soles || '215-4217314-0-47',
    cciSoles: project?.cci_soles || '002-21500421731404728',
    cuentaDolares: project?.cuenta_dolares || '215-9294966-1-69',
    cciDolares: project?.cci_dolares || '002-21500929496616925',
  };
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validar tipo
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(selected.type)) {
      alert('Solo se permiten archivos JPEG, PNG, WebP o PDF.');
      return;
    }

    // Validar tamanio (10 MB)
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
      {/* Datos bancarios */}
      <BankInfo>
        <BankHeader>
          <Building2 size={18} />
          Datos para transferencia
        </BankHeader>
        <BankDetails>
          <BankRow>
            <BankLabel>Empresa</BankLabel>
            <BankValue>{bank.empresa}</BankValue>
          </BankRow>
          <BankRow>
            <BankLabel>RUC</BankLabel>
            <BankValue>{bank.ruc}</BankValue>
          </BankRow>
          <BankRow>
            <BankLabel>Banco</BankLabel>
            <BankValue>{bank.banco}</BankValue>
          </BankRow>
          <BankRow>
            <BankLabel>Cuenta corriente (S/)</BankLabel>
            <BankValue $mono>{bank.cuentaSoles}</BankValue>
          </BankRow>
          <BankRow>
            <BankLabel>CCI (S/)</BankLabel>
            <BankValue $mono>{bank.cciSoles}</BankValue>
          </BankRow>
          <BankRow>
            <BankLabel>Cuenta corriente (US$)</BankLabel>
            <BankValue $mono>{bank.cuentaDolares}</BankValue>
          </BankRow>
          <BankRow>
            <BankLabel>CCI (US$)</BankLabel>
            <BankValue $mono>{bank.cciDolares}</BankValue>
          </BankRow>
          <BankRow $total>
            <BankLabel>Monto a depositar</BankLabel>
            <TotalValue>{formatPriceUSD(monto)}</TotalValue>
          </BankRow>
        </BankDetails>
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
        Tu separacion quedara en estado <strong>pendiente</strong> hasta que
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
        <SubmitButton onClick={handleSubmit} disabled={!file || loading}>
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
