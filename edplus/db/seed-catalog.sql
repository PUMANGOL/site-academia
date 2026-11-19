-- Catálogo MVP da Academia Pumangol (Talatona).
-- Substitui cursos/categorias/formadores. Esvazia o carrinho.
-- Correr no Postgres (Neon SQL Editor ou psql) depois das tabelas existirem.
-- Alternativa: npm run db:seed

BEGIN;

DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM course_categories;
DELETE FROM courses;
DELETE FROM instructor_profiles;
DELETE FROM categories;

INSERT INTO categories (slug, name, icon_url, image_url, sort_order) VALUES
  ('seguranca', '{"pt":"Segurança e HSE","en":"Safety & HSE"}'::jsonb, '/assets/img/icons/category/8.svg', '/assets/img/category/8.jpg', 1),
  ('operacoes', '{"pt":"Operações petrolíferas","en":"Petroleum operations"}'::jsonb, '/assets/img/icons/category/3.svg', '/assets/img/category/3.jpg', 2),
  ('lideranca', '{"pt":"Liderança","en":"Leadership"}'::jsonb, '/assets/img/icons/category/4.svg', '/assets/img/category/4.jpg', 3),
  ('inovacao', '{"pt":"Inovação","en":"Innovation"}'::jsonb, '/assets/img/icons/category/2.svg', '/assets/img/category/2.jpg', 4),
  ('desenvolvimento', '{"pt":"Desenvolvimento pessoal","en":"Personal development"}'::jsonb, '/assets/img/icons/category/7.svg', '/assets/img/category/7.jpg', 5),
  ('qualidade', '{"pt":"Qualidade e conformidade","en":"Quality & compliance"}'::jsonb, '/assets/img/icons/category/6.svg', '/assets/img/category/6.jpg', 6);

INSERT INTO instructor_profiles (slug, name, headline, bio, photo_url, is_featured) VALUES
  (
    'carla-mendes',
    'Carla Mendes',
    '{"pt":"Formadora de segurança, HSE e operações","en":"Safety, HSE and operations instructor"}'::jsonb,
    '{"pt":"Formadora da Academia Pumangol, com experiência em segurança industrial, operações de retalho de combustíveis e capacitação de equipas em Talatona.","en":"Pumangol Academy instructor, experienced in industrial safety, fuel retail operations and team training in Talatona."}'::jsonb,
    '/assets/img/courses/author/1.png',
    true
  );

INSERT INTO courses (
  slug, instructor_id, title, excerpt, description, image_url, price, currency,
  lessons_count, students_count, rating_avg, reviews_count, skill_level,
  language, is_featured, status, published_at
)
SELECT
  data.slug,
  instructor_profiles.id,
  data.title,
  data.excerpt,
  data.excerpt,
  data.image_url,
  data.price,
  'AOA',
  data.lessons_count,
  data.students_count,
  data.rating_avg,
  data.reviews_count,
  data.skill_level::skill_level,
  'pt',
  true,
  'published'::course_status,
  now()
FROM instructor_profiles
CROSS JOIN (
  VALUES
    (
      'hse',
      '{"pt":"Segurança e HSE na indústria petrolífera","en":"Safety and HSE in the petroleum industry"}'::jsonb,
      '{"pt":"Normas de segurança, prevenção de acidentes e cultura HSE para operações em Angola. Modalidade presencial e online.","en":"Safety standards, accident prevention and HSE culture for operations in Angola. On-site and online."}'::jsonb,
      '/assets/img/courses/1.jpg',
      '45000.00'::numeric,
      24, 30, '4.9'::numeric, 18, 'beginner'
    ),
    (
      'operacoes-retalho',
      '{"pt":"Operações de retalho de combustíveis","en":"Fuel retail operations"}'::jsonb,
      '{"pt":"Processos de estação de serviço, qualidade do produto e atendimento, com foco no retalho Pumangol.","en":"Service-station processes, product quality and customer service, focused on Pumangol retail."}'::jsonb,
      '/assets/img/courses/2.jpg',
      '58000.00'::numeric,
      18, 28, '4.8'::numeric, 12, 'intermediate'
    ),
    (
      'lideranca-equipas',
      '{"pt":"Liderança e gestão de equipas","en":"Leadership and team management"}'::jsonb,
      '{"pt":"Competências de liderança, comunicação e acompanhamento de desempenho para supervisores e chefias.","en":"Leadership, communication and performance follow-up skills for supervisors and managers."}'::jsonb,
      '/assets/img/courses/3.jpg',
      '72000.00'::numeric,
      16, 26, '4.8'::numeric, 15, 'intermediate'
    ),
    (
      'emergencia',
      '{"pt":"Primeiros socorros e resposta a emergências","en":"First aid and emergency response"}'::jsonb,
      '{"pt":"Resposta a incidentes, primeiros socorros e procedimentos de evacuação em contexto industrial.","en":"Incident response, first aid and evacuation procedures in an industrial setting."}'::jsonb,
      '/assets/img/courses/5.jpg',
      '25000.00'::numeric,
      12, 30, '4.7'::numeric, 9, 'beginner'
    ),
    (
      'qualidade-conformidade',
      '{"pt":"Qualidade, ambiente e conformidade operacional","en":"Quality, environment and operational compliance"}'::jsonb,
      '{"pt":"Boas práticas de qualidade, ambiente e conformidade alinhadas com padrões internacionais e o mercado angolano.","en":"Quality, environment and compliance practices aligned with international standards and the Angolan market."}'::jsonb,
      '/assets/img/courses/4.jpg',
      '85000.00'::numeric,
      20, 22, '4.6'::numeric, 8, 'advanced'
    ),
    (
      'comunicacao-profissional',
      '{"pt":"Desenvolvimento pessoal e comunicação profissional","en":"Personal development and professional communication"}'::jsonb,
      '{"pt":"Comunicação, trabalho em equipa e desenvolvimento pessoal para colaboradores e público externo.","en":"Communication, teamwork and personal development for employees and external learners."}'::jsonb,
      '/assets/img/courses/6.jpg',
      '35000.00'::numeric,
      14, 30, '4.8'::numeric, 11, 'beginner'
    )
) AS data(
  slug, title, excerpt, image_url, price, lessons_count, students_count,
  rating_avg, reviews_count, skill_level
)
WHERE instructor_profiles.slug = 'carla-mendes';

INSERT INTO course_categories (course_id, category_id)
SELECT courses.id, categories.id
FROM courses
JOIN categories ON
  (courses.slug = 'hse' AND categories.slug IN ('seguranca', 'operacoes'))
  OR (courses.slug = 'operacoes-retalho' AND categories.slug IN ('operacoes', 'qualidade'))
  OR (courses.slug = 'lideranca-equipas' AND categories.slug IN ('lideranca', 'desenvolvimento'))
  OR (courses.slug = 'emergencia' AND categories.slug = 'seguranca')
  OR (courses.slug = 'qualidade-conformidade' AND categories.slug IN ('qualidade', 'operacoes'))
  OR (courses.slug = 'comunicacao-profissional' AND categories.slug IN ('desenvolvimento', 'inovacao'));

COMMIT;
