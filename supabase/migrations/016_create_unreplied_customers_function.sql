-- Function to find customer IDs where the most recent communication (email or SMS) is inbound
-- This indicates the customer has not been replied to yet
CREATE OR REPLACE FUNCTION get_unreplied_customer_ids(customer_ids UUID[])
RETURNS TABLE(customer_id UUID)
AS $$
  WITH latest_comms AS (
    SELECT customer_id, sent_at AS ts, direction FROM email_logs
    WHERE customer_id = ANY(customer_ids)
    UNION ALL
    SELECT customer_id, sent_at AS ts, direction FROM sms_logs
    WHERE customer_id = ANY(customer_ids)
  ),
  ranked AS (
    SELECT customer_id, direction,
           ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ts DESC) as rn
    FROM latest_comms
  )
  SELECT customer_id
  FROM ranked
  WHERE rn = 1 AND direction = 'inbound';
$$ LANGUAGE sql STABLE;
