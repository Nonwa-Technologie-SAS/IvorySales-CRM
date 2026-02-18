// Options par défaut réutilisables pour les leads
// Sources, domaines d'activités, civilités

export const DEFAULT_LEAD_SOURCES = [
  "Non renseigné",
  "Facebook",
  "WhatsApp",
  "Site web",
  "Bouche-à-oreille",
  "Email",
  "Partenaires",
  "Salon / évènement",
  "Recommandation client",
  "Appel entrant",
  "Prospection terrain",
  "Autre",
] as const;

export const DEFAULT_ACTIVITY_DOMAINS = [
  "BTP / Construction",
  "Agroalimentaire",
  "Commerce & distribution",
  "Industrie",
  "Services",
  "Transport & logistique",
  "Immobilier",
  "Banque / Assurance",
  "Éducation / Formation",
  "Santé",
  "Technologie / IT",
  "Administration / ONG",
  "Autre",
] as const;

export const DEFAULT_CIVILITIES = [
  "M.",
  "Mme",
  "Mlle",
  "Dr",
  "Pr",
] as const;

