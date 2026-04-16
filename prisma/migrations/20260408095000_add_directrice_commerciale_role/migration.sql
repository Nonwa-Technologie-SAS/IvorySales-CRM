-- Add new enum value for Role
-- This is safe to run multiple times (IF NOT EXISTS).
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DIRECTRICE_COMMERCIALE';

