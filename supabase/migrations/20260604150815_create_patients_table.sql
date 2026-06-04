/*
  # Create patients table for kiosk check-in

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `token_number` (text, unique) — auto-generated sequential token per day e.g. A001
      - `full_name` (text, not null)
      - `age` (int, not null)
      - `gender` (text, not null)
      - `mobile_number` (text, not null)
      - `address` (text, optional)
      - `department` (text, not null)
      - `status` (text, default 'Waiting') — Waiting | In Progress | Completed | Cancelled
      - `priority` (text, default 'Normal') — Normal | Urgent
      - `registered_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Allow anonymous insert (kiosk use — public terminal)
    - Allow anonymous select (triage dashboard)
    - Allow anonymous update for status changes (admin triage)

  3. Token Generation
    - Trigger-based daily sequential token: resets daily, format A001..A999
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number text NOT NULL DEFAULT '',
  full_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 1 AND age <= 120),
  gender text NOT NULL,
  mobile_number text NOT NULL,
  address text DEFAULT '',
  department text NOT NULL,
  status text NOT NULL DEFAULT 'Waiting',
  priority text NOT NULL DEFAULT 'Normal',
  registered_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_patients_department ON patients(department);
CREATE INDEX IF NOT EXISTS idx_patients_registered_at ON patients(registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Kiosk: anyone can register (insert)
CREATE POLICY "Kiosk can register patients"
  ON patients FOR INSERT
  TO anon
  WITH CHECK (true);

-- Dashboard: anyone can view all records (triage terminal)
CREATE POLICY "Triage can view all patients"
  ON patients FOR SELECT
  TO anon
  USING (true);

-- Admin: can update status/priority
CREATE POLICY "Admin can update patient status"
  ON patients FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Token generator: daily sequential token
CREATE OR REPLACE FUNCTION generate_daily_token()
RETURNS TRIGGER AS $$
DECLARE
  today_count integer;
  new_token text;
BEGIN
  SELECT COUNT(*) INTO today_count
  FROM patients
  WHERE registered_at::date = CURRENT_DATE;

  new_token := 'A' || LPAD((today_count + 1)::text, 3, '0');
  NEW.token_number := new_token;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_token_number ON patients;
CREATE TRIGGER set_token_number
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION generate_daily_token();
