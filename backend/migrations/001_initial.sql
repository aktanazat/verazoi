-- Verazoi schema
-- Run against Supabase Postgres or local Docker Postgres

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ──

CREATE TABLE IF NOT EXISTS users (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── Glucose readings ──

CREATE TABLE IF NOT EXISTS glucose_readings (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value       integer NOT NULL CHECK (value >= 20 AND value <= 500),
    timing      text NOT NULL CHECK (timing IN ('fasting', 'before', 'after')),
    recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_glucose_user_time ON glucose_readings (user_id, recorded_at DESC);

-- ── Meals ──

CREATE TABLE IF NOT EXISTS meals (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type   text NOT NULL,
    foods       text[] NOT NULL DEFAULT '{}',
    notes       text NOT NULL DEFAULT '',
    recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_time ON meals (user_id, recorded_at DESC);

-- ── Activities ──

CREATE TABLE IF NOT EXISTS activities (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type   text NOT NULL,
    duration        integer NOT NULL CHECK (duration >= 1 AND duration <= 600),
    intensity       text NOT NULL CHECK (intensity IN ('Light', 'Moderate', 'Intense')),
    recorded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_time ON activities (user_id, recorded_at DESC);

-- ── Sleep entries ──

CREATE TABLE IF NOT EXISTS sleep_entries (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hours       double precision NOT NULL CHECK (hours >= 0 AND hours <= 24),
    quality     text NOT NULL CHECK (quality IN ('poor', 'fair', 'good', 'great')),
    recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sleep_user_time ON sleep_entries (user_id, recorded_at DESC);

-- ── Timeline events (materialized from inserts via triggers) ──

CREATE TABLE IF NOT EXISTS timeline_events (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        text NOT NULL CHECK (type IN ('glucose', 'meal', 'activity', 'sleep')),
    label       text NOT NULL,
    value       text NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_user_time ON timeline_events (user_id, recorded_at DESC);

-- ── Wearable data ──

CREATE TABLE IF NOT EXISTS wearable_data (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    heart_rate      integer,
    steps           integer,
    active_minutes  integer,
    sleep_hours     double precision,
    sleep_quality   text,
    recorded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wearable_user_time ON wearable_data (user_id, recorded_at DESC);

-- ── Auto-populate timeline on insert ──

CREATE OR REPLACE FUNCTION fn_glucose_timeline() RETURNS trigger AS $$
BEGIN
    INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
    VALUES (
        NEW.user_id, 'glucose',
        CASE NEW.timing WHEN 'fasting' THEN 'Fasting' WHEN 'before' THEN 'Pre-meal' ELSE 'Post-meal' END,
        NEW.value || ' mg/dL',
        NEW.recorded_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_glucose_timeline ON glucose_readings;
CREATE TRIGGER trg_glucose_timeline AFTER INSERT ON glucose_readings
    FOR EACH ROW EXECUTE FUNCTION fn_glucose_timeline();

CREATE OR REPLACE FUNCTION fn_meal_timeline() RETURNS trigger AS $$
BEGIN
    INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
    VALUES (NEW.user_id, 'meal', NEW.meal_type, array_to_string(NEW.foods, ', '), NEW.recorded_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_meal_timeline ON meals;
CREATE TRIGGER trg_meal_timeline AFTER INSERT ON meals
    FOR EACH ROW EXECUTE FUNCTION fn_meal_timeline();

CREATE OR REPLACE FUNCTION fn_activity_timeline() RETURNS trigger AS $$
BEGIN
    INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
    VALUES (NEW.user_id, 'activity', NEW.activity_type, NEW.duration || ' min, ' || lower(NEW.intensity), NEW.recorded_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activity_timeline ON activities;
CREATE TRIGGER trg_activity_timeline AFTER INSERT ON activities
    FOR EACH ROW EXECUTE FUNCTION fn_activity_timeline();

CREATE OR REPLACE FUNCTION fn_sleep_timeline() RETURNS trigger AS $$
BEGIN
    INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
    VALUES (NEW.user_id, 'sleep', 'Sleep logged', NEW.hours || ' hrs, ' || NEW.quality, NEW.recorded_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sleep_timeline ON sleep_entries;
CREATE TRIGGER trg_sleep_timeline AFTER INSERT ON sleep_entries
    FOR EACH ROW EXECUTE FUNCTION fn_sleep_timeline();
