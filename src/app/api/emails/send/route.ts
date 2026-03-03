import { NextResponse } from "next/server";
import { z } from "zod";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { LeadEmailTemplate } from "@/emails/LeadEmail";

const sendEmailSchema = z.object({
  leadId: z.string().min(1),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  recipientName: z.string().optional(),
});

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Configuration SMTP manquante (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)",
    );
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    auth: { user, pass },
  });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = sendEmailSchema.parse(json);

    const lead = await prisma.lead.findUnique({
      where: { id: body.leadId },
      include: { company: true },
    });
    if (!lead) {
      return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
    }

    const html = await render(
      LeadEmailTemplate({
        subject: body.subject,
        body: body.body,
        recipientName: body.recipientName || `${lead.firstName} ${lead.lastName}`,
        companyName: lead.company?.name,
      }),
    );

    const transporter = createTransport();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: body.to,
      subject: body.subject,
      html,
    });

    const activity = await prisma.activity.create({
      data: {
        type: "EMAIL",
        relatedTo: "LEAD",
        leadId: body.leadId,
        userId: (await prisma.user.findFirst())!.id,
        content: `Subject: ${body.subject}\n\n${body.body}`,
      },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(" ; ") },
        { status: 400 },
      );
    }
    console.error("POST /api/emails/send error", error);
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email" },
      { status: 500 },
    );
  }
}

