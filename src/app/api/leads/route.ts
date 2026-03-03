import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.string().optional(),
  civility: z.string().optional(),
  activityDomain: z.string().optional(),
  companyName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  // on reste aligné avec l'enum LeadStatus du schema Prisma
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'])
    .optional(),
  assignedTo: z.string().optional(),
  companyId: z.string().optional(),
  // Identifiants des produits/services qui intéressent ce prospect
  productIds: z.array(z.string()).optional(),
  serviceIds: z.array(z.string()).optional(),
});

const updateLeadSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.string().optional(),
  civility: z.string().optional(),
  activityDomain: z.string().optional(),
  companyName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'])
    .optional(),
  assignedTo: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  serviceIds: z.array(z.string()).optional(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');
    const sourceParam = url.searchParams.get('source');
    const assignedToParam = url.searchParams.get('assignedTo');
    const createdFromParam = url.searchParams.get('createdFrom');
    const createdToParam = url.searchParams.get('createdTo');
    const staleDaysParam = url.searchParams.get('staleDays');
    const takeParam = url.searchParams.get('take');
    const skipParam = url.searchParams.get('skip');

    const where: any = {};
    const andConditions: any[] = [];

    if (statusParam) {
      const statuses = statusParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length) {
        where.status = { in: statuses };
      }
    }

    if (sourceParam) {
      where.source = {
        contains: sourceParam,
        mode: 'insensitive',
      };
    }

    if (assignedToParam) {
      where.assignedTo = assignedToParam;
    }

    if (createdFromParam || createdToParam) {
      const createdAt: { gte?: Date; lte?: Date } = {};
      if (createdFromParam) {
        const from = new Date(createdFromParam);
        if (!Number.isNaN(from.getTime())) {
          createdAt.gte = from;
        }
      }
      if (createdToParam) {
        const to = new Date(createdToParam);
        if (!Number.isNaN(to.getTime())) {
          // Inclure toute la journée
          to.setHours(23, 59, 59, 999);
          createdAt.lte = to;
        }
      }
      if (createdAt.gte || createdAt.lte) {
        where.createdAt = createdAt;
      }
    }

    const staleDays = staleDaysParam ? Number.parseInt(staleDaysParam, 10) : NaN;
    if (Number.isFinite(staleDays) && staleDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - staleDays);
      // Leads sans activité récente : aucune activité avec date >= cutoff
      andConditions.push({
        NOT: {
          activities: {
            some: {
              date: {
                gte: cutoff,
              },
            },
          },
        },
      });
    }

    if (andConditions.length) {
      where.AND = andConditions;
    }

    const take =
      takeParam && !Number.isNaN(Number.parseInt(takeParam, 10))
        ? Math.min(Number.parseInt(takeParam, 10), 200)
        : undefined;
    const skip =
      skipParam && !Number.isNaN(Number.parseInt(skipParam, 10))
        ? Math.max(0, Number.parseInt(skipParam, 10))
        : undefined;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('GET /api/leads error', error);
    return NextResponse.json(
      { error: 'Unable to fetch leads' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = createLeadSchema.parse(json);

    // Comme pour les users, on rattache le lead à une company par défaut si besoin
    let companyId = body.companyId;
    if (!companyId) {
      const existing = await prisma.company.findFirst();
      const company =
        existing ??
        (await prisma.company.create({
          data: { name: 'Entreprise démo', plan: 'free' },
        }));
      companyId = company.id;
    }

    const lead = await prisma.lead.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        email: body.email,
        source: body.source,
        civility: body.civility,
        activityDomain: body.activityDomain,
        companyName: body.companyName,
        location: body.location,
        notes: body.notes,
        status: body.status,
        assignedTo: body.assignedTo,
        products: body.productIds && body.productIds.length
          ? {
              connect: body.productIds.map((id) => ({ id })),
            }
          : undefined,
        services: body.serviceIds && body.serviceIds.length
          ? {
              connect: body.serviceIds.map((id) => ({ id })),
            }
          : undefined,
        companyId,
      },
    });

    // Création automatique d'une tâche d'agenda à la création du lead
    if (process.env.AUTO_AGENDA_ON_LEAD_CREATE === 'true') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      try {
        await prisma.agendaItem.create({
          data: {
            leadId: lead.id,
            title: 'Appeler le prospect',
            dueDate,
            status: 'TODO',
          },
        });
      } catch (e) {
        // On ne bloque pas la création du lead si l'agenda échoue
        console.error('Erreur création AgendaItem auto pour lead', e);
      }
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads error', error);
    return NextResponse.json(
      { error: 'Unable to create lead' },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const json = await req.json();
    const body = updateLeadSchema.parse(json);

    const lead = await prisma.lead.update({
      where: { id: body.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        email: body.email,
        source: body.source,
        civility: body.civility,
        activityDomain: body.activityDomain,
        companyName: body.companyName,
        location: body.location,
        notes: body.notes,
        status: body.status,
        assignedTo: body.assignedTo,
        // si fourni, on remplace complètement les associations
        products: body.productIds
          ? {
              set: body.productIds.map((id) => ({ id })),
            }
          : undefined,
        services: body.serviceIds
          ? {
              set: body.serviceIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('PATCH /api/leads error', error);
    return NextResponse.json(
      { error: 'Unable to update lead' },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/leads error', error);
    return NextResponse.json(
      { error: 'Unable to delete lead' },
      { status: 500 },
    );
  }
}
