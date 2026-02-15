-- Fix: Allow deleting customers that have linked leads, estimates, or invoices
-- by changing foreign key constraints from RESTRICT (default) to CASCADE

-- Drop existing FK constraints
ALTER TABLE leads DROP CONSTRAINT leads_customer_id_fkey;
ALTER TABLE estimates DROP CONSTRAINT estimates_customer_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT invoices_customer_id_fkey;

-- Re-add with ON DELETE CASCADE
ALTER TABLE leads ADD CONSTRAINT leads_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE estimates ADD CONSTRAINT estimates_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
