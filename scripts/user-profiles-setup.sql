-- ============================================================
-- Crazy Game – User Profiles (saved delivery details)
-- Run this in Supabase SQL Editor.
--
-- After a registered user places their first order, their
-- delivery details are saved here. On the next checkout,
-- the form is automatically pre-filled.
-- Guests are never saved.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT    DEFAULT '',
  phone         TEXT    DEFAULT '',
  email         TEXT    DEFAULT '',
  address       TEXT    DEFAULT '',
  city          TEXT    DEFAULT '',
  governorate   TEXT    DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update ONLY their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins (authenticated) can read all profiles
CREATE POLICY "Admin read all profiles" ON user_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Done! The checkout flow in Cart.jsx will:
--   1. On mount: load the user's profile and pre-fill the form
--   2. On order: upsert the user's delivery details
-- ============================================================
