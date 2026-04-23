import { GoalPeriodType } from '@prisma/client';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import { GoalCommercialEmailTemplate } from '@/emails/GoalCommercialEmail';
import { GoalManagementEmailTemplate } from '@/emails/GoalManagementEmail';
import { getPeriodLabel } from '@/lib/goalPeriods';

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

interface GoalEmailPayload {
  companyName: string;
  commercialName: string;
  commercialEmail: string;
  periodType: GoalPeriodType;
  periodStart: Date;
  targetConversions: number;
  targetRevenue: number;
  setByName: string;
  managementRecipients: string[];
}

export async function sendGoalAssignmentEmails(
  payload: GoalEmailPayload,
): Promise<void> {
  const transporter = createTransport();
  const periodLabel = getPeriodLabel(payload.periodType, payload.periodStart);

  const managementRecipients = Array.from(
    new Set(
      payload.managementRecipients
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).filter((email) => email !== payload.commercialEmail.toLowerCase());

  if (managementRecipients.length > 0) {
    const managementHtml = await render(
      GoalManagementEmailTemplate({
        companyName: payload.companyName,
        commercialName: payload.commercialName,
        periodLabel,
        targetConversions: payload.targetConversions,
        targetRevenue: payload.targetRevenue,
        setByName: payload.setByName,
      }),
    );

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: managementRecipients,
      subject: `Objectif commercial defini - ${payload.commercialName} (${periodLabel})`,
      html: managementHtml,
    });
  }

  if (payload.commercialEmail) {
    const commercialHtml = await render(
      GoalCommercialEmailTemplate({
        commercialName: payload.commercialName,
        companyName: payload.companyName,
        periodLabel,
        targetConversions: payload.targetConversions,
        targetRevenue: payload.targetRevenue,
      }),
    );

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: payload.commercialEmail,
      subject: `Votre objectif commercial - ${periodLabel}`,
      html: commercialHtml,
    });
  }
}
