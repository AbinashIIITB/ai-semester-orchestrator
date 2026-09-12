-- Supabase Free Tier Keep-Alive Script
-- The Supabase free tier pauses projects after 1 week of inactivity.
-- This script sets up a pg_cron job to ping the database daily.

-- Ensure pg_cron extension is enabled (Supabase enables this by default, but it's good practice)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a dummy table for the ping if you want to log it, or just run a simple select.
-- We'll use a simple select statement that runs every day at midnight (UTC).
-- Cron format: 'Minute Hour DayOfMonth Month DayOfWeek'

-- Note: The cron.schedule function requires the job name and the cron expression.
SELECT cron.schedule(
    'keep-alive-ping',      -- Name of the cron job
    '0 0 * * *',           -- Every day at 00:00 UTC
    'SELECT 1;'             -- A simple query that counts as activity
);

-- To verify the job was created, you can run:
-- SELECT * FROM cron.job;

-- To unschedule the job later if needed:
-- SELECT cron.unschedule('keep-alive-ping');
