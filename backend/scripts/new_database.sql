-- Criar tipos enumerados
CREATE TYPE gender_type AS ENUM ('Masculino', 'Feminino', 'Outro');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'premium');
CREATE TYPE link_type AS ENUM ('youtube', 'whatsapp', 'instagram', 'tiktok', 'website');

-- Tabela de Categorias
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de Subcategorias
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE (name, category_id)
);

-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    birth_date DATE,
    gender gender_type,
    city VARCHAR(100),
    state VARCHAR(50),
    profile_picture_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role user_role NOT NULL DEFAULT 'user',
    username VARCHAR(50) UNIQUE,
    phone VARCHAR(15),
    google_id VARCHAR(255) UNIQUE,
    photo_url VARCHAR(255),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    subscription_expiry TIMESTAMP
);

-- Tabela de Eventos
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    event_link VARCHAR(200),
    description TEXT,
    photo_url VARCHAR(200),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    coordinates POINT,
    address TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para múltiplos links de eventos
CREATE TABLE event_links (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    link_type link_type NOT NULL,
    link_url VARCHAR(255) NOT NULL,
    link_description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tokens para Redefinição de Senha
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tentativas de Reset de Senha
CREATE TABLE reset_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar preferências de usuários
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
    UNIQUE (user_id, category_id, subcategory_id)
);

-- Tabela para curtidas em eventos
CREATE TABLE event_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);

-- Tabela para eventos favoritados
CREATE TABLE event_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);

-- Tabela simplificada para QR codes
CREATE TABLE event_qr_codes (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela simples para métricas de eventos
CREATE TABLE event_metrics (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias principais
INSERT INTO categories (name) VALUES 
    ('EVENTO MUSICAL'),
    ('TEATRO E ARTES CÊNICAS'),
    ('DANÇA'),
    ('EXPOSIÇÕES E FEIRAS'),
    ('FESTIVAIS CULTURAIS'),
    ('DIVERSOS')
ON CONFLICT (name) DO NOTHING;

-- Inserir subcategorias para EVENTO MUSICAL
INSERT INTO subcategories (name, category_id) VALUES 
    ('Show de Rock', (SELECT id FROM categories WHERE name = 'EVENTO MUSICAL')),
    ('Show de Samba', (SELECT id FROM categories WHERE name = 'EVENTO MUSICAL')),
    ('Funk', (SELECT id FROM categories WHERE name = 'EVENTO MUSICAL')),
    ('Eletrônica', (SELECT id FROM categories WHERE name = 'EVENTO MUSICAL')),
    ('MPB (Música Popular Brasileira)', (SELECT id FROM categories WHERE name = 'EVENTO MUSICAL'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Inserir subcategorias para TEATRO E ARTES CÊNICAS
INSERT INTO subcategories (name, category_id) VALUES 
    ('Teatro Clássico', (SELECT id FROM categories WHERE name = 'TEATRO E ARTES CÊNICAS')),
    ('Teatro Contemporâneo', (SELECT id FROM categories WHERE name = 'TEATRO E ARTES CÊNICAS')),
    ('Stand-up Comedy', (SELECT id FROM categories WHERE name = 'TEATRO E ARTES CÊNICAS')),
    ('Improvisação', (SELECT id FROM categories WHERE name = 'TEATRO E ARTES CÊNICAS')),
    ('Musicais', (SELECT id FROM categories WHERE name = 'TEATRO E ARTES CÊNICAS'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Inserir subcategorias para DANÇA
INSERT INTO subcategories (name, category_id) VALUES 
    ('Ballet', (SELECT id FROM categories WHERE name = 'DANÇA')),
    ('Dança Contemporânea', (SELECT id FROM categories WHERE name = 'DANÇA')),
    ('Dança de Salão', (SELECT id FROM categories WHERE name = 'DANÇA')),
    ('Hip-Hop', (SELECT id FROM categories WHERE name = 'DANÇA')),
    ('Dança Folclórica', (SELECT id FROM categories WHERE name = 'DANÇA'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Inserir subcategorias para EXPOSIÇÕES E FEIRAS
INSERT INTO subcategories (name, category_id) VALUES 
    ('Exposição de Arte', (SELECT id FROM categories WHERE name = 'EXPOSIÇÕES E FEIRAS')),
    ('Feira de Artesanato', (SELECT id FROM categories WHERE name = 'EXPOSIÇÕES E FEIRAS')),
    ('Feira Gastronômica', (SELECT id FROM categories WHERE name = 'EXPOSIÇÕES E FEIRAS')),
    ('Exposição Fotográfica', (SELECT id FROM categories WHERE name = 'EXPOSIÇÕES E FEIRAS')),
    ('Exposição de Design', (SELECT id FROM categories WHERE name = 'EXPOSIÇÕES E FEIRAS'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Inserir subcategorias para FESTIVAIS CULTURAIS
INSERT INTO subcategories (name, category_id) VALUES 
    ('Festival de Cinema', (SELECT id FROM categories WHERE name = 'FESTIVAIS CULTURAIS')),
    ('Festival de Literatura', (SELECT id FROM categories WHERE name = 'FESTIVAIS CULTURAIS')),
    ('Festival de Gastronomia', (SELECT id FROM categories WHERE name = 'FESTIVAIS CULTURAIS')),
    ('Festival de Arte de Rua', (SELECT id FROM categories WHERE name = 'FESTIVAIS CULTURAIS')),
    ('Festival de Música', (SELECT id FROM categories WHERE name = 'FESTIVAIS CULTURAIS'))
ON CONFLICT (name, category_id) DO NOTHING;

-- Criar índices para melhorar a performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_events_category_subcategory ON events(category_id, subcategory_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_links_event ON event_links(event_id);
CREATE INDEX idx_event_likes_event ON event_likes(event_id);
CREATE INDEX idx_event_favorites_event ON event_favorites(event_id);
CREATE INDEX idx_event_likes_user ON event_likes(user_id);
CREATE INDEX idx_event_favorites_user ON event_favorites(user_id);