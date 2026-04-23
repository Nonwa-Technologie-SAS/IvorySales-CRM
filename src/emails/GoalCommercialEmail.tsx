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

interface GoalCommercialEmailProps {
  commercialName: string;
  companyName: string;
  periodLabel: string;
  targetConversions: number;
  targetRevenue: number;
}

export function GoalCommercialEmailTemplate({
  commercialName,
  companyName,
  periodLabel,
  targetConversions,
  targetRevenue,
}: GoalCommercialEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre objectif commercial a ete defini</Preview>
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
            Nouvel objectif assigne
          </Heading>
          <Text style={{ fontSize: 14, marginBottom: 10 }}>
            Bonjour {commercialName},
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
            Votre objectif commercial pour {companyName} a ete defini. Merci de
            suivre cet objectif sur la periode indiquee.
          </Text>
          <Section
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
          >
            <Text style={{ fontSize: 14, margin: '0 0 8px 0' }}>
              <strong>Periode:</strong> {periodLabel}
            </Text>
            <Text style={{ fontSize: 14, margin: '0 0 8px 0' }}>
              <strong>Objectif conversions:</strong> {targetConversions}
            </Text>
            <Text style={{ fontSize: 14, margin: 0 }}>
              <strong>Objectif chiffre d affaires:</strong>{' '}
              {targetRevenue.toLocaleString('fr-FR')}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
