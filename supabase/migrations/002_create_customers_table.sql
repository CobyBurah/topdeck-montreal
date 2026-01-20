-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Contact Info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,

  -- Metadata
  language VARCHAR(2) DEFAULT 'en',
  internal_notes TEXT
);

-- Indexes for fast lookup by email or phone
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add customer_id to leads table
ALTER TABLE leads ADD COLUMN customer_id UUID REFERENCES customers(id);
CREATE INDEX idx_leads_customer_id ON leads(customer_id);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers (same pattern as leads)
CREATE POLICY "Allow authenticated users to view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Allow service role full access (for contact form API)
CREATE POLICY "Allow service role full access to customers"
  ON customers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
