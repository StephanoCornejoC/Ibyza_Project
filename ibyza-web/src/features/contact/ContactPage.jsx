import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Calendar, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { SectionTitle } from '@/shared/components/ui/SectionTitle';
import contactBg from '@/assets/images/bg-contact.png';
import ContactForm from './components/ContactForm';
import AppointmentForm from './components/AppointmentForm';
import useContact from './hooks/useContact';
import useProjects from '@/features/projects/hooks/useProjects';
import useConfiguracion from '@/shared/hooks/useConfiguracion';

/**
 * ContactPage — Sin hero. Contenido directo con transiciones suaves entre tabs.
 */
const ContactPage = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const {
    loading, error,
    contactSuccess, appointmentSuccess,
    sendContact, sendAppointment,
    resetContact, resetAppointment,
  } = useContact();

  // Usamos allProjects (lista completa sin filtrar) para evitar que el filtro
  // aplicado en /proyectos afecte el dropdown de proyecto de interes.
  const { allProjects: projects } = useProjects();
  const { config } = useConfiguracion();

  // Resetear estados de formulario al cambiar de tab
  useEffect(() => {
    resetContact();
    resetAppointment();
  }, [activeTab]);

  const contactInfo = [
    { icon: MapPin, label: 'Direccion', value: config?.direccion || 'Puente Bolivar 205, Umacollo, Arequipa' },
    { icon: Phone, label: 'Telefono', value: config?.telefono || '+51 993 674 174' },
    { icon: Mail, label: 'Correo', value: config?.email || 'ventas@ibyzacorp.com' },
    { icon: Clock, label: 'Horario', value: config?.horario || 'Lun-Vie: 9:00 AM - 6:00 PM | Sab: 9:00 AM - 1:00 PM' },
  ];

  const tabVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <>
      <Helmet>
        <title>Contacto | IBYZA</title>
        <meta
          name="description"
          content="Contactanos o agenda una visita a nuestros proyectos. Estamos para ayudarte."
        />
      </Helmet>

      <PageWrapper>
        <PageOverlay />
        <PageContent>
        {/* Titulo integrado sin hero */}
        <TitleArea>
          <SectionTitle
            eyebrow="Estamos aqui"
            title="Contactanos"
            subtitle="Escribenos o agenda una visita. Un asesor especializado te atendera."
            light
          />
        </TitleArea>

        <ContentGrid>
          {/* Panel izquierdo: info de contacto */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InfoPanel>
              <InfoTitle>Informacion de contacto</InfoTitle>
              <GoldLine />
              <InfoList>
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <InfoItem key={item.label}>
                      <InfoIconWrapper>
                        <Icon size={18} />
                      </InfoIconWrapper>
                      <InfoItemContent>
                        <InfoItemLabel>{item.label}</InfoItemLabel>
                        <InfoItemValue>{item.value}</InfoItemValue>
                      </InfoItemContent>
                    </InfoItem>
                  );
                })}
              </InfoList>

              {(() => {
                const disponibles = (projects || []).filter(p => p.estado !== 'vendido');
                return disponibles.length > 0 && (
                  <ProjectsPreview>
                    <ProjectsTitle>— Proyectos de interes —</ProjectsTitle>
                    {disponibles.map((p) => (
                      <ProjectItem key={p.id}>{p.nombre} — {p.estado_display}</ProjectItem>
                    ))}
                  </ProjectsPreview>
                );
              })()}
            </InfoPanel>
          </motion.div>

          {/* Panel derecho: formularios con tabs + transicion */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FormPanel>
              <TabsRow>
                <Tab
                  $active={activeTab === 'contact'}
                  onClick={() => setActiveTab('contact')}
                >
                  <MessageCircle size={16} />
                  Enviar mensaje
                </Tab>
                <Tab
                  $active={activeTab === 'appointment'}
                  onClick={() => setActiveTab('appointment')}
                >
                  <Calendar size={16} />
                  Agendar visita
                </Tab>
              </TabsRow>

              <FormArea>
                <AnimatePresence mode="wait">
                  {activeTab === 'contact' && (
                    <motion.div
                      key="contact"
                      variants={tabVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <ContactForm
                        onSubmit={sendContact}
                        loading={loading}
                        error={error}
                        success={contactSuccess}
                        onReset={resetContact}
                        projects={projects}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'appointment' && (
                    <motion.div
                      key="appointment"
                      variants={tabVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <AppointmentForm
                        onSubmit={sendAppointment}
                        loading={loading}
                        error={error}
                        success={appointmentSuccess}
                        onReset={resetAppointment}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormArea>
            </FormPanel>
          </motion.div>
        </ContentGrid>

        {/* Mapa */}
        <MapSection
          as={motion.div}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MapTitle>
            <MapPin size={18} />
            Encuentranos
          </MapTitle>
          <MapContainer>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.549!2d-71.5366!3d-16.3981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91424a5be3b2c3c5%3A0x1234567890abcdef!2sPuente+Bol%C3%ADvar+205%2C+Arequipa!5e0!3m2!1ses!2spe!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicacion de IBYZA"
            />
          </MapContainer>
        </MapSection>
      </PageContent>
      </PageWrapper>
    </>
  );
};

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: url(${contactBg});
  background-size: cover;
  background-position: center top;
  background-attachment: fixed;
  overflow: hidden;
`;

const PageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(8,19,31,0.88) 0%,
    rgba(8,19,31,0.85) 40%,
    rgba(8,19,31,0.92) 70%,
    ${({ theme }) => theme.colors.deepBg} 100%
  );
  z-index: 0;
  pointer-events: none;
`;

const PageContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};
  padding-top: calc(80px + ${({ theme }) => theme.spacing.section});

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
    padding-top: calc(70px + ${({ theme }) => theme.spacing.xxl});
  }

  ${({ theme }) => theme.media.mobile} {
    padding-top: calc(64px + ${({ theme }) => theme.spacing.xl});
  }
`;

const TitleArea = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  align-items: start;

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const InfoPanel = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.glass.shadow};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const InfoTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const GoldLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  opacity: 0.5;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const InfoItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InfoIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.2);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoItemContent = styled.div``;

const InfoItemLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const InfoItemValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: rgba(255,255,255,0.75);
`;

const ProjectsPreview = styled.div`
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const ProjectsTitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProjectItem = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => `${theme.spacing.xs} 0`};
  border-bottom: 1px solid ${({ theme }) => theme.glass.border};
  &:last-child { border-bottom: none; }
`;

const FormPanel = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  box-shadow: ${({ theme }) => theme.glass.shadow};
  overflow: hidden;
`;

const TabsRow = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.glass.border};
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.gold : theme.colors.textSecondary};
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.gold : 'transparent')};
  background: ${({ $active }) =>
    $active ? 'rgba(214,179,112,0.05)' : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.gold};
    background: rgba(255,255,255,0.03);
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const FormArea = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  min-height: 400px;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    min-height: auto;
  }
`;

const MapSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.section};

  ${({ theme }) => theme.media.tablet} {
    margin-top: ${({ theme }) => theme.spacing.xxxl};
  }
`;

const MapTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  svg { opacity: 0.7; }

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.25rem;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.glass.border};
  box-shadow: ${({ theme }) => theme.glass.shadow};
  iframe { display: block; width: 100%; height: 100%; }
  ${({ theme }) => theme.media.tablet} { height: 300px; }
  ${({ theme }) => theme.media.mobile} { height: 240px; }
`;

export default ContactPage;
