ALTER TABLE events DROP CONSTRAINT IF EXISTS events_video_urls_check;

ALTER TABLE events
ADD CONSTRAINT events_video_urls_check CHECK (
    video_urls IS NULL OR (
        array_length(video_urls, 1) BETWEEN 1 AND 3 AND
        (SELECT bool_and(
            url ~ '^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*' OR 
            url ~ '^(https?:\/\/)?(www\.|vm\.)?tiktok\.com\/.*'
        ) FROM unnest(video_urls) AS url)
    )
);

COMMENT ON COLUMN events.video_urls IS 'Array de links de vídeo (YouTube/TikTok, máximo 3)';