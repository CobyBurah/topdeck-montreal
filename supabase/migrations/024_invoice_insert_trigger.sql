-- Trigger function: on invoice insert, auto-link estimate and update estimate status
CREATE OR REPLACE FUNCTION handle_invoice_insert()
RETURNS TRIGGER AS $$
DECLARE
  found_estimate_id UUID;
  found_lead_id UUID;
BEGIN
  -- Find the customer's most recent active estimate
  SELECT id, lead_id INTO found_estimate_id, found_lead_id
  FROM estimates
  WHERE customer_id = NEW.customer_id
    AND status NOT IN ('invoice_sent')
  ORDER BY created_at DESC
  LIMIT 1;

  -- If we found an estimate, link it and update its status
  IF found_estimate_id IS NOT NULL THEN
    NEW.estimate_id := found_estimate_id;
    NEW.lead_id := found_lead_id;

    UPDATE estimates
    SET status = 'invoice_sent', updated_at = NOW()
    WHERE id = found_estimate_id;
  END IF;

  -- Create activity log entry
  INSERT INTO activity_log (customer_id, event_type, reference_type, title, description, metadata)
  VALUES (
    NEW.customer_id,
    'invoice_created',
    'invoice',
    'Invoice Created',
    NEW.service,
    jsonb_build_object(
      'invoiceId', NEW.invoice_id,
      'service', NEW.service,
      'price', NEW.price,
      'estimateId', found_estimate_id,
      'leadId', found_lead_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to invoices table
CREATE TRIGGER on_invoice_insert
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_invoice_insert();
