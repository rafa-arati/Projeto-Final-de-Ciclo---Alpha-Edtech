-- Deletar a tabela se existir
DROP TABLE IF EXISTS users;

-- Criar tipo ENUM para gênero
CREATE TYPE gender_type AS ENUM ('Masculino', 'Feminino', 'Outro');

-- Criar a nova tabela users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL, -- Campo obrigatório
    gender gender_type NOT NULL, -- Usando o ENUM criado
    city VARCHAR(100),
    state VARCHAR(50),
    profile_picture_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Criar a nova tabela eventos
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  event_link VARCHAR(200),
  description TEXT,
  photo_url VARCHAR(200)
);

-- Criar tipo ENUM para roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Adicionar coluna role à tabela users
ALTER TABLE users
ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Conceder permissões ao usuário meu_usuario
GRANT ALL PRIVILEGES ON TABLE users TO meu_usuario;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO meu_usuario;


-- Tabela para armazenar tokens de recuperação de senha
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rastrear tentativas de recuperação de senha por IP
CREATE TABLE reset_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    attempt_count INT DEFAULT 1,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);