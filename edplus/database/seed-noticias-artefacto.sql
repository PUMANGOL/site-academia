-- Notícias do artefacto (títulos, categorias e textos).
-- Idempotente: atualiza se o slug já existir.
-- Imagens: ficheiros já copiados para /assets/img/academia/.

INSERT INTO posts (
  slug, title, excerpt, category, body, cover_image_url,
  is_featured, status, published_at, created_at, updated_at
) VALUES
(
  'liderar-em-tempos-de-mudanca-permanente',
  '{"pt":"Liderar em tempos de mudança permanente","en":"Leading in times of permanent change"}'::jsonb,
  '{"pt":"Os melhores momentos da palestra do Professor Nadim Habib, em parceria com a NOVA SBE Executive Education.","en":"Highlights from Professor Nadim Habib''s talk, in partnership with NOVA SBE Executive Education."}'::jsonb,
  '{"pt":"Eventos","en":"Events"}'::jsonb,
  jsonb_build_object(
    'pt', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','Os melhores momentos da palestra do Professor Nadim Habib, em parceria com a NOVA SBE Executive Education.'))))),
    'en', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','Highlights from Professor Nadim Habib''s talk, in partnership with NOVA SBE Executive Education.')))))
  ),
  '/assets/img/academia/formador-nadim.jpg',
  true, 'published', TIMESTAMPTZ '2026-09-18 10:00:00+01', now(), now()
),
(
  '3-sinais-de-que-o-mercado-mudou',
  '{"pt":"3 sinais de que o mercado mudou — e as principais competências também","en":"3 signs the market has changed — and so have the key skills"}'::jsonb,
  '{"pt":"O novo normal, a experiência já não é suficiente e as competências que estão a ganhar espaço.","en":"The new normal, experience is no longer enough, and the skills that are gaining ground."}'::jsonb,
  '{"pt":"Carreira","en":"Career"}'::jsonb,
  jsonb_build_object(
    'pt', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','O novo normal, a experiência já não é suficiente e as competências que estão a ganhar espaço.'))))),
    'en', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','The new normal, experience is no longer enough, and the skills that are gaining ground.')))))
  ),
  '/assets/img/academia/formacao-inst.jpg',
  false, 'published', TIMESTAMPTZ '2026-09-12 10:00:00+01', now(), now()
),
(
  'pronto-para-o-proximo-desafio',
  '{"pt":"Pronto para o próximo desafio? Descubra os novos cursos","en":"Ready for the next challenge? Discover the new courses"}'::jsonb,
  '{"pt":"HSSE, liderança, atendimento, gestão e tecnologia. O catálogo 2026 está disponível, com valores e datas sob consulta.","en":"HSSE, leadership, customer service, management and technology. The 2026 catalogue is available, with fees and dates on request."}'::jsonb,
  '{"pt":"Academia","en":"Academy"}'::jsonb,
  jsonb_build_object(
    'pt', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','HSSE, liderança, atendimento, gestão e tecnologia. O catálogo 2026 está disponível, com valores e datas sob consulta.'))))),
    'en', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','HSSE, leadership, customer service, management and technology. The 2026 catalogue is available, with fees and dates on request.')))))
  ),
  '/assets/img/academia/hero-braids.jpg',
  false, 'published', TIMESTAMPTZ '2026-09-05 10:00:00+01', now(), now()
),
(
  'aprender-tornou-se-um-processo-continuo',
  '{"pt":"Aprender tornou-se um processo contínuo","en":"Learning has become a continuous process"}'::jsonb,
  '{"pt":"O próximo passo da sua carreira pode começar com uma nova competência.","en":"The next step in your career can start with a new skill."}'::jsonb,
  '{"pt":"Carreira","en":"Career"}'::jsonb,
  jsonb_build_object(
    'pt', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','O próximo passo da sua carreira pode começar com uma nova competência.'))))),
    'en', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','The next step in your career can start with a new skill.')))))
  ),
  '/assets/img/academia/formacao-portrait.jpg',
  false, 'published', TIMESTAMPTZ '2026-08-28 10:00:00+01', now(), now()
),
(
  'as-competencias-que-estao-a-ganhar-espaco',
  '{"pt":"As competências que estão a ganhar espaço","en":"The skills that are gaining ground"}'::jsonb,
  '{"pt":"Inteligência artificial, automação, análise de dados, CRM, estratégia e liderança de equipas.","en":"Artificial intelligence, automation, data analysis, CRM, strategy and team leadership."}'::jsonb,
  '{"pt":"Carreira","en":"Career"}'::jsonb,
  jsonb_build_object(
    'pt', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','Inteligência artificial, automação, análise de dados, CRM, estratégia e liderança de equipas.'))))),
    'en', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','Artificial intelligence, automation, data analysis, CRM, strategy and team leadership.')))))
  ),
  '/assets/img/academia/formacao-laptop.jpg',
  false, 'published', TIMESTAMPTZ '2026-08-20 10:00:00+01', now(), now()
),
(
  'gestores-e-lideres-reunidos-para-debater-a-mudanca',
  '{"pt":"Gestores e líderes reunidos para debater a mudança","en":"Managers and leaders gathered to debate change"}'::jsonb,
  '{"pt":"A sala cheia na palestra \"Liderar em tempos de mudança permanente\".","en":"A full room at the talk \"Leading in times of permanent change\"."}'::jsonb,
  '{"pt":"Eventos","en":"Events"}'::jsonb,
  jsonb_build_object(
    'pt', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','A sala cheia na palestra "Liderar em tempos de mudança permanente".'))))),
    'en', jsonb_build_object('type','doc','content', jsonb_build_array(jsonb_build_object('type','paragraph','content', jsonb_build_array(jsonb_build_object('type','text','text','A full room at the talk "Leading in times of permanent change".')))))
  ),
  '/assets/img/academia/event-talk.jpg',
  false, 'published', TIMESTAMPTZ '2026-08-14 10:00:00+01', now(), now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  category = EXCLUDED.category,
  body = EXCLUDED.body,
  cover_image_url = EXCLUDED.cover_image_url,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();
