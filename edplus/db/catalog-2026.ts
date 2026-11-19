// Oferta do Catálogo de Formações 2026 (documentation/catalogo-2026.pdf).
// O documento não fixa preços nem datas: ficam sob consulta.

export type CatalogLocale = { pt: string; en: string };

export type CatalogCategorySlug =
	| "hsse"
	| "lideranca"
	| "atendimento"
	| "gestao"
	| "tecnologia";

export type CatalogCourseSeed = {
	slug: string;
	category: CatalogCategorySlug;
	hours: number;
	level: "beginner" | "intermediate" | "advanced";
	title: CatalogLocale;
	objective: CatalogLocale;
	contents?: CatalogLocale;
	audience?: CatalogLocale;
	featured?: boolean;
};

export const catalogCategories: {
	slug: CatalogCategorySlug;
	name: CatalogLocale;
	sortOrder: number;
}[] = [
	{ slug: "hsse", name: { pt: "Formações técnicas / HSSE", en: "Technical training / HSSE" }, sortOrder: 1 },
	{ slug: "lideranca", name: { pt: "Liderança e desenvolvimento humano", en: "Leadership and human development" }, sortOrder: 2 },
	{ slug: "atendimento", name: { pt: "Customer experience e atendimento", en: "Customer experience and service" }, sortOrder: 3 },
	{ slug: "gestao", name: { pt: "Gestão e negócios", en: "Management and business" }, sortOrder: 4 },
	{ slug: "tecnologia", name: { pt: "Tecnologia e literacia digital", en: "Technology and digital literacy" }, sortOrder: 5 },
];

const L = (pt: string, en: string): CatalogLocale => ({ pt, en });

