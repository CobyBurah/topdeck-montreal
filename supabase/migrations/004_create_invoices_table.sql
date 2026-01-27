-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Required relationship to customer
  customer_id UUID NOT NULL REFERENCES customers(id),

  -- Square invoice info
  invoice_id VARCHAR(255),
  invoice_link TEXT,

  -- Invoice details
  service VARCHAR(255),
  price DECIMAL(10,2),

  -- Invoice status (key difference from estimates)
  status VARCHAR(50) NOT NULL DEFAULT 'sent',

  -- Internal fields
  internal_notes TEXT,

  -- Optional link to source estimate
  estimate_id UUID REFERENCES estimates(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX idx_invoices_invoice_id ON invoices(invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_estimate_id ON invoices(estimate_id);

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices (same pattern as estimates)
CREATE POLICY "Allow authenticated users to view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (true);

-- Allow service role full access (for n8n integration)
CREATE POLICY "Allow service role full access to invoices"
  ON invoices FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
