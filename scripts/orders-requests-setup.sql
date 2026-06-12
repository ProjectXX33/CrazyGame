-- ============================================================
-- Crazy Game – Orders & Requests tables (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor to set up the tables
-- that power the Dashboard notification system.
-- ============================================================

-- ── Orders table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL PRIMARY KEY,
  customer_name TEXT        NOT NULL DEFAULT '',
  email         TEXT        DEFAULT '',
  phone         TEXT        DEFAULT '',
  address       TEXT        DEFAULT '',
  city          TEXT        DEFAULT '',
  governorate   TEXT        DEFAULT '',

  -- Order contents (stored as JSONB array)
  -- Each element: { title, img, qty, unit_price, variant_label?, digital? }
  items         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  item_count    INT         NOT NULL DEFAULT 0,

  -- Pricing
  subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Payment & status
  payment_method TEXT       NOT NULL DEFAULT 'cod',
  status         TEXT       NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new','confirmed','shipped','delivered','cancelled')),

  -- Notes
  customer_note  TEXT       DEFAULT '',
  admin_note     TEXT       DEFAULT '',

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for dashboard queries (filter by status, sort by date)
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();


-- ── Requests table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requests (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL DEFAULT '',
  email         TEXT        DEFAULT '',
  phone         TEXT        DEFAULT '',
  game_title    TEXT        NOT NULL DEFAULT '',
  platform      TEXT        DEFAULT '',
  message       TEXT        DEFAULT '',

  status        TEXT        NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new','reviewed','sourcing','fulfilled','closed')),

  admin_note    TEXT        DEFAULT '',

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_status     ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests (created_at DESC);

CREATE OR REPLACE FUNCTION update_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requests_updated_at ON requests;
CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_requests_updated_at();


-- ── Row Level Security (RLS) ─────────────────────────────────
-- Enable RLS on both tables
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) full access
-- Adjust these policies to match your auth setup
CREATE POLICY "Admin full access on orders" ON orders
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on requests" ON requests
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow anonymous users to INSERT orders (for checkout) and requests
CREATE POLICY "Anon can place orders" ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can submit requests" ON requests
  FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- Done! The notification system in Dashboard queries:
--   • orders   WHERE status = 'new'    → "New order" notifications
--   • requests WHERE status = 'new'    → "New request" notifications
--   • products WHERE stock <= 0        → "Out of stock" notifications
--     (products table already exists)
-- ============================================================
