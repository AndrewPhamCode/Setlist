-- Add Spotify track URI column for highlight song playback
ALTER TABLE shows ADD COLUMN IF NOT EXISTS highlight_track_uri varchar(200);
