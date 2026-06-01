import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

interface LeadEmailProps {
  subject: string;
  /** HTML déjà sanitizé côté serveur */
  bodyHtml: string;
  recipientName: string;
  senderName?: string;
  companyName?: string;
  /** Masque le bloc « Bien cordialement » si la signature personnalisée est dans bodyHtml */
  hideDefaultClosing?: boolean;
}

export function LeadEmailTemplate({
  subject,
  bodyHtml,
  recipientName,
  senderName = "Votre équipe commerciale",
  companyName = "Votre CRM",
  hideDefaultClosing = false,
}: LeadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ backgroundColor: "#f3f4f6", margin: 0, padding: "24px 0" }}>
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: 24,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            color: "#111827",
          }}
        >
          <Heading
            as="h2"
            style={{
              fontSize: 20,
              marginBottom: 12,
              color: "#111827",
            }}
          >
            {subject}
          </Heading>

          <Text style={{ fontSize: 14, marginBottom: 12 }}>
            Bonjour {recipientName || ","}
          </Text>

          <Section
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#111827",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </Section>

          {!hideDefaultClosing ? (
            <Text style={{ fontSize: 14, marginTop: 24 }}>
              Bien cordialement,
              <br />
              {senderName}
              {companyName ? (
                <>
                  <br />
                  {companyName}
                </>
              ) : null}
            </Text>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
