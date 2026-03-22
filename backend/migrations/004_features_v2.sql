-- Allow 'cgm' as a glucose timing value
ALTER TABLE glucose_readings DROP CONSTRAINT IF EXISTS glucose_readings_timing_check;
ALTER TABLE glucose_readings ADD CONSTRAINT glucose_readings_timing_check CHECK (timing IN ('fasting', 'before', 'after', 'cgm'));

-- Add unique constraint to prevent duplicate CGM readings
CREATE UNIQUE INDEX IF NOT EXISTS idx_glucose_cgm_unique ON glucose_readings (user_id, recorded_at) WHERE timing = 'cgm';

-- CGM device connections (Dexcom Share, LibreLink, etc.)
CREATE TABLE IF NOT EXISTS cgm_connections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider text NOT NULL CHECK (provider IN ('dexcom', 'libre')),
    session_token text,
    username text NOT NULL,
    last_sync timestamptz,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, provider)
);

-- Food experiments (A/B testing meals)
CREATE TABLE IF NOT EXISTS experiments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    food_a text NOT NULL,
    food_b text NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiments_user ON experiments (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS experiment_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    arm text NOT NULL CHECK (arm IN ('a', 'b')),
    meal_id uuid REFERENCES meals(id) ON DELETE SET NULL,
    pre_glucose int,
    peak_glucose int,
    glucose_delta int,
    recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiment_entries ON experiment_entries (experiment_id, arm);

-- Fasting sessions
CREATE TABLE IF NOT EXISTS fasting_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at timestamptz NOT NULL,
    ended_at timestamptz,
    target_hours double precision,
    notes text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_fasting_user ON fasting_sessions (user_id, started_at DESC);

-- Medication schedules (for reminders)
CREATE TABLE IF NOT EXISTS medication_schedules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_name text NOT NULL,
    dose_value double precision NOT NULL,
    dose_unit text NOT NULL CHECK (dose_unit IN ('units', 'mg')),
    schedule_time time NOT NULL,
    days_of_week int[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_med_schedule_user ON medication_schedules (user_id) WHERE active;
