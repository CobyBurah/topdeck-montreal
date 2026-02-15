-- Add permanent access_token to customers for client portal auto-login
ALTER TABLE customers ADD COLUMN access_token UUID DEFAULT gen_random_uuid();

-- Backfill existing customers
UPDATE customers SET access_token = gen_random_uuid() WHERE access_token IS NULL;

-- Make NOT NULL + UNIQUE
ALTER TABLE customers ALTER COLUMN access_token SET NOT NULL;
ALTER TABLE customers ADD CONSTRAINT customers_access_token_unique UNIQUE (access_token);
