-- Simplify sms_logs table - remove phone number columns (derived from customer)
-- and status column (not needed for SMS)

ALTER TABLE sms_logs DROP COLUMN IF EXISTS from_number;
ALTER TABLE sms_logs DROP COLUMN IF EXISTS to_number;
ALTER TABLE sms_logs DROP COLUMN IF EXISTS status;

-- Simplify call_logs table - remove phone number columns (derived from customer)
-- and other unnecessary columns

ALTER TABLE call_logs DROP COLUMN IF EXISTS from_number;
ALTER TABLE call_logs DROP COLUMN IF EXISTS to_number;
ALTER TABLE call_logs DROP COLUMN IF EXISTS duration_seconds;
ALTER TABLE call_logs DROP COLUMN IF EXISTS status;
ALTER TABLE call_logs DROP COLUMN IF EXISTS notes;
