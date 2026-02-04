-- Create activity_log table for permanent event storage
-- Events persist even if source records (leads, estimates, invoices) are deleted
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Required relationship to customer
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'lead_created',
    'estimate_created',
    'invoice_created',
    'invoice_paid',
    'invoice_cancelled',
    'note_added'
  )),

  -- Reference to source entity (nullable since entity may be deleted)
  reference_id UUID,
  reference_type VARCHAR(20) CHECK (reference_type IN ('lead', 'estimate', 'invoice')),

  -- Display content
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Flexible metadata storage (price, service, source, status, etc.)
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_activity_log_customer_id ON activity_log(customer_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_event_type ON activity_log(event_type);
CREATE INDEX idx_activity_log_reference ON activity_log(reference_type, reference_id);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to view activity_log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert activity_log"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update activity_log"
  ON activity_log FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete activity_log"
  ON activity_log FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to activity_log"
  ON activity_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
