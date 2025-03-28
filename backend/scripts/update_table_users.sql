-- Adicionar coluna username à tabela users (se não existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Se você preferir, pode tornar o campo birth_date opcional temporariamente
-- até que todos os usuários tenham preenchido esse campo
ALTER TABLE users ALTER COLUMN birth_date DROP NOT NULL;

-- Comentário para o DBA: É recomendável preencher os usernames para usuários existentes
-- Exemplo (execute apenas se necessário):
-- UPDATE users SET username = LOWER(REPLACE(name, ' ', '_') || id) WHERE username IS NULL;