-- Invoices redesign: add lead_id, change statuses to unpaid/deposit_paid/fully_paid

-- 1. Add lead_id FK to invoices for direct lead data access
ALTER TABLE invoices ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
CREATE INDEX idx_invoices_lead_id ON invoices(lead_id);

-- 2. Change default status from 'sent' to 'unpaid'
ALTER TABLE invoices ALTER COLUMN status SET DEFAULT 'unpaid';

-- 3. Backfill existing statuses to new values
UPDATE invoices SET status = 'fully_paid' WHERE status = 'paid';
UPDATE invoices SET status = 'unpaid' WHERE status IN ('sent', 'viewed', 'overdue', 'partially_paid', 'cancelled', 'refunded');

-- 4. Backfill lead_id from linked estimates
UPDATE invoices i
SET lead_id = e.lead_id
FROM estimates e
WHERE i.estimate_id = e.id
  AND e.lead_id IS NOT NULL
  AND i.lead_id IS NULL;
