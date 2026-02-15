-- Add favourite_stains column to leads, estimates, and invoices
ALTER TABLE leads ADD COLUMN favourite_stains TEXT[] DEFAULT '{}';
ALTER TABLE estimates ADD COLUMN favourite_stains TEXT[] DEFAULT '{}';
ALTER TABLE invoices ADD COLUMN favourite_stains TEXT[] DEFAULT '{}';
