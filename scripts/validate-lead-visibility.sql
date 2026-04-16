-- 1) Leads non assignés restants
SELECT COUNT(*) AS total_null_assigned
FROM "Lead"
WHERE "assignedTo" IS NULL;

-- 2) Leads non assignés qui ont une activité de création/import exploitable
SELECT COUNT(DISTINCT l.id) AS legacy_with_creation_activity
FROM "Lead" l
JOIN "Activity" a ON (a."leadId" = l.id OR a."relatedTo" = l.id)
WHERE l."assignedTo" IS NULL
  AND a."type" = 'NOTE'
  AND (
    a."content" ILIKE '%Lead créé manuellement%'
    OR a."content" ILIKE '%Lead cree manuellement%'
    OR a."content" ILIKE '%Lead importé via Excel%'
    OR a."content" ILIKE '%Lead importe via Excel%'
  );

-- 3) Aperçu des leads legacy avec activité de création/import (si présents)
SELECT DISTINCT l.id AS lead_id, l."companyId", a."userId" AS creator_user_id, a."date" AS creator_activity_date
FROM "Lead" l
JOIN "Activity" a ON (a."leadId" = l.id OR a."relatedTo" = l.id)
WHERE l."assignedTo" IS NULL
  AND a."type" = 'NOTE'
  AND (
    a."content" ILIKE '%Lead créé manuellement%'
    OR a."content" ILIKE '%Lead cree manuellement%'
    OR a."content" ILIKE '%Lead importé via Excel%'
    OR a."content" ILIKE '%Lead importe via Excel%'
  )
ORDER BY a."date" ASC
LIMIT 20;
