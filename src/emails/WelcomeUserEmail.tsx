import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeUserEmailProps {
  recipientName: string;
  companyName?: string;
  email: string;
  temporaryPassword: string;
}

export function WelcomeUserEmailTemplate({
  recipientName,
  companyName = 'Votre CRM',
  email,
  temporaryPassword,
}: WelcomeUserEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue - identifiants de connexion</Preview>
      <Body
        style={{ backgroundColor: '#f3f4f6', margin: 0, padding: '24px 0' }}
      >
        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 24,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            color: '#111827',
          }}
        >
          <Heading as='h2' style={{ fontSize: 20, marginBottom: 12 }}>
            Bienvenue sur {companyName}
          </Heading>
          <Text style={{ fontSize: 14, marginBottom: 12 }}>
            Bonjour {recipientName},
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
            Votre compte a ete cree. Connectez-vous avec les identifiants
            temporaires ci-dessous, puis changez immediatement votre mot de
            passe a la premiere connexion.
          </Text>

          <Section
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
          >
            <Text style={{ fontSize: 14, margin: '0 0 8px 0' }}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={{ fontSize: 14, margin: 0 }}>
              <strong>Mot de passe temporaire:</strong> {temporaryPassword}
            </Text>
          </Section>

          <Text style={{ fontSize: 13, color: '#374151', marginTop: 20 }}>
            Pour des raisons de securite, l&apos;application vous obligera a
            definir un nouveau mot de passe avant d&apos;acceder au reste des
            pages.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
