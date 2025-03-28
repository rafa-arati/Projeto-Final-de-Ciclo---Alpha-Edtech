-- Criar tabela de categorias (se não existir)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Criar tabela de subcategorias (se não existir)
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(name, category_id)
);

-- Adicionar colunas category_id e subcategory_id à tabela events (se não existirem)
ALTER TABLE events ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;

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

-- Nota: A categoria DIVERSOS não tem subcategorias

-- Atualizações para conectar eventos existentes a categorias
-- Este comando preencherá o category_id com base na coluna category existente
UPDATE events SET category_id = (SELECT id FROM categories WHERE categories.name = events.category)
WHERE category_id IS NULL AND category IS NOT NULL;