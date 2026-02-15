-- Add lead_id FK and status to estimates table
ALTER TABLE estimates ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE estimates ADD COLUMN status VARCHAR(50) DEFAULT 'sent' NOT NULL;

-- Index for lead_id lookups
CREATE INDEX idx_estimates_lead_id ON estimates(lead_id);
