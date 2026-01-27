-- Create estimates table
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Required relationship to customer
  customer_id UUID NOT NULL REFERENCES customers(id),

  -- Square estimate info
  estimate_id VARCHAR(255),
  estimate_link TEXT,

  -- Estimate details
  service VARCHAR(255),
  price DECIMAL(10,2),

  -- Internal fields
  internal_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX idx_estimates_created_at ON estimates(created_at DESC);
CREATE INDEX idx_estimates_estimate_id ON estimates(estimate_id);

-- Trigger for updated_at
CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for estimates (same pattern as leads/customers)
CREATE POLICY "Allow authenticated users to view estimates"
  ON estimates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert estimates"
  ON estimates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update estimates"
  ON estimates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete estimates"
  ON estimates FOR DELETE
  TO authenticated
  USING (true);

-- Allow service role full access (for n8n integration)
CREATE POLICY "Allow service role full access to estimates"
  ON estimates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
