CREATE TABLE agons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  clerk_user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  mind_slugs TEXT[] NOT NULL,
  rounds INTEGER NOT NULL DEFAULT 3,
  turns JSONB NOT NULL DEFAULT '[]',
  consensus JSONB,
  research TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agons_user ON agons(clerk_user_id);
CREATE INDEX idx_agons_created ON agons(created_at DESC);
