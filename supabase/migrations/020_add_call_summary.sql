-- Add summary field to call_logs for display in conversations timeline
ALTER TABLE call_logs ADD COLUMN summary TEXT;
