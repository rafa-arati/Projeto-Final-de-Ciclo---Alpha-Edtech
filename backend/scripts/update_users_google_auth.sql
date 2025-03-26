-- Adicionar colunas para autenticação Google
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Tornar password_hash opcional, já que usuários do Google não terão senha
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Atualizar o tipo gender para aceitar NULL temporariamente
-- para usuários que ainda não completaram o onboarding
ALTER TABLE users ALTER COLUMN gender DROP NOT NULL;

-- Tornar birth_date opcional temporariamente para o mesmo propósito
ALTER TABLE users ALTER COLUMN birth_date DROP NOT NULL;

-- Criar índice para busca rápida por google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Atualizar as permissões (se necessário)
GRANT ALL PRIVILEGES ON TABLE users TO meu_usuario;

-- Comentário: Este script permite login com Google, 
-- tornando alguns campos obrigatórios opcionais inicialmente.
-- Esses campos serão preenchidos durante o processo de onboarding.