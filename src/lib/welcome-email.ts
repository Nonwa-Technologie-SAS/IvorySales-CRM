import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import { WelcomeUserEmailTemplate } from '@/emails/WelcomeUserEmail';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      'Configuration SMTP manquante (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)',
    );
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    auth: { user, pass },
  });
}

interface SendWelcomeEmailInput {
  recipientName: string;
  recipientEmail: string;
  temporaryPassword: string;
  companyName?: string;
}

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput,
): Promise<void> {
  const transporter = createTransport();
  const html = await render(
    WelcomeUserEmailTemplate({
      recipientName: input.recipientName,
      companyName: input.companyName,
      email: input.recipientEmail,
      temporaryPassword: input.temporaryPassword,
    }),
  );

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: input.recipientEmail,
    subject: 'Bienvenue - Vos identifiants temporaires',
    html,
  });
}
