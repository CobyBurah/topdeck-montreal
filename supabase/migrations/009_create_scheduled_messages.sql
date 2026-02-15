-- Create scheduled_messages table for tracking messages scheduled for future delivery
CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer relationship
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Message details
  type VARCHAR(10) NOT NULL CHECK (type IN ('email', 'sms')),
  subject VARCHAR(500),
  message TEXT NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),

  -- Reference to reply (for email threads)
  reply_to_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_scheduled_messages_customer_id ON scheduled_messages(customer_id);
CREATE INDEX idx_scheduled_messages_scheduled_for ON scheduled_messages(scheduled_for);
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status);

-- Enable RLS
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to view scheduled_messages"
  ON scheduled_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert scheduled_messages"
  ON scheduled_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update scheduled_messages"
  ON scheduled_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete scheduled_messages"
  ON scheduled_messages FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to scheduled_messages"
  ON scheduled_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
