import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Corps attendu : tableau de lignes issues de l’Excel (mapping côté client).
 *  companyName        -> nom de la société
 *  phone              -> téléphone
 *  firstName          -> colonne "nom" (ex. Nguessan, Zile) → Lead.firstName
 *  lastName           -> colonne "prenoms" (ex. Jean Modeste, Kouassi) → Lead.lastName
 *  receivedBy         -> personne de contact (fallback pour firstName/lastName)
 *  domain             -> domaine d'activités
 *  location           -> localisation / adresse
 *  observation        -> notes libres → Lead.notes
 *  civility           -> civilité (M., Mme...) → Lead.civility
 */
const importRowSchema = z.object({
  companyName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  receivedBy: z.string().optional(),
  domain: z.string().optional(),
  location: z.string().optional(),
  observation: z.string().optional(),
  civility: z.string().optional(),
});

const importBodySchema = z.object({
  leads: z.array(importRowSchema).min(1).max(2000),
});

/** Dérive firstName / lastName à partir de la colonne \"reçu par\"
 *  ou, à défaut, du nom de l’entreprise.
 */
function toFirstLast(
  receivedBy: string | undefined,
  companyName: string,
): { firstName: string; lastName: string } {
  const fallback = (companyName || 'Entreprise').trim();
  if (!receivedBy || !receivedBy.trim()) {
    return { firstName: 'Contact', lastName: fallback };
  }
  const parts = receivedBy.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: fallback };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    console.log('🚀 ~ POST ~ json:', json);
    // 1) Validation du corps JSON (provenant du parsing Excel côté client)
    const { leads: rows } = importBodySchema.parse(json);

    // 2) On récupère (ou crée) une company par défaut au cas où
    const defaultCompany = await prisma.company.findFirst();
    const companyIdFallback =
      defaultCompany?.id ??
      (
        await prisma.company.create({
          data: { name: 'Entreprise démo', plan: 'free' },
        })
      ).id;

    const created: { id: string; firstName: string; lastName: string }[] = [];
    const errors: { row: number; message: string }[] = [];

    // 3) On traite chaque ligne de l’Excel une par une
    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        // 3.a) Normalisation du nom de société
        const companyName = (row.companyName || '').trim() || 'Sans nom';
        // 3.b) On cherche si la company existe déjà (comparaison insensible à la casse)
        let company = await prisma.company.findFirst({
          where: { name: { equals: companyName, mode: 'insensitive' } },
        });
        if (!company) {
          // Si elle n’existe pas encore, on la crée
          company = await prisma.company.create({
            data: { name: companyName, plan: 'free' },
          });
        }
        const companyId = company.id;

        // 3.c) On déduit firstName / lastName :
        //  - en priorité à partir des colonnes "Nom" / "Prénoms" de l'Excel
        //  - sinon en fallback à partir de la colonne "reçu par"
        let firstName = row.firstName?.trim() || '';
        let lastName = row.lastName?.trim() || '';
        if (!firstName && !lastName) {
          const fromReceived = toFirstLast(row.receivedBy, companyName);
          firstName = fromReceived.firstName;
          lastName = fromReceived.lastName;
        } else {
          if (!firstName) firstName = 'Contact';
          if (!lastName) lastName = companyName;
        }
        // 3.d) Construction d’un champ \"source\" lisible en combinant
        //      domaine, localisation et observation (pour l’ancien affichage).
        const sourceParts: string[] = [];
        if (row.domain) sourceParts.push(String(row.domain).trim());
        if (row.location)
          sourceParts.push(`Lieu: ${String(row.location).trim()}`);
        if (row.observation)
          sourceParts.push(`Obs: ${String(row.observation).trim()}`);
        const source = sourceParts.length ? sourceParts.join(' | ') : undefined;

        // 3.e) Création du lead en base : on alimente tous les nouveaux champs
        const lead = await prisma.lead.create({
          data: {
            firstName,
            lastName,
            phone: row.phone?.trim() || null,
            // email directement issu de la colonne \"email\" si présente
            email: row.email?.trim() || null,
            // champ historique pour le front (texte combiné)
            source: source || null,
            // nouveau champ structuré pour le domaine d'activités
            activityDomain: row.domain?.trim() || null,
            // nom de la compagnie \"à plat\" sur le lead
            companyName,
            // localisation utile pour la carte
            location: row.location?.trim() || null,
            // observation envoyée dans les notes du lead
            notes: row.observation?.trim() || null,
            // civilité (M., Mme, etc.) si présente dans l'Excel
            civility: row.civility?.trim() || null,
            status: 'NEW',
            assignedTo: row.receivedBy?.trim() || null,
            companyId,
          },
        });
        created.push({
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
        });
      } catch (err) {
        errors.push({
          row: i + 1,
          message: err instanceof Error ? err.message : 'Erreur inconnue',
        });
      }
    }

    return NextResponse.json({
      created: created.length,
      total: rows.length,
      errors: errors.length ? errors : undefined,
      ids: created.map((c) => c.id),
    });
  } catch (error) {
    console.error('POST /api/leads/import error', error);
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? 'Données invalides'
            : 'Impossible d’importer les leads',
      },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}
