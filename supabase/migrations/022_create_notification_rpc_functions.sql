-- RPC functions for notification system: find unreplied inbound SMS and emails

-- Returns the most recent inbound SMS per customer where no outbound SMS or email exists after it
CREATE OR REPLACE FUNCTION get_unreplied_sms()
RETURNS TABLE(
  id UUID,
  customer_id UUID,
  customer_name TEXT,
  message TEXT,
  sent_at TIMESTAMPTZ
)
AS $$
  WITH latest_inbound AS (
    SELECT DISTINCT ON (s.customer_id)
      s.id,
      s.customer_id,
      c.full_name AS customer_name,
      s.message,
      s.sent_at
    FROM sms_logs s
    JOIN customers c ON c.id = s.customer_id
    WHERE s.direction = 'inbound'
    ORDER BY s.customer_id, s.sent_at DESC
  )
  SELECT li.*
  FROM latest_inbound li
  WHERE NOT EXISTS (
    SELECT 1 FROM sms_logs out_sms
    WHERE out_sms.customer_id = li.customer_id
      AND out_sms.direction = 'outbound'
      AND out_sms.sent_at > li.sent_at
  )
  AND NOT EXISTS (
    SELECT 1 FROM email_logs out_email
    WHERE out_email.customer_id = li.customer_id
      AND out_email.direction = 'outbound'
      AND out_email.sent_at > li.sent_at
  )
  ORDER BY li.sent_at DESC;
$$ LANGUAGE sql STABLE;

-- Returns the most recent inbound email per customer where no outbound SMS or email exists after it
CREATE OR REPLACE FUNCTION get_unreplied_emails()
RETURNS TABLE(
  id UUID,
  customer_id UUID,
  customer_name TEXT,
  subject TEXT,
  sent_at TIMESTAMPTZ
)
AS $$
  WITH latest_inbound AS (
    SELECT DISTINCT ON (e.customer_id)
      e.id,
      e.customer_id,
      c.full_name AS customer_name,
      e.subject,
      e.sent_at
    FROM email_logs e
    JOIN customers c ON c.id = e.customer_id
    WHERE e.direction = 'inbound'
    ORDER BY e.customer_id, e.sent_at DESC
  )
  SELECT li.*
  FROM latest_inbound li
  WHERE NOT EXISTS (
    SELECT 1 FROM email_logs out_email
    WHERE out_email.customer_id = li.customer_id
      AND out_email.direction = 'outbound'
      AND out_email.sent_at > li.sent_at
  )
  AND NOT EXISTS (
    SELECT 1 FROM sms_logs out_sms
    WHERE out_sms.customer_id = li.customer_id
      AND out_sms.direction = 'outbound'
      AND out_sms.sent_at > li.sent_at
  )
  ORDER BY li.sent_at DESC;
$$ LANGUAGE sql STABLE;
