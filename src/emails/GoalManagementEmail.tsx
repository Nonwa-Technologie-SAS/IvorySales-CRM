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

interface GoalManagementEmailProps {
  companyName: string;
  commercialName: string;
  periodLabel: string;
  targetConversions: number;
  targetRevenue: number;
  setByName: string;
}

export function GoalManagementEmailTemplate({
  companyName,
  commercialName,
  periodLabel,
  targetConversions,
  targetRevenue,
  setByName,
}: GoalManagementEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Objectif commercial defini ou mis a jour</Preview>
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
            Objectif commercial - {companyName}
          </Heading>
          <Text style={{ fontSize: 14, marginBottom: 10 }}>
            Un objectif a ete defini ou mis a jour pour le commercial{' '}
            <strong>{commercialName}</strong>.
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
          <Text style={{ fontSize: 13, color: '#374151', marginTop: 18 }}>
            Definition effectuee par: {setByName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
