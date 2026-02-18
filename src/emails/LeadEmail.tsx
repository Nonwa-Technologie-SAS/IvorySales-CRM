import * as React from "react";
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
  body: string;
  recipientName: string;
  senderName?: string;
  companyName?: string;
}

export function LeadEmailTemplate({
  subject,
  body,
  recipientName,
  senderName = "Votre équipe commerciale",
  companyName = "Votre CRM",
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

          <Section style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {body || "(Message vide)"}
          </Section>

          <Text style={{ fontSize: 14, marginTop: 24 }}>
            Bien cordialement,
            <br />
            {senderName}
            {companyName ? <><br />{companyName}</> : null}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

