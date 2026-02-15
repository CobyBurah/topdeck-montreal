-- Add auth_user_id to customers table to link Supabase Auth users to customer records
ALTER TABLE customers ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id);

-- Index for fast lookup by auth_user_id
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
