-- =============================================================================
-- Academia Pumangol — schema PostgreSQL
-- Derivado das páginas, formulários e dados estáticos do site EdPlus.
-- Localização: Luanda, Angola | Idiomas: pt (predefinição), en
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- Tipos enumerados (alinhados com a UI)
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'blocked');

CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lesson_type AS ENUM ('video', 'document', 'quiz', 'live');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'expired', 'cancelled');

CREATE TYPE program_kind AS ENUM ('graduate', 'undergraduate', 'online');
CREATE TYPE application_status AS ENUM ('submitted', 'under_review', 'accepted', 'rejected');

CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);

CREATE TYPE payment_method AS ENUM (
  'bank_transfer',  -- checkout: transferência / cheque
  'cash_on_delivery',
  'paypal'
);

CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE coupon_type AS ENUM ('percent', 'fixed');
CREATE TYPE event_status AS ENUM ('scheduled', 'ongoing', 'finished', 'cancelled');
CREATE TYPE locale_code AS ENUM ('pt', 'en');

-- Campos traduzíveis: JSONB no formato {"pt": "...", "en": "..."}
-- A locale predefinida do site é "pt".

-- -----------------------------------------------------------------------------
-- Função genérica de updated_at
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Utilizadores, autenticação e moradas
-- Login: username ou e-mail + password | Registo: username, full_name, email
-- =============================================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(80)  NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   TEXT         NOT NULL,
  full_name       VARCHAR(180),
  phone           VARCHAR(40),
  avatar_url      TEXT,
  role            user_role    NOT NULL DEFAULT 'student',
  status          user_status  NOT NULL DEFAULT 'active',
  email_verified_at TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT users_username_key UNIQUE (username),
  CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE user_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  remember_me   BOOLEAN NOT NULL DEFAULT false,
  ip_address    INET,
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Facturação do checkout: nome, apelido, telefone, país, província, morada
CREATE TABLE user_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  label         VARCHAR(40) DEFAULT 'billing',
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(40)  NOT NULL,
  country_code  CHAR(2)      NOT NULL DEFAULT 'AO',
  state         VARCHAR(120),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  postal_code   VARCHAR(20),
  is_default    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfil extra do formador (página /instructors e /instructor-details)
CREATE TABLE instructor_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  slug            VARCHAR(160) NOT NULL UNIQUE,
  headline        JSONB NOT NULL DEFAULT '{}'::jsonb, -- cargo: "Programador Web"
  bio             JSONB NOT NULL DEFAULT '{}'::jsonb,
  photo_url       TEXT,
  cover_url       TEXT,
  experience_years SMALLINT,
  education       JSONB NOT NULL DEFAULT '{}'::jsonb,
  website_url     TEXT,
  video_intro_id  VARCHAR(40), -- YouTube id
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE instructor_socials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructor_profiles (id) ON DELETE CASCADE,
  network       VARCHAR(40) NOT NULL, -- facebook, x, linkedin, youtube
  url           TEXT NOT NULL,
  UNIQUE (instructor_id, network)
);

-- CTA "Torne-se formador"
CREATE TABLE instructor_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users (id) ON DELETE SET NULL,
  full_name     VARCHAR(180) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(40),
  specialty     VARCHAR(160),
  message       TEXT,
  status        application_status NOT NULL DEFAULT 'submitted',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Catálogo de cursos
-- Home, /courses, /course-details, filtros arte/finanças/marketing
-- =============================================================================

CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(120) NOT NULL UNIQUE,
  name          JSONB NOT NULL, -- {"pt":"Arte e Design","en":"Art & Design"}
  description   JSONB NOT NULL DEFAULT '{}'::jsonb,
  icon_url      TEXT,
  image_url     TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(180) NOT NULL UNIQUE,
  instructor_id     UUID REFERENCES instructor_profiles (id) ON DELETE SET NULL,
  primary_category_id UUID REFERENCES categories (id) ON DELETE SET NULL,
  title             JSONB NOT NULL,
  excerpt           JSONB NOT NULL DEFAULT '{}'::jsonb,
  description       JSONB NOT NULL DEFAULT '{}'::jsonb, -- abas Visão geral
  image_url         TEXT,
  video_id          VARCHAR(40), -- trailer YouTube
  price             NUMERIC(12,2) NOT NULL DEFAULT 0,
  compare_at_price  NUMERIC(12,2), -- preço riscado ($350 → $300)
  currency          CHAR(3) NOT NULL DEFAULT 'AOA',
  duration_minutes  INTEGER, -- sidebar: duração total
  video_minutes     INTEGER, -- sidebar: horas de vídeo
  skill_level       skill_level NOT NULL DEFAULT 'beginner',
  language          locale_code NOT NULL DEFAULT 'pt',
  is_free           BOOLEAN NOT NULL DEFAULT false,
  is_live           BOOLEAN NOT NULL DEFAULT false, -- secção "Aulas ao vivo"
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  status            course_status NOT NULL DEFAULT 'draft',
  published_at      TIMESTAMPTZ,
  last_content_at   TIMESTAMPTZ, -- "Última actualização"
  access_months     INTEGER NOT NULL DEFAULT 12, -- FAQ: 12 meses de acesso
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Um curso pode ter várias categorias (filtros art-design, finance, marketing)
CREATE TABLE course_categories (
  course_id    UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, category_id)
);

-- Lista "Porquê aprender..."
CREATE TABLE course_benefits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  body        JSONB NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE course_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  title       JSONB NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Currículo: vídeo, pasta/documento, questionário
CREATE TABLE lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES course_sections (id) ON DELETE CASCADE,
  title           JSONB NOT NULL,
  lesson_type     lesson_type NOT NULL DEFAULT 'video',
  duration_minutes INTEGER,
  video_id        VARCHAR(40),
  content_url     TEXT,
  is_preview      BOOLEAN NOT NULL DEFAULT false, -- botão "Pré-visualizar"
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL UNIQUE REFERENCES lessons (id) ON DELETE CASCADE,
  title       JSONB NOT NULL,
  pass_score  SMALLINT NOT NULL DEFAULT 70
);

CREATE TABLE quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       UUID NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  prompt        JSONB NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE quiz_answers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES quiz_questions (id) ON DELETE CASCADE,
  body         JSONB NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- Avaliações do curso (aba Review + formulário "Adicionar avaliação")
CREATE TABLE course_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(180),
  body        TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

-- Aulas ao vivo (home: LiveClass)
CREATE TABLE live_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructor_profiles (id) ON DELETE SET NULL,
  title         JSONB NOT NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,
  meeting_url   TEXT,
  image_url     TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Inscrições, progresso e certificados
-- FAQ: certificado após conclusão; acesso 12 meses
-- =============================================================================

CREATE TABLE enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course_id     UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  order_id      UUID, -- FK adicionada depois de orders
  status        enrollment_status NOT NULL DEFAULT 'active',
  progress_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE TABLE lesson_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
  lesson_id      UUID NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed   BOOLEAN NOT NULL DEFAULT false,
  completed_at   TIMESTAMPTZ,
  UNIQUE (enrollment_id, lesson_id)
);

CREATE TABLE certificates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL UNIQUE REFERENCES enrollments (id) ON DELETE CASCADE,
  code           VARCHAR(40) NOT NULL UNIQUE,
  issued_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url        TEXT
);

-- =============================================================================
-- Carrinho, cupões, checkout e pagamentos
-- /cart, miniCart, /checkout
-- =============================================================================

CREATE TABLE carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  session_id  VARCHAR(80) UNIQUE, -- visitantes não autenticados
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT carts_owner_chk CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     UUID NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price  NUMERIC(12,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, course_id)
);

