SELECT a.content, COUNT(*) AS total
FROM "Activity" a
JOIN "Lead" l ON (a."leadId" = l.id OR a."relatedTo" = l.id)
WHERE l."assignedTo" IS NULL
GROUP BY a.content
ORDER BY total DESC
LIMIT 20;
