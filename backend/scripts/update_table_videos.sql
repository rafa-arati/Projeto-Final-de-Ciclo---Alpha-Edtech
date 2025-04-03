-- Adicionar a coluna video_urls como um array de texto
ALTER TABLE events ADD COLUMN video_urls TEXT[];

-- Adicionar uma restrição mais simples para o limite de 3 URLs
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_video_urls_check;
ALTER TABLE events ADD CONSTRAINT events_video_urls_max_check 
CHECK (video_urls IS NULL OR array_length(video_urls, 1) <= 3);

-- Adicionar comentário
COMMENT ON COLUMN events.video_urls IS 'Array de links de vídeo (YouTube/TikTok, máximo 3)';