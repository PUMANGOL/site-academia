import type { Locale } from "@/app/i18n/messages";

export type LegalItem = string | { label: string; text: string };

export type LegalBlock =
	| { type: "p"; text: string }
	| { type: "list"; items: LegalItem[] }
	| { type: "links"; items: { label: string; href: string }[] };

export type LegalSection = {
	heading: string;
	blocks?: LegalBlock[];
	subsections?: { heading: string; blocks: LegalBlock[] }[];
};

export type LegalDocument = {
	title: string;
	effective?: string;
	intro?: string[];
	sections: LegalSection[];
	closing?: string;
};

const cookieLinks = [
	{
		label: "Google Chrome",
		href: "https://support.google.com/chrome/answer/95647",
	},
	{
		label: "Mozilla Firefox",
		href: "https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer",
	},
	{
		label: "Safari",
		href: "https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac",
	},
	{
		label: "Microsoft Edge",
		href: "https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
	},
];

const termsPt: LegalDocument = {
	title: "Termos e condições de utilização",
	sections: [
		{
			heading: "1. Introdução",
			blocks: [
				{
					type: "p",
					text: "Bem-vindo ao website da Pumangol. Ao aceder e utilizar este website, o utilizador aceita cumprir os presentes Termos e Condições. Se não concordar com qualquer disposição, deverá abster-se de utilizar este website.",
				},
			],
		},
		{
			heading: "2. Objectivo do Website",
			blocks: [
				{
					type: "p",
					text: "Este website destina-se a fornecer informações institucionais, comerciais e promocionais sobre a Pumangol, os seus produtos, serviços e iniciativas.",
				},
			],
		},
		{
			heading: "3. Acesso e Utilização",
			blocks: [
				{
					type: "p",
					text: "O acesso ao website é gratuito, podendo estar sujeito a restrições legais ou comerciais.",
				},
				{
					type: "p",
					text: "O utilizador compromete-se a não utilizar o website para fins ilícitos, fraudulentos ou que possam prejudicar a Pumangol ou terceiros.",
				},
				{
					type: "p",
					text: "A Pumangol reserva-se o direito de suspender ou restringir o acesso ao website, sem aviso prévio, em caso de manutenção, actualização ou por razões de segurança.",
				},
			],
		},
		{
			heading: "4. Direitos de Propriedade Intelectual",
			blocks: [
				{
					type: "p",
					text: "Todo o conteúdo presente no website (textos, imagens, logótipos, gráficos, vídeos e outros materiais) é propriedade exclusiva da Pumangol ou utilizado com autorização dos respectivos titulares.",
				},
				{
					type: "p",
					text: "O utilizador não pode copiar, modificar, reproduzir, distribuir ou utilizar qualquer conteúdo sem autorização prévia e por escrito da Pumangol.",
				},
			],
		},
		{
			heading: "5. Protecção de Dados e Privacidade",
			blocks: [
				{
					type: "p",
					text: "A utilização do website está sujeita à Política de Privacidade da Pumangol, a qual regula a recolha, tratamento e protecção de dados pessoais.",
				},
				{
					type: "p",
					text: "O utilizador poderá exercer os seus direitos de acesso, rectificação ou eliminação de dados, nos termos da legislação aplicável.",
				},
			],
		},
		{
			heading: "6. Ligações para Terceiros",
			blocks: [
				{
					type: "p",
					text: "O website pode conter hiperligações para websites de terceiros. A Pumangol não se responsabiliza pelo conteúdo, exactidão, políticas de privacidade ou práticas desses websites.",
				},
				{
					type: "p",
					text: "O acesso a websites externos é da inteira responsabilidade do utilizador.",
				},
			],
		},
		{
			heading: "7. Responsabilidade e Garantias",
			blocks: [
				{
					type: "p",
					text: "A Pumangol envida esforços para garantir que as informações disponibilizadas no website são exactas e actualizadas. No entanto, não garante a ausência de erros ou omissões.",
				},
				{
					type: "p",
					text: "O utilizador reconhece que a utilização do website é feita por sua conta e risco. A Pumangol não será responsável por quaisquer danos directos ou indirectos resultantes do uso do website ou da impossibilidade de o utilizar.",
				},
			],
		},
		{
			heading: "8. Modificações dos Termos e Condições",
			blocks: [
				{
					type: "p",
					text: "A Pumangol reserva-se o direito de modificar estes Termos e Condições a qualquer momento, sem aviso prévio. Recomenda-se a consulta periódica desta secção para estar a par de eventuais alterações.",
				},
			],
		},
		{
			heading: "9. Lei Aplicável e Jurisdição",
			blocks: [
				{
					type: "p",
					text: "Estes Termos e Condições regem-se pela legislação em vigor na República de Angola. Qualquer litígio decorrente da utilização do website será submetido aos tribunais competentes de Luanda.",
				},
			],
		},
		{
			heading: "10. Contacto",
			blocks: [
				{
					type: "p",
					text: "Para qualquer questão relacionada com estes Termos e Condições, o utilizador poderá contactar a Pumangol através dos meios disponibilizados no website.",
				},
			],
		},
	],
};

