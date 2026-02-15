-- Function to get the most recent interaction timestamp for each customer
-- Checks across: leads, estimates, invoices, email_logs, sms_logs, call_logs
CREATE OR REPLACE FUNCTION get_last_interactions(customer_ids UUID[])
RETURNS TABLE(customer_id UUID, last_interaction_at TIMESTAMPTZ)
AS $$
  SELECT sub.customer_id, MAX(sub.ts) AS last_interaction_at
  FROM (
    SELECT l.customer_id, MAX(l.created_at) AS ts FROM leads l WHERE l.customer_id = ANY(customer_ids) GROUP BY l.customer_id
    UNION ALL
    SELECT e.customer_id, MAX(e.created_at) FROM estimates e WHERE e.customer_id = ANY(customer_ids) GROUP BY e.customer_id
    UNION ALL
    SELECT i.customer_id, MAX(i.created_at) FROM invoices i WHERE i.customer_id = ANY(customer_ids) GROUP BY i.customer_id
    UNION ALL
    SELECT el.customer_id, MAX(el.sent_at) FROM email_logs el WHERE el.customer_id = ANY(customer_ids) GROUP BY el.customer_id
    UNION ALL
    SELECT sl.customer_id, MAX(sl.sent_at) FROM sms_logs sl WHERE sl.customer_id = ANY(customer_ids) GROUP BY sl.customer_id
    UNION ALL
    SELECT cl.customer_id, MAX(cl.called_at) FROM call_logs cl WHERE cl.customer_id = ANY(customer_ids) GROUP BY cl.customer_id
  ) sub
  GROUP BY sub.customer_id;
$$ LANGUAGE sql STABLE;
