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

-- Criar tipo ENUM para roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Adicionar coluna role à tabela users
ALTER TABLE users
ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Conceder permissões ao usuário meu_usuario
GRANT ALL PRIVILEGES ON TABLE users TO meu_usuario;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO meu_usuario;