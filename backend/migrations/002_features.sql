-- user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    glucose_low integer NOT NULL DEFAULT 70,
    glucose_high integer NOT NULL DEFAULT 140,
    daily_steps integer NOT NULL DEFAULT 10000,
    sleep_hours double precision NOT NULL DEFAULT 8,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- stability_snapshots table
CREATE TABLE IF NOT EXISTS stability_snapshots (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score integer NOT NULL,
    glucose_component double precision,
    activity_component double precision,
    sleep_component double precision,
    heart_rate_component double precision,
    snapshot_date date NOT NULL,
    UNIQUE(user_id, snapshot_date)
);
CREATE INDEX IF NOT EXISTS idx_stability_snapshot_user_date ON stability_snapshots (user_id, snapshot_date DESC);

-- ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start date NOT NULL,
    summary text NOT NULL,
    generated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, week_start)
);
CREATE INDEX IF NOT EXISTS idx_insights_user ON ai_insights (user_id, week_start DESC);

-- medications table
CREATE TABLE IF NOT EXISTS medications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    dose_value double precision NOT NULL,
    dose_unit text NOT NULL CHECK (dose_unit IN ('units', 'mg')),
    timing text NOT NULL CHECK (timing IN ('before_meal', 'with_meal', 'after_meal', 'bedtime', 'morning', 'other')),
    notes text NOT NULL DEFAULT '',
    recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_medications_user_time ON medications (user_id, recorded_at DESC);

-- Update timeline_events type check to include 'medication'
ALTER TABLE timeline_events DROP CONSTRAINT IF EXISTS timeline_events_type_check;
ALTER TABLE timeline_events ADD CONSTRAINT timeline_events_type_check CHECK (type IN ('glucose', 'meal', 'activity', 'sleep', 'medication'));

-- Medication timeline trigger
CREATE OR REPLACE FUNCTION fn_medication_timeline() RETURNS trigger AS $$
BEGIN
    INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
    VALUES (NEW.user_id, 'medication', NEW.name, NEW.dose_value || ' ' || NEW.dose_unit, NEW.recorded_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_medication_timeline ON medications;
CREATE TRIGGER trg_medication_timeline AFTER INSERT ON medications
    FOR EACH ROW EXECUTE FUNCTION fn_medication_timeline();
