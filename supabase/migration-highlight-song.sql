-- Add highlight_song to shows
ALTER TABLE shows ADD COLUMN IF NOT EXISTS highlight_song varchar(200);
