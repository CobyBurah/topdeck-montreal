-- Trigger function: on estimate insert, auto-link lead and update lead status
CREATE OR REPLACE FUNCTION handle_estimate_insert()
RETURNS TRIGGER AS $$
DECLARE
  found_lead_id UUID;
BEGIN
  -- Find the customer's most recent active lead
  SELECT id INTO found_lead_id
  FROM leads
  WHERE customer_id = NEW.customer_id
    AND status NOT IN ('estimate_sent', 'complete')
  ORDER BY created_at DESC
  LIMIT 1;

  -- If we found a lead, link it and update its status
  IF found_lead_id IS NOT NULL THEN
    NEW.lead_id := found_lead_id;

    UPDATE leads
    SET status = 'estimate_sent', updated_at = NOW()
    WHERE id = found_lead_id;
  END IF;

  -- Create activity log entry
  INSERT INTO activity_log (customer_id, event_type, reference_type, title, description, metadata)
  VALUES (
    NEW.customer_id,
    'estimate_created',
    'estimate',
    'Estimate Created',
    NEW.service,
    jsonb_build_object(
      'estimateId', NEW.estimate_id,
      'service', NEW.service,
      'price', NEW.price,
      'leadId', found_lead_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to estimates table
CREATE TRIGGER on_estimate_insert
  BEFORE INSERT ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION handle_estimate_insert();
