-- Add signature column to scheduled_messages for email signature selection
ALTER TABLE scheduled_messages ADD COLUMN signature VARCHAR(10);