const privacyPt: LegalDocument = {
	title: "Política de Privacidade e Cookies",
	effective: "Data de Entrada em Vigor: 21 de Janeiro de 2025",
	intro: [
		'Na pumangol.co.ao ("nós", "nosso", "nos"), estamos comprometidos em proteger e respeitar a sua privacidade. Esta Política de Privacidade e Cookies explica como recolhemos, utilizamos e protegemos os seus dados pessoais quando visita o nosso site, pumangol.co.ao. Também descreve como utilizamos cookies e tecnologias semelhantes para melhorar a sua experiência no nosso site.',
		"Ao utilizar este site, o utilizador concorda com as práticas descritas nesta política. Se não concordar com os termos aqui descritos, pedimos que se abstenha de utilizar o site.",
	],
	sections: [
		{
			heading: "1. Política de Privacidade",
			subsections: [
				{
					heading: "1.1. Informações que Recolhemos",
					blocks: [
						{
							type: "p",
							text: "Podemos recolher os seguintes tipos de informações pessoais quando visita ou interage com o nosso site:",
						},
						{
							type: "list",
							items: [
								{
									label: "Informações de Identificação Pessoal",
									text: "Isto pode incluir o seu nome, endereço de e-mail, número de telefone e quaisquer outros dados pessoais que você forneça voluntariamente ao preencher formulários, entrar em contacto connosco ou subscrever as nossas newsletters.",
								},
								{
									label: "Informações Técnicas",
									text: "Isto inclui informações sobre o seu dispositivo, endereço IP, tipo de navegador, sistema operativo e ações de navegação, recolhidas automaticamente quando visita o nosso site.",
								},
								{
									label: "Dados de Utilização",
									text: "Podemos recolher informações sobre como interage com o nosso site, incluindo páginas visitadas, links clicados e tempo de visita.",
								},
							],
						},
					],
				},
				{
					heading: "1.2. Como Usamos as Suas Informações",
					blocks: [
						{
							type: "p",
							text: "Utilizamos os seus dados pessoais para os seguintes fins:",
						},
						{
							type: "list",
							items: [
								{
									label: "Fornecimento de Serviços",
									text: "Para responder às suas perguntas, fornecer informações e oferecer serviços solicitados através do nosso site.",
								},
								{
									label: "Melhoria da Experiência do Utilizador",
									text: "Para personalizar a sua experiência no site e garantir que o conteúdo seja relevante para os seus interesses.",
								},
								{
									label: "Marketing e Comunicação",
									text: "Para enviar materiais promocionais, newsletters e atualizações relacionadas com os nossos serviços, caso tenha optado por receber tais comunicações.",
								},
								{
									label: "Análise",
									text: "Para analisar como o nosso site é utilizado e melhorar a funcionalidade, garantindo uma melhor experiência de navegação.",
								},
								{
									label: "Cumprimento de Obrigações Legais",
									text: "Para cumprir com as leis, regulamentos e obrigações contratuais aplicáveis.",
								},
							],
						},
					],
				},
				{
					heading: "1.3. Como Protegemos as Suas Informações",
					blocks: [
						{
							type: "p",
							text: "Utilizamos medidas de segurança adequadas para proteger os seus dados pessoais contra acesso, alteração ou destruição não autorizada. Isto inclui encriptação, servidores seguros e auditorias regulares de segurança. No entanto, note que nenhum método de transmissão via Internet ou armazenamento electrónico é completamente seguro, e não podemos garantir a segurança absoluta dos seus dados.",
						},
					],
				},
				{
					heading: "1.4. Partilha das Suas Informações",
					blocks: [
						{
							type: "p",
							text: "Não vendemos, alugamos nem partilhamos os seus dados pessoais com terceiros, exceto conforme descrito abaixo:",
						},
						{
							type: "list",
							items: [
								{
									label: "Prestadores de Serviços",
									text: "Podemos partilhar as suas informações com prestadores de serviços de confiança que nos auxiliam na operação do site, na realização dos nossos negócios ou no atendimento aos utilizadores (ex.: prestadores de e-mail, empresas de alojamento). Estes prestadores são obrigados a proteger os seus dados e a utilizá-los apenas para os fins para os quais foram partilhados.",
								},
								{
									label: "Cumprimento Legal",
									text: "Podemos divulgar os seus dados pessoais às autoridades ou entidades legais quando exigido por lei ou em resposta a um pedido legal válido.",
								},
							],
						},
					],
				},
				{
					heading: "1.5. Seus Direitos de Proteção de Dados",
					blocks: [
						{
							type: "p",
							text: "Dependendo da sua localização, você pode ter o direito de:",
						},
						{
							type: "list",
							items: [
								"Aceder aos dados pessoais que temos sobre si.",
								"Corrigir quaisquer dados imprecisos ou incompletos.",
								"Solicitar a eliminação dos seus dados.",
								"Restringir ou opor-se ao tratamento dos seus dados.",
								"Retirar o consentimento a qualquer momento, sem afetar a licitude do tratamento com base no consentimento antes da sua retirada.",
							],
						},
						{
							type: "p",
							text: "Para exercer esses direitos, por favor, entre em contacto connosco utilizando os dados fornecidos abaixo.",
						},
					],
				},
			],
		},
		{
			heading: "2. Política de Cookies",
			subsections: [
				{
					heading: "2.1. O que São Cookies?",
					blocks: [
						{
							type: "p",
							text: "Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, smartphone ou tablet) quando visita um site. Eles ajudam o site a lembrar as suas ações e preferências (como detalhes de login ou definições de idioma) ao longo do tempo, proporcionando uma experiência mais personalizada.",
						},
					],
				},
				{
					heading: "2.2. Tipos de Cookies que Utilizamos",
					blocks: [
						{
							type: "p",
							text: "Utilizamos os seguintes tipos de cookies em pumangol.co.ao:",
						},
						{
							type: "list",
							items: [
								{
									label: "Cookies Necessários",
									text: "Estes cookies são essenciais para o funcionamento do nosso site. Eles permitem funcionalidades básicas, como navegação pelas páginas e acesso a áreas seguras do site. Sem estes cookies, o site não funcionará corretamente.",
								},
								{
									label: "Cookies de Desempenho",
									text: "Estes cookies recolhem informações sobre como os visitantes utilizam o nosso site (ex.: quais páginas são mais visitadas ou se os utilizadores encontram erros). Esta informação ajuda-nos a melhorar o desempenho do site e a melhorar a experiência do utilizador.",
								},
								{
									label: "Cookies Funcionais",
									text: "Estes cookies lembram-se das escolhas que faz (como o seu idioma ou região) para proporcionar uma experiência mais personalizada. Eles também podem ser utilizados para oferecer funcionalidades melhoradas, como vídeos ou chat ao vivo.",
								},
								{
									label: "Cookies de Publicidade e Marketing",
									text: "Estes cookies são usados para mostrar anúncios mais relevantes para si com base nos seus interesses e comportamento de navegação. Eles ajudam a rastrear a eficácia das nossas campanhas publicitárias.",
								},
								{
									label: "Cookies de Terceiros",
									text: "Podemos utilizar cookies de terceiros para publicidade, análise e integração com redes sociais. Estes cookies são definidos por terceiros, como Google, Facebook, entre outros, e o seu uso é regulado pelas suas próprias políticas de privacidade.",
								},
							],
						},
					],
				},
				{
					heading: "2.3. Como Gerir Cookies",
					blocks: [
						{
							type: "p",
							text: "Você tem a capacidade de controlar e/ou excluir cookies a qualquer momento, ajustando as definições no seu navegador. Pode aceitar ou rejeitar cookies, eliminar cookies existentes e definir preferências para o futuro. No entanto, note que bloquear certos tipos de cookies pode afetar a sua experiência no nosso site.",
						},
						{
							type: "p",
							text: "Para gerir os cookies, pode seguir as instruções fornecidas pela secção de ajuda do seu navegador. Abaixo estão links para gerir cookies nos navegadores mais comuns:",
						},
						{ type: "links", items: cookieLinks },
					],
				},
				{
					heading: "2.4. Alterações à Nossa Política de Cookies",
					blocks: [
						{
							type: "p",
							text: 'Podemos atualizar a nossa Política de Cookies de tempos em tempos para refletir mudanças nas nossas práticas ou por outras razões operacionais, legais ou regulamentares. Recomendamos que reveja esta política periodicamente. A "Data de Entrada em Vigor" no topo desta página indica a atualização mais recente.',
						},
					],
				},
			],
		},
		{
			heading: "3. Contacte-nos",
			blocks: [
				{
					type: "p",
					text: "Se tiver alguma dúvida, preocupação ou pedido em relação aos seus dados pessoais ou à nossa Política de Privacidade e Cookies, por favor utilize os meios de contacto disponibilizados no website.",
				},
				{
					type: "p",
					text: "Responderemos ao seu pedido o mais rapidamente possível e de acordo com as leis de proteção de dados aplicáveis.",
				},
			],
		},
	],
	closing:
		"Esta Política de Privacidade e Cookies foi elaborada para mantê-lo informado sobre como protegemos os seus dados e respeitamos a sua privacidade ao utilizar o nosso site. Ao continuar a utilizar o nosso site, você consente com os termos descritos acima.",
};

