-- Create email_logs table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Required relationship to customer
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Email details
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject VARCHAR(500),
  body TEXT,
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255) NOT NULL,

  -- External reference (e.g., Gmail message ID)
  external_id VARCHAR(255),

  -- Status tracking
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'bounced', 'failed')),

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create sms_logs table
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Required relationship to customer
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- SMS details
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message TEXT NOT NULL,
  from_number VARCHAR(50) NOT NULL,
  to_number VARCHAR(50) NOT NULL,

  -- External reference (e.g., OpenPhone ID)
  external_id VARCHAR(255),

  -- Status tracking
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create call_logs table
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Required relationship to customer
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Call details
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number VARCHAR(50) NOT NULL,
  to_number VARCHAR(50) NOT NULL,
  duration_seconds INTEGER DEFAULT 0,

  -- External reference (e.g., OpenPhone call ID)
  external_id VARCHAR(255),

  -- Status/outcome
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'voicemail', 'no_answer', 'busy', 'failed')),

  -- Optional notes
  notes TEXT,

  -- Timestamps
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for email_logs
CREATE INDEX idx_email_logs_customer_id ON email_logs(customer_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_direction ON email_logs(direction);
CREATE INDEX idx_email_logs_external_id ON email_logs(external_id);

-- Indexes for sms_logs
CREATE INDEX idx_sms_logs_customer_id ON sms_logs(customer_id);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);
CREATE INDEX idx_sms_logs_direction ON sms_logs(direction);
CREATE INDEX idx_sms_logs_external_id ON sms_logs(external_id);

-- Indexes for call_logs
CREATE INDEX idx_call_logs_customer_id ON call_logs(customer_id);
CREATE INDEX idx_call_logs_called_at ON call_logs(called_at DESC);
CREATE INDEX idx_call_logs_direction ON call_logs(direction);
CREATE INDEX idx_call_logs_external_id ON call_logs(external_id);

-- Triggers for updated_at
CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_logs_updated_at
  BEFORE UPDATE ON sms_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_logs_updated_at
  BEFORE UPDATE ON call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_logs
CREATE POLICY "Allow authenticated users to view email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert email_logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update email_logs"
  ON email_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete email_logs"
  ON email_logs FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to email_logs"
  ON email_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for sms_logs
CREATE POLICY "Allow authenticated users to view sms_logs"
  ON sms_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sms_logs"
  ON sms_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sms_logs"
  ON sms_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete sms_logs"
  ON sms_logs FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to sms_logs"
  ON sms_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for call_logs
CREATE POLICY "Allow authenticated users to view call_logs"
  ON call_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert call_logs"
  ON call_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update call_logs"
  ON call_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete call_logs"
  ON call_logs FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to call_logs"
  ON call_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
