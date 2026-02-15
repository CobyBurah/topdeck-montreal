-- Enable Supabase Realtime for all portal tables
-- This allows the portal to receive real-time updates when data is created/updated/deleted

-- Core entities
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE estimates;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;

-- Communication logs
ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE call_logs;

-- Activity and scheduling
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_messages;