const termsEn: LegalDocument = {
	title: "Terms and Conditions of Use",
	sections: [
		{
			heading: "1. Introduction",
			blocks: [
				{
					type: "p",
					text: "Welcome to the Pumangol website. By accessing and using this website, the user agrees to comply with these Terms and Conditions. If you do not agree with any provision, you should refrain from using this website.",
				},
			],
		},
		{
			heading: "2. Purpose of the Website",
			blocks: [
				{
					type: "p",
					text: "This website is intended to provide institutional, commercial and promotional information about Pumangol, its products, services and initiatives.",
				},
			],
		},
		{
			heading: "3. Access and Use",
			blocks: [
				{
					type: "p",
					text: "Access to the website is free of charge and may be subject to legal or commercial restrictions.",
				},
				{
					type: "p",
					text: "The user undertakes not to use the website for unlawful or fraudulent purposes, or in any way that may harm Pumangol or third parties.",
				},
				{
					type: "p",
					text: "Pumangol reserves the right to suspend or restrict access to the website, without prior notice, in the event of maintenance, updates or for security reasons.",
				},
			],
		},
		{
			heading: "4. Intellectual Property Rights",
			blocks: [
				{
					type: "p",
					text: "All content on the website (text, images, logos, graphics, videos and other materials) is the exclusive property of Pumangol or is used with the authorisation of the respective rights holders.",
				},
				{
					type: "p",
					text: "The user may not copy, modify, reproduce, distribute or use any content without Pumangol's prior written authorisation.",
				},
			],
		},
		{
			heading: "5. Data Protection and Privacy",
			blocks: [
				{
					type: "p",
					text: "Use of the website is subject to Pumangol's Privacy Policy, which governs the collection, processing and protection of personal data.",
				},
				{
					type: "p",
					text: "The user may exercise the rights of access, rectification or erasure of data, under the applicable legislation.",
				},
			],
		},
		{
			heading: "6. Links to Third Parties",
			blocks: [
				{
					type: "p",
					text: "The website may contain hyperlinks to third-party websites. Pumangol is not responsible for the content, accuracy, privacy policies or practices of those websites.",
				},
				{
					type: "p",
					text: "Access to external websites is the sole responsibility of the user.",
				},
			],
		},
		{
			heading: "7. Liability and Warranties",
			blocks: [
				{
					type: "p",
					text: "Pumangol endeavours to ensure that the information made available on the website is accurate and up to date. It does not, however, guarantee the absence of errors or omissions.",
				},
				{
					type: "p",
					text: "The user acknowledges that use of the website is at their own risk. Pumangol shall not be liable for any direct or indirect damage resulting from use of the website or from the inability to use it.",
				},
			],
		},
		{
			heading: "8. Changes to the Terms and Conditions",
			blocks: [
				{
					type: "p",
					text: "Pumangol reserves the right to amend these Terms and Conditions at any time, without prior notice. We recommend consulting this section periodically in order to keep up with any changes.",
				},
			],
		},
		{
			heading: "9. Governing Law and Jurisdiction",
			blocks: [
				{
					type: "p",
					text: "These Terms and Conditions are governed by the legislation in force in the Republic of Angola. Any dispute arising from use of the website shall be submitted to the competent courts of Luanda.",
				},
			],
		},
		{
			heading: "10. Contact",
			blocks: [
				{
					type: "p",
					text: "For any question relating to these Terms and Conditions, the user may contact Pumangol through the means made available on the website.",
				},
			],
		},
	],
};