CREATE TABLE coupons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(40) NOT NULL UNIQUE,
  discount_type coupon_type NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  min_subtotal  NUMERIC(12,2),
  max_uses      INTEGER,
  used_count    INTEGER NOT NULL DEFAULT 0,
  starts_at     TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users (id) ON DELETE SET NULL,
  order_number    VARCHAR(24) NOT NULL UNIQUE,
  status          order_status NOT NULL DEFAULT 'pending',
  payment_method  payment_method,
  coupon_id       UUID REFERENCES coupons (id) ON DELETE SET NULL,
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        CHAR(3) NOT NULL DEFAULT 'AOA',
  note            TEXT, -- checkout: nota
  create_account  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL;

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  course_id   UUID REFERENCES courses (id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL, -- snapshot
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12,2) NOT NULL,
  line_total  NUMERIC(12,2) NOT NULL
);

CREATE TABLE order_billing (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(40)  NOT NULL,
  country_code  CHAR(2)      NOT NULL,
  state         VARCHAR(120),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  postal_code   VARCHAR(20)
);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  method          payment_method NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  amount          NUMERIC(12,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'AOA',
  provider_ref    VARCHAR(120), -- id PayPal / referência bancária
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Programas académicos (home-2 universidade) e candidaturas
-- =============================================================================

CREATE TABLE programs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(180) NOT NULL UNIQUE,
  instructor_id UUID REFERENCES instructor_profiles (id) ON DELETE SET NULL,
  kind          program_kind NOT NULL,
  category_label JSONB NOT NULL DEFAULT '{}'::jsonb, -- "Análise de dados"
  title         JSONB NOT NULL,
  description   JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url     TEXT,
  rating        NUMERIC(2,1),
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE program_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    UUID NOT NULL REFERENCES programs (id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users (id) ON DELETE SET NULL,
  full_name     VARCHAR(180) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(40),
  message       TEXT,
  status        application_status NOT NULL DEFAULT 'submitted',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Eventos (/events)
-- =============================================================================

CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(180) NOT NULL UNIQUE,
  title         JSONB NOT NULL,
  description   JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url     TEXT,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,
  location      JSONB NOT NULL DEFAULT '{}'::jsonb,
  status        event_status NOT NULL DEFAULT 'scheduled',
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users (id) ON DELETE SET NULL,
  full_name   VARCHAR(180) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

-- =============================================================================
-- Blog, categorias, etiquetas e comentários aninhados
-- =============================================================================

CREATE TABLE blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(120) NOT NULL UNIQUE,
  name        JSONB NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE blog_tags (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug  VARCHAR(80) NOT NULL UNIQUE,
  name  JSONB NOT NULL
);

CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(180) NOT NULL UNIQUE,
  author_id       UUID REFERENCES users (id) ON DELETE SET NULL,
  category_id     UUID REFERENCES blog_categories (id) ON DELETE SET NULL,
  title           JSONB NOT NULL,
  excerpt         JSONB NOT NULL DEFAULT '{}'::jsonb,
  body            JSONB NOT NULL DEFAULT '{}'::jsonb,
  quote           JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url       TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blog_post_tags (
  post_id  UUID NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES blog_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comentários com resposta (árvore: parent_id)
CREATE TABLE blog_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES blog_posts (id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES blog_comments (id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users (id) ON DELETE SET NULL,
  author_name   VARCHAR(180) NOT NULL,
  author_email  VARCHAR(255) NOT NULL,
  author_website TEXT,
  body          TEXT NOT NULL,
  is_approved   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Conteúdo institucional
-- =============================================================================

CREATE TABLE faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    JSONB NOT NULL,
  answer      JSONB NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users (id) ON DELETE SET NULL,
  name        VARCHAR(180) NOT NULL,
  country     VARCHAR(80),
  photo_url   TEXT,
  quote       JSONB NOT NULL,
  rating      SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_featured BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Formulário /contact: nome, e-mail, assunto, mensagem
CREATE TABLE contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   VARCHAR(180) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  subject     VARCHAR(180) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter do rodapé
CREATE TABLE newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  confirmed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contactos, redes sociais, textos Sobre (sidebar / footer / about)
CREATE TABLE site_settings (
  key         VARCHAR(80) PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Índices
-- =============================================================================

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_user_sessions_user ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions (expires_at);
CREATE INDEX idx_user_addresses_user ON user_addresses (user_id);

CREATE INDEX idx_courses_status ON courses (status, is_featured);
CREATE INDEX idx_courses_instructor ON courses (instructor_id);
CREATE INDEX idx_courses_category ON courses (primary_category_id);
CREATE INDEX idx_courses_title_trgm ON courses USING gin ((title->>'pt') gin_trgm_ops);

CREATE INDEX idx_lessons_section ON lessons (section_id, sort_order);
CREATE INDEX idx_course_reviews_course ON course_reviews (course_id);
CREATE INDEX idx_live_sessions_starts ON live_sessions (starts_at);

CREATE INDEX idx_enrollments_user ON enrollments (user_id);
CREATE INDEX idx_enrollments_course ON enrollments (course_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress (enrollment_id);

CREATE INDEX idx_cart_items_cart ON cart_items (cart_id);
CREATE INDEX idx_orders_user ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_payments_order ON payments (order_id);

CREATE INDEX idx_events_starts ON events (starts_at);
CREATE INDEX idx_blog_posts_published ON blog_posts (is_published, published_at DESC);
CREATE INDEX idx_blog_comments_post ON blog_comments (post_id);
CREATE INDEX idx_programs_kind ON programs (kind);

-- =============================================================================
-- Triggers updated_at
-- =============================================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users',
    'user_addresses',
    'instructor_profiles',
    'instructor_applications',
    'categories',
    'courses',
    'lessons',
    'course_reviews',
    'carts',
    'orders',
    'programs',
    'program_applications',
    'events',
    'blog_posts',
    'site_settings'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- =============================================================================
-- Vistas para listagens do site (rating médio, nº de lições / alunos)
-- =============================================================================

CREATE VIEW course_stats AS
SELECT
  c.id AS course_id,
  COUNT(DISTINCT l.id) AS lessons_count,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status IN ('active', 'completed')) AS students_count,
  COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS rating_avg,
  COUNT(r.id) AS reviews_count
FROM courses c
LEFT JOIN course_sections s ON s.course_id = c.id
LEFT JOIN lessons l ON l.section_id = s.id
LEFT JOIN enrollments e ON e.course_id = c.id
LEFT JOIN course_reviews r ON r.course_id = c.id AND r.is_approved
GROUP BY c.id;

CREATE VIEW instructor_stats AS
SELECT
  i.id AS instructor_id,
  COUNT(DISTINCT c.id) AS courses_count,
  COUNT(DISTINCT e.user_id) AS students_count,
  COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS rating_avg,
  COUNT(r.id) AS reviews_count
FROM instructor_profiles i
LEFT JOIN courses c ON c.instructor_id = i.id AND c.status = 'published'
LEFT JOIN enrollments e ON e.course_id = c.id AND e.status IN ('active', 'completed')
LEFT JOIN course_reviews r ON r.course_id = c.id AND r.is_approved
GROUP BY i.id;

-- =============================================================================
-- Definições iniciais do site
-- =============================================================================

INSERT INTO site_settings (key, value) VALUES
  ('contact', '{
      "address": {"pt": "Luanda, Angola", "en": "Luanda, Angola"},
      "emails": ["support@example.com", "info@example.com"],
      "phones": ["+9902145698745", "+9902148746845"]
    }'::jsonb),
  ('socials', '{
      "facebook": "",
      "x": "",
      "linkedin": "",
      "youtube": ""
    }'::jsonb),
  ('about', '{
      "pt": "A Academia promove formação de qualidade, com cursos práticos e acompanhamento próximo dos formandos.",
      "en": "The Academy delivers quality training with practical courses and close learner support."
    }'::jsonb),
  ('locales', '["pt", "en"]'::jsonb),
  ('default_currency', '"AOA"'::jsonb);
