-- Remove from_address and to_address columns from email_logs
-- Email address is derived from customer relationship (matching SMS and call logs pattern)
ALTER TABLE email_logs DROP COLUMN from_address;
ALTER TABLE email_logs DROP COLUMN to_address;