const privacyEn: LegalDocument = {
	title: "Privacy and Cookies Policy",
	effective: "Effective date: 21 January 2025",
	intro: [
		'At pumangol.co.ao ("we", "our", "us"), we are committed to protecting and respecting your privacy. This Privacy and Cookies Policy explains how we collect, use and protect your personal data when you visit our website, pumangol.co.ao. It also describes how we use cookies and similar technologies to improve your experience on our website.',
		"By using this website, the user agrees to the practices described in this policy. If you do not agree with the terms set out here, please refrain from using the website.",
	],
	sections: [
		{
			heading: "1. Privacy Policy",
			subsections: [
				{
					heading: "1.1. Information We Collect",
					blocks: [
						{
							type: "p",
							text: "We may collect the following types of personal information when you visit or interact with our website:",
						},
						{
							type: "list",
							items: [
								{
									label: "Personal identification information",
									text: "This may include your name, email address, telephone number and any other personal data you voluntarily provide when filling in forms, contacting us or subscribing to our newsletters.",
								},
								{
									label: "Technical information",
									text: "This includes information about your device, IP address, browser type, operating system and browsing actions, collected automatically when you visit our website.",
								},
								{
									label: "Usage data",
									text: "We may collect information about how you interact with our website, including pages visited, links clicked and time spent on the site.",
								},
							],
						},
					],
				},
				{
					heading: "1.2. How We Use Your Information",
					blocks: [
						{
							type: "p",
							text: "We use your personal data for the following purposes:",
						},
						{
							type: "list",
							items: [
								{
									label: "Provision of services",
									text: "To answer your questions, provide information and offer services requested through our website.",
								},
								{
									label: "Improvement of the user experience",
									text: "To personalise your experience on the website and ensure that the content is relevant to your interests.",
								},
								{
									label: "Marketing and communication",
									text: "To send promotional materials, newsletters and updates related to our services, where you have opted in to receive such communications.",
								},
								{
									label: "Analysis",
									text: "To analyse how our website is used and improve its functionality, ensuring a better browsing experience.",
								},
								{
									label: "Compliance with legal obligations",
									text: "To comply with applicable laws, regulations and contractual obligations.",
								},
							],
						},
					],
				},
				{
					heading: "1.3. How We Protect Your Information",
					blocks: [
						{
							type: "p",
							text: "We use appropriate security measures to protect your personal data against unauthorised access, alteration or destruction. This includes encryption, secure servers and regular security audits. Please note, however, that no method of transmission over the Internet or of electronic storage is completely secure, and we cannot guarantee the absolute security of your data.",
						},
					],
				},
				{
					heading: "1.4. Sharing Your Information",
					blocks: [
						{
							type: "p",
							text: "We do not sell, rent or share your personal data with third parties, except as described below:",
						},
						{
							type: "list",
							items: [
								{
									label: "Service providers",
									text: "We may share your information with trusted service providers who assist us in operating the website, conducting our business or serving users (e.g. email providers and hosting companies). These providers are required to protect your data and to use it only for the purposes for which it was shared.",
								},
								{
									label: "Legal compliance",
									text: "We may disclose your personal data to authorities or legal entities when required by law or in response to a valid legal request.",
								},
							],
						},
					],
				},
				{
					heading: "1.5. Your Data Protection Rights",
					blocks: [
						{
							type: "p",
							text: "Depending on your location, you may have the right to:",
						},
						{
							type: "list",
							items: [
								"Access the personal data we hold about you.",
								"Correct any inaccurate or incomplete data.",
								"Request the erasure of your data.",
								"Restrict or object to the processing of your data.",
								"Withdraw consent at any time, without affecting the lawfulness of processing based on consent before its withdrawal.",
							],
						},
						{
							type: "p",
							text: "To exercise these rights, please contact us using the details provided below.",
						},
					],
				},
			],
		},
		{
			heading: "2. Cookies Policy",
			subsections: [
				{
					heading: "2.1. What Are Cookies?",
					blocks: [
						{
							type: "p",
							text: "Cookies are small text files stored on your device (computer, smartphone or tablet) when you visit a website. They help the website remember your actions and preferences (such as login details or language settings) over time, providing a more personalised experience.",
						},
					],
				},
				{
					heading: "2.2. Types of Cookies We Use",
					blocks: [
						{
							type: "p",
							text: "We use the following types of cookies on pumangol.co.ao:",
						},
						{
							type: "list",
							items: [
								{
									label: "Necessary cookies",
									text: "These cookies are essential for our website to function. They enable basic features such as page navigation and access to secure areas of the website. Without these cookies, the website will not function properly.",
								},
								{
									label: "Performance cookies",
									text: "These cookies collect information about how visitors use our website (e.g. which pages are visited most, or whether users encounter errors). This information helps us improve the website's performance and the user experience.",
								},
								{
									label: "Functional cookies",
									text: "These cookies remember choices you make (such as your language or region) in order to provide a more personalised experience. They may also be used to offer enhanced features, such as videos or live chat.",
								},
								{
									label: "Advertising and marketing cookies",
									text: "These cookies are used to show advertisements that are more relevant to you, based on your interests and browsing behaviour. They help measure the effectiveness of our advertising campaigns.",
								},
								{
									label: "Third-party cookies",
									text: "We may use third-party cookies for advertising, analytics and integration with social networks. These cookies are set by third parties, such as Google and Facebook, among others, and their use is governed by their own privacy policies.",
								},
							],
						},
					],
				},
				{
					heading: "2.3. How to Manage Cookies",
					blocks: [
						{
							type: "p",
							text: "You can control and/or delete cookies at any time by adjusting your browser settings. You may accept or reject cookies, delete existing cookies and set preferences for the future. Please note, however, that blocking certain types of cookies may affect your experience on our website.",
						},
						{
							type: "p",
							text: "To manage cookies, follow the instructions in your browser's help section. Below are links for managing cookies in the most common browsers:",
						},
						{ type: "links", items: cookieLinks },
					],
				},
				{
					heading: "2.4. Changes to Our Cookies Policy",
					blocks: [
						{
							type: "p",
							text: 'We may update our Cookies Policy from time to time to reflect changes in our practices or for other operational, legal or regulatory reasons. We recommend that you review this policy periodically. The "Effective date" at the top of this page indicates the most recent update.',
						},
					],
				},
			],
		},
		{
			heading: "3. Contact Us",
			blocks: [
				{
					type: "p",
					text: "If you have any question, concern or request regarding your personal data or our Privacy and Cookies Policy, please use the contact means made available on the website.",
				},
				{
					type: "p",
					text: "We will respond to your request as quickly as possible and in accordance with applicable data-protection laws.",
				},
			],
		},
	],
	closing:
		"This Privacy and Cookies Policy has been prepared to keep you informed about how we protect your data and respect your privacy when you use our website. By continuing to use our website, you consent to the terms described above.",
};

export const legalDocuments: Record<Locale, { terms: LegalDocument; privacy: LegalDocument }> = {
	pt: { terms: termsPt, privacy: privacyPt },
	en: { terms: termsEn, privacy: privacyEn },
};
