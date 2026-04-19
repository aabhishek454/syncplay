CREATE TABLE rooms (
  code TEXT PRIMARY KEY,
  track_id TEXT,
  track_title TEXT,
  track_artist TEXT,
  is_playing BOOLEAN DEFAULT false,
  position FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON rooms FOR ALL USING (true);