export const catalogCourses: CatalogCourseSeed[] = [
	{
		slug: "conducao-defensiva",
		category: "hsse",
		hours: 8,
		level: "beginner",
		title: L("Condução Defensiva", "Defensive driving"),
		objective: L(
			"Reduzir acidentes e melhorar comportamentos de risco na condução.",
			"Reduce accidents and improve risk behaviour behind the wheel."
		),
		contents: L(
			"Técnicas de condução defensiva, prevenção de acidentes, análise de riscos e boas práticas.",
			"Defensive driving techniques, accident prevention, risk analysis and good practice."
		),
		audience: L(
			"Motoristas profissionais, colaboradores que utilizam viaturas da empresa, operadores de transporte e logística.",
			"Professional drivers, staff who use company vehicles, and transport and logistics operators."
		),
	},
	{
		slug: "empilhador-24",
		category: "hsse",
		hours: 24,
		level: "intermediate",
		title: L(
			"Condutor / Operador de Empilhador e Equipamentos de Carga Automática",
			"Forklift and powered load-equipment operator"
		),
		objective: L(
			"Garantir operação segura e certificada de empilhadores e equipamentos de carga.",
			"Ensure safe, certified operation of forklifts and load-handling equipment."
		),
		contents: L(
			"Normas de segurança, operação prática, manutenção preventiva e requisitos legais.",
			"Safety rules, practical operation, preventive maintenance and legal requirements."
		),
		audience: L(
			"Operadores de armazém, profissionais de logística, indústria e construção civil.",
			"Warehouse operators and professionals in logistics, industry and construction."
		),
	},
	{
		slug: "empilhador-16",
		category: "hsse",
		hours: 16,
		level: "beginner",
		title: L(
			"Práticas seguras de empilhador e equipamentos de carga",
			"Safe forklift and load-equipment practice"
		),
		objective: L(
			"Desenvolver práticas seguras e eficientes em ambientes industriais e logísticos.",
			"Build safe, efficient practice in industrial and logistics settings."
		),
		contents: L(
			"Procedimentos operacionais, segurança no manuseio, organização de cargas e prevenção de acidentes.",
			"Operating procedures, safe handling, load organisation and accident prevention."
		),
		audience: L(
			"Colaboradores de logística, operadores de empilhadores e profissionais de armazéns industriais.",
			"Logistics staff, forklift operators and industrial warehouse professionals."
		),
	},
	{
		slug: "hsst",
		category: "hsse",
		hours: 16,
		level: "intermediate",
		featured: true,
		title: L("Higiene, Saúde e Segurança no Trabalho (HSST)", "Occupational health and safety (HSST)"),
		objective: L(
			"Promover cultura de segurança e prevenção de riscos ocupacionais.",
			"Build a safety culture and prevent occupational risk."
		),
		contents: L(
			"Fundamentos de HSST, ergonomia, prevenção de acidentes e legislação aplicável.",
			"HSST fundamentals, ergonomics, accident prevention and applicable law."
		),
		audience: L(
			"Técnicos de segurança, gestores de operações, supervisores e colaboradores em ambientes industriais.",
			"Safety officers, operations managers, supervisors and staff in industrial settings."
		),
	},
	{
		slug: "primeiros-socorros-i",
		category: "hsse",
		hours: 8,
		level: "beginner",
		title: L("Primeiros Socorros – Nível I", "First aid – Level I"),
		objective: L(
			"Capacitar para actuação imediata em emergências básicas.",
			"Prepare people to act immediately in basic emergencies."
		),
		contents: L(
			"Avaliação inicial, suporte básico de vida e procedimentos simples de emergência.",
			"Initial assessment, basic life support and simple emergency procedures."
		),
		audience: L(
			"Colaboradores em geral, brigadas de emergência e líderes de equipa.",
			"All staff, emergency teams and team leaders."
		),
	},
	{
		slug: "primeiros-socorros-ii",
		category: "hsse",
		hours: 16,
		level: "intermediate",
		title: L("Primeiros Socorros – Nível II", "First aid – Level II"),
		objective: L(
			"Actuar em emergências intermédias, incluindo suporte básico de vida em cenários industriais.",
			"Respond to intermediate emergencies, including basic life support in industrial settings."
		),
		contents: L(
			"Técnicas intermédias de primeiros socorros, suporte básico de vida e actuação em acidentes de trabalho.",
			"Intermediate first-aid techniques, basic life support and response to workplace accidents."
		),
		audience: L(
			"Supervisores, técnicos de segurança, brigadas de emergência e equipas operacionais.",
			"Supervisors, safety officers, emergency teams and operations crews."
		),
	},
	{
		slug: "primeiros-socorros-iii",
		category: "hsse",
		hours: 24,
		level: "advanced",
		title: L("Primeiros Socorros – Nível III", "First aid – Level III"),
		objective: L(
			"Responder a emergências complexas e coordenar equipas em incidentes críticos.",
			"Respond to complex emergencies and coordinate teams in critical incidents."
		),
		contents: L(
			"Suporte avançado de vida, coordenação de resposta e actuação em cenários industriais e acidentes graves.",
			"Advanced life support, response coordination and action in industrial and serious-accident scenarios."
		),
		audience: L(
			"Técnicos de segurança, coordenadores de brigadas, líderes de operações e profissionais de saúde ocupacional.",
			"Safety officers, brigade coordinators, operations leaders and occupational-health professionals."
		),
	},
	{
		slug: "prevencao-incendios",
		category: "hsse",
		hours: 8,
		level: "beginner",
		title: L("Prevenção e Combate a Incêndios", "Fire prevention and response"),
		objective: L(
			"Preparar para prevenção e resposta eficaz em situações de incêndio.",
			"Prepare people to prevent fires and respond effectively."
		),
		contents: L(
			"Tipos de incêndios, uso de extintores, evacuação e planos de emergência.",
			"Fire types, extinguisher use, evacuation and emergency plans."
		),
		audience: L(
			"Brigadas de incêndio, colaboradores de áreas industriais, escritórios e serviços.",
			"Fire teams and staff in industrial areas, offices and services."
		),
	},
	{
		slug: "hazmat",
		category: "hsse",
		hours: 24,
		level: "advanced",
		title: L(
			"Técnico de Segurança de Matérias Perigosas (HazMat)",
			"Hazardous materials safety technician (HazMat)"
		),
		objective: L(
			"Assegurar manuseio, armazenamento e controlo seguro de substâncias perigosas.",
			"Ensure safe handling, storage and control of hazardous substances."
		),
		contents: L(
			"Classificação de matérias perigosas, requisitos legais, procedimentos de segurança e resposta a emergências.",
			"Hazardous-materials classification, legal requirements, safety procedures and emergency response."
		),
		audience: L(
			"Profissionais de logística, transporte, indústria química, petróleo e gás.",
			"Professionals in logistics, transport, chemicals, and oil and gas."
		),
	},
	{
		slug: "transporte-hazmat",
		category: "hsse",
		hours: 16,
		level: "intermediate",
		title: L(
			"Transporte de Mercadorias e Matérias Perigosas (HazMat)",
			"Transport of dangerous goods (HazMat)"
		),
		objective: L(
			"Garantir transporte seguro de matérias perigosas segundo requisitos técnicos e legais.",
			"Carry dangerous goods safely, in line with technical and legal requirements."
		),
		contents: L(
			"Normas de transporte, documentação obrigatória, prevenção de riscos e resposta a incidentes.",
			"Transport rules, required documentation, risk prevention and incident response."
		),
		audience: L(
			"Motoristas de transporte especializado, profissionais de logística e técnicos de segurança.",
			"Specialist drivers, logistics professionals and safety technicians."
		),
	},
	{
		slug: "lideranca-equipas",
		category: "lideranca",
		hours: 16,
		level: "intermediate",
		featured: true,
		title: L("Liderança e Gestão de Equipas", "Leadership and team management"),
		objective: L(
			"Desenvolver competências de liderança e gestão eficaz de equipas.",
			"Develop leadership skills and effective team management."
		),
		contents: L(
			"Estilos de liderança, funções do líder, motivação, comunicação, liderança situacional e coaching.",
			"Leadership styles, the leader's role, motivation, communication, situational leadership and coaching."
		),
		audience: L(
			"Gestores, coordenadores, chefes de equipa e profissionais em cargos de liderança.",
			"Managers, coordinators, team leaders and people in leadership roles."
		),
	},
	{
		slug: "inteligencia-emocional",
		category: "lideranca",
		hours: 12,
		level: "intermediate",
		title: L("Inteligência Emocional", "Emotional intelligence"),
		objective: L(
			"Reconhecer e gerir emoções, melhorar relações interpessoais e aplicar inteligência emocional em contextos profissionais.",
			"Recognise and manage emotions, improve relationships and apply emotional intelligence at work."
		),
		contents: L(
			"Autoconsciência, autorregulação, empatia, gestão de emoções e inteligência emocional na liderança.",
			"Self-awareness, self-regulation, empathy, emotion management and emotional intelligence in leadership."
		),
		audience: L(
			"Líderes, gestores, profissionais de RH e colaboradores em ambientes de alta interacção.",
			"Leaders, managers, HR professionals and staff in high-interaction environments."
		),
	},
	{
		slug: "comunicacao-eficaz",
		category: "lideranca",
		hours: 8,
		level: "beginner",
		title: L("Comunicação Eficaz", "Effective communication"),
		objective: L(
			"Melhorar clareza, assertividade e adaptação da comunicação a diferentes públicos.",
			"Improve clarity, assertiveness and how communication is adapted to different audiences."
		),
		contents: L(
			"Princípios da comunicação, escuta activa, comunicação verbal e não verbal, assertividade e persuasão.",
			"Communication principles, active listening, verbal and non-verbal communication, assertiveness and persuasion."
		),
		audience: L(
			"Profissionais de atendimento, gestores, líderes e colaboradores que comunicam com diferentes públicos.",
			"Service professionals, managers, leaders and anyone who speaks to different audiences."
		),
	},
	{
		slug: "gestao-conflitos",
		category: "lideranca",
		hours: 8,
		level: "intermediate",
		title: L("Gestão de Conflitos", "Conflict management"),
		objective: L(
			"Identificar causas de conflitos e aplicar técnicas de resolução e mediação.",
			"Identify the causes of conflict and apply resolution and mediation techniques."
		),
		contents: L(
			"Tipos de conflitos, estilos de gestão, negociação, comunicação em situações críticas e prevenção.",
			"Types of conflict, management styles, negotiation, communication in critical situations and prevention."
		),
		audience: L(
			"Gestores, líderes de equipa, profissionais de RH e colaboradores em trabalho colaborativo.",
			"Managers, team leaders, HR professionals and people in collaborative work."
		),
	},
	{
		slug: "motivacao-engajamento",
		category: "lideranca",
		hours: 8,
		level: "intermediate",
		title: L("Motivação e Engajamento", "Motivation and engagement"),
		objective: L(
			"Compreender factores de motivação e aplicar estratégias de engajamento.",
			"Understand what motivates people and apply engagement strategies."
		),
		contents: L(
			"Teorias da motivação, reconhecimento, engajamento organizacional e liderança motivadora.",
			"Motivation theories, recognition, organisational engagement and motivating leadership."
		),
		audience: L(
			"Gestores, líderes e profissionais que actuam em ambientes de alta performance.",
			"Managers, leaders and professionals in high-performance environments."
		),
	},
	{
		slug: "gestao-tempo",
		category: "lideranca",
		hours: 8,
		level: "beginner",
		title: L("Gestão do Tempo e Productividade", "Time management and productivity"),
		objective: L(
			"Organizar tarefas e aplicar técnicas de productividade.",
			"Organise tasks and apply productivity techniques."
		),
		contents: L(
			"Planeamento, técnicas de gestão do tempo, ferramentas digitais, gestão de interrupções e equilíbrio pessoal.",
			"Planning, time-management techniques, digital tools, handling interruptions and personal balance."
		),
		audience: L(
			"Profissionais de todas as áreas que desejam optimizar tempo e aumentar a productividade.",
			"Professionals in any field who want to use time better and raise productivity."
		),
	},
	{
		slug: "trabalho-equipa",
		category: "lideranca",
		hours: 8,
		level: "beginner",
		title: L("Trabalho em Equipa", "Teamwork"),
		objective: L(
			"Promover colaboração e melhorar o desempenho colectivo.",
			"Encourage collaboration and improve collective performance."
		),
		contents: L(
			"Dinâmicas de grupo, papéis e responsabilidades, cooperação, confiança e técnicas de team building.",
			"Group dynamics, roles and responsibilities, cooperation, trust and team-building techniques."
		),
		audience: L(
			"Colaboradores de qualquer área, líderes e equipas multidisciplinares.",
			"Staff in any area, leaders and multidisciplinary teams."
		),
	},
	{
		slug: "clarity4d",
		category: "lideranca",
		hours: 8,
		level: "intermediate",
		title: L("Clarity4D", "Clarity4D"),
		objective: L(
			"Compreender perfis comportamentais e potenciar equipas.",
			"Understand behavioural profiles and get more from teams."
		),
		contents: L(
			"Modelo Clarity4D, perfis de comportamento, estilos de comunicação e aplicação prática em equipas.",
			"The Clarity4D model, behaviour profiles, communication styles and practical use in teams."
		),
		audience: L(
			"Líderes, gestores, profissionais de RH e equipas que buscam autoconhecimento e melhoria relacional.",
			"Leaders, managers, HR professionals and teams seeking self-knowledge and better relationships."
		),
	},
	{
		slug: "tecnicas-apresentacao",
		category: "lideranca",
		hours: 8,
		level: "beginner",
		title: L("Técnicas de Apresentação", "Presentation skills"),
		objective: L(
			"Desenvolver apresentações eficazes e impactantes.",
			"Build presentations that are clear and memorable."
		),
		contents: L(
			"Estrutura, storytelling, comunicação verbal e não verbal, recursos audiovisuais e gestão da ansiedade.",
			"Structure, storytelling, verbal and non-verbal communication, visual aids and managing nerves."
		),
		audience: L(
			"Profissionais que realizam apresentações, gestores, líderes e equipas comerciais.",
			"Anyone who presents, plus managers, leaders and commercial teams."
		),
	},
	{
		slug: "pensamento-critico",
		category: "lideranca",
		hours: 8,
		level: "intermediate",
		title: L("Pensamento Crítico", "Critical thinking"),
		objective: L(
			"Desenvolver capacidade analítica e tomada de decisão baseada em evidências.",
			"Strengthen analysis and evidence-based decisions."
		),
		contents: L(
			"Técnicas de análise, identificação de falácias, vieses cognitivos e resolução de problemas complexos.",
			"Analysis techniques, spotting fallacies, cognitive bias and solving complex problems."
		),
		audience: L(
			"Gestores, analistas, profissionais de planeamento e colaboradores que resolvem problemas.",
			"Managers, analysts, planning professionals and people who solve problems."
		),
	},
	{
		slug: "etica-conduta",
		category: "lideranca",
		hours: 8,
		level: "beginner",
		title: L("Ética e Conduta", "Ethics and conduct"),
		objective: L(
			"Promover valores éticos e aplicar códigos de conduta.",
			"Promote ethical values and apply codes of conduct."
		),
		contents: L(
			"Ética profissional, responsabilidade social, sustentabilidade e ética na liderança.",
			"Professional ethics, social responsibility, sustainability and ethics in leadership."
		),
		audience: L(
			"Gestores, líderes, profissionais de RH e colaboradores em qualquer área.",
			"Managers, leaders, HR professionals and staff in any area."
		),
	},
	{
		slug: "atendimento-cliente",
		category: "atendimento",
		hours: 16,
		level: "intermediate",
		title: L("Atendimento ao Cliente", "Customer service"),
		objective: L(
			"Desenvolver competências de comunicação e empatia para garantir satisfação e fidelização.",
			"Build communication and empathy so customers stay satisfied and loyal."
		),
		contents: L(
			"Princípios do atendimento, escuta activa, identificação de necessidades e técnicas de resolução rápida.",
			"Service principles, active listening, identifying needs and fast resolution."
		),
		audience: L(
			"Profissionais de atendimento, vendas, suporte técnico e áreas de relacionamento com clientes.",
			"Service, sales, technical support and customer-relationship professionals."
		),
	},
	{
		slug: "excelencia-atendimento",
		category: "atendimento",
		hours: 16,
		level: "intermediate",
		title: L("Excelência no Atendimento", "Service excellence"),
		objective: L(
			"Elevar o padrão de qualidade e criar experiências positivas e memoráveis.",
			"Raise the standard of service and create experiences people remember."
		),
		contents: L(
			"Conceito de excelência, postura profissional, superação de expectativas e boas práticas.",
			"What excellence means, professional presence, exceeding expectations and good practice."
		),
		audience: L(
			"Colaboradores de atendimento, equipas comerciais, gestores de relacionamento e profissionais de serviços.",
			"Service staff, commercial teams, relationship managers and service professionals."
		),
	},
	{
		slug: "gestao-reclamacoes",
		category: "atendimento",
		hours: 16,
		level: "intermediate",
		title: L("Gestão de Reclamações", "Complaint handling"),
		objective: L(
			"Lidar com reclamações de forma construtiva e transformá-las em oportunidades de melhoria.",
			"Handle complaints constructively and turn them into improvements."
		),
		contents: L(
			"Tipos de reclamações, técnicas de escuta, resposta eficaz, comunicação assertiva e procedimentos internos.",
			"Types of complaint, listening techniques, effective replies, assertive communication and internal procedures."
		),
		audience: L(
			"Profissionais de atendimento, gestores de qualidade, equipas comerciais e responsáveis por suporte ao cliente.",
			"Service professionals, quality managers, commercial teams and customer-support leads."
		),
	},
	{
		slug: "customer-experience",
		category: "atendimento",
		hours: 16,
		level: "intermediate",
		title: L("Customer Experience", "Customer experience"),
		objective: L(
			"Compreender e melhorar a jornada do cliente, criando experiências diferenciadoras.",
			"Understand and improve the customer journey, and create experiences that stand apart."
		),
		contents: L(
			"Conceito de CX, pontos de contacto, emoções e percepções, métricas (NPS, CSAT, CES) e estratégias de melhoria.",
			"What CX means, touchpoints, emotions and perceptions, metrics (NPS, CSAT, CES) and ways to improve."
		),
		audience: L(
			"Gestores de marketing, profissionais de atendimento, equipas comerciais e responsáveis pela experiência do cliente.",
			"Marketing managers, service professionals, commercial teams and customer-experience leads."
		),
	},
	{
		slug: "financas-nao-financeiros",
		category: "gestao",
		hours: 20,
		level: "intermediate",
		featured: true,
		title: L("Finanças para Não Financeiros", "Finance for non-financial managers"),
		objective: L(
			"Compreender conceitos básicos de finanças e interpretar informação financeira para apoiar decisões.",
			"Grasp basic finance and read financial information well enough to support decisions."
		),
		contents: L(
			"Noções de contabilidade, demonstrações financeiras, análise de custos, indicadores de desempenho e tomada de decisão.",
			"Accounting basics, financial statements, cost analysis, performance indicators and decision-making."
		),
		audience: L(
			"Gestores, coordenadores, técnicos e profissionais sem formação financeira que participam em decisões de negócio.",
			"Managers, coordinators and professionals without a finance background who take part in business decisions."
		),
	},
	{
		slug: "gestao-projectos",
		category: "gestao",
		hours: 16,
		level: "intermediate",
		title: L("Gestão de Projectos (Introdução)", "Project management (introduction)"),
		objective: L(
			"Conhecer metodologias e ferramentas essenciais de gestão de projectos e aplicar boas práticas na execução.",
			"Learn essential project methods and tools, and apply good practice in delivery."
		),
		contents: L(
			"Ciclo de vida do projecto, planeamento, definição de objectivos, gestão de recursos, riscos e monitorização.",
			"Project life cycle, planning, objectives, resources, risk and monitoring."
		),
		audience: L(
			"Gestores de projectos, coordenadores, líderes de equipa e profissionais envolvidos em iniciativas estratégicas.",
			"Project managers, coordinators, team leaders and people involved in strategic initiatives."
		),
	},
	{
		slug: "planeamento-estrategico",
		category: "gestao",
		hours: 16,
		level: "advanced",
		title: L("Planeamento Estratégico", "Strategic planning"),
		objective: L(
			"Desenvolver competências para definir estratégias organizacionais e alinhar objectivos com resultados.",
			"Learn to set organisational strategy and align objectives with results."
		),
		contents: L(
			"Análise SWOT, definição de missão e visão, objectivos estratégicos, planos de acção e indicadores de desempenho.",
			"SWOT analysis, mission and vision, strategic objectives, action plans and performance indicators."
		),
		audience: L(
			"Directores, gestores, líderes de equipa e profissionais envolvidos em planeamento e decisão estratégica.",
			"Directors, managers, team leaders and people involved in planning and strategic decisions."
		),
	},
	{
		slug: "gestao-risco",
		category: "gestao",
		hours: 20,
		level: "advanced",
		title: L("Gestão de Risco", "Risk management"),
		objective: L(
			"Identificar, avaliar e mitigar riscos organizacionais de forma estruturada.",
			"Identify, assess and mitigate organisational risk in a structured way."
		),
		contents: L(
			"Tipos de risco, metodologias de análise, planos de mitigação, monitorização e gestão preventiva.",
			"Types of risk, analysis methods, mitigation plans, monitoring and prevention."
		),
		audience: L(
			"Gestores, técnicos de segurança, profissionais de compliance e responsáveis por operações críticas.",
			"Managers, safety technicians, compliance professionals and people responsible for critical operations."
		),
	},
	{
		slug: "alfabetizacao-digital",
		category: "tecnologia",
		hours: 8,
		level: "beginner",
		title: L("Alfabetização Digital", "Digital literacy"),
		objective: L(
			"Competências básicas em ferramentas digitais, colaboração online e uso seguro da tecnologia no trabalho.",
			"Core skills in digital tools, online collaboration and safe use of technology at work."
		),
	},
	{
		slug: "transformacao-digital",
		category: "tecnologia",
		hours: 16,
		level: "intermediate",
		title: L("Transformação Digital", "Digital transformation"),
		objective: L(
			"Compreensão de modelos digitais, impacto no negócio, processos e mudança cultural.",
			"Understand digital models, their impact on the business, processes and cultural change."
		),
	},
	{
		slug: "introducao-ia",
		category: "tecnologia",
		hours: 8,
		level: "beginner",
		title: L("Introdução à Inteligência Artificial", "Introduction to artificial intelligence"),
		objective: L(
			"Fundamentos de IA, conceitos-chave, casos de uso e impacto no trabalho e na tomada de decisão.",
			"AI fundamentals, key concepts, use cases and the impact on work and decisions."
		),
	},
	{
		slug: "ia-retail",
		category: "tecnologia",
		hours: 16,
		level: "intermediate",
		title: L("IA Aplicada ao Retail", "AI applied to retail"),
		objective: L(
			"Aplicação prática da IA em vendas, experiência do cliente, previsão de procura e eficiência operacional.",
			"Practical use of AI in sales, customer experience, demand forecasting and operational efficiency."
		),
	},
	{
		slug: "ciberseguranca",
		category: "tecnologia",
		hours: 8,
		level: "beginner",
		title: L("Cibersegurança", "Cybersecurity"),
		objective: L(
			"Boas práticas de segurança da informação, protecção de dados e prevenção de riscos digitais.",
			"Good practice in information security, data protection and preventing digital risk."
		),
	},
	{
		slug: "excel-basico",
		category: "tecnologia",
		hours: 20,
		level: "beginner",
		title: L("Excel (Básico)", "Excel (beginner)"),
		objective: L(
			"Fundamentos de folhas de cálculo, fórmulas simples e organização de dados.",
			"Spreadsheet fundamentals, simple formulas and organising data."
		),
	},
	{
		slug: "excel-intermedio",
		category: "tecnologia",
		hours: 24,
		level: "intermediate",
		title: L("Excel (Intermédio)", "Excel (intermediate)"),
		objective: L(
			"Automação, análise complexa, dashboards e apoio à decisão.",
			"Automation, deeper analysis, dashboards and decision support."
		),
	},
	{
		slug: "power-bi",
		category: "tecnologia",
		hours: 24,
		level: "intermediate",
		title: L("Power BI", "Power BI"),
		objective: L(
			"Modelação de dados, criação de dashboards interactivos e reporting para gestão.",
			"Data modelling, interactive dashboards and reporting for management."
		),
	},
];

export function catalogDescription(course: CatalogCourseSeed): CatalogLocale {
	const join = (locale: "pt" | "en", labels: { objective: string; contents: string; audience: string }) => {
		const parts = [`${labels.objective} ${course.objective[locale]}`];
		if (course.contents) parts.push(`${labels.contents} ${course.contents[locale]}`);
		if (course.audience) parts.push(`${labels.audience} ${course.audience[locale]}`);
		return parts.join("\n\n");
	};

	return {
		pt: join("pt", { objective: "Objectivos:", contents: "Conteúdos:", audience: "Público-alvo:" }),
		en: join("en", { objective: "Objectives:", contents: "Contents:", audience: "Audience:" }),
	};
}
