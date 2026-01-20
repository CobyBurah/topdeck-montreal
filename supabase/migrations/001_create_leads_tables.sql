-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,

  -- Project Details
  service_type VARCHAR(100),
  approximate_size VARCHAR(255),
  preferred_timeline VARCHAR(100),
  additional_details TEXT,

  -- CRM Fields
  source VARCHAR(50) DEFAULT 'form',
  status VARCHAR(50) DEFAULT 'new',
  language VARCHAR(2) DEFAULT 'en',
  internal_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Photos Table
CREATE TABLE lead_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  storage_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_lead_photos_lead_id ON lead_photos(lead_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach trigger to leads table
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_photos ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (portal access)
CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Policies for lead photos
CREATE POLICY "Authenticated users can view photos"
  ON lead_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert photos"
  ON lead_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete photos"
  ON lead_photos FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous inserts for website contact form (via service role key)
-- Note: The contact form API uses the service role key which bypasses RLS
