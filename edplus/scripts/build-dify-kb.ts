import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { catalogCategories, catalogCourses, type CatalogCourseSeed } from "../db/catalog-2026";

const levelPt: Record<CatalogCourseSeed["level"], string> = {
	beginner: "Iniciante",
	intermediate: "Intermédio",
	advanced: "Avançado",
};

const categoryName = Object.fromEntries(catalogCategories.map((category) => [category.slug, category.name.pt]));

function section(title: string, body: string) {
	const compact = body
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.join("\n");
	return `## ${title}\n\n${compact}`;
}

function courseSection(course: CatalogCourseSeed) {
	const area = categoryName[course.category];
	const contents = course.contents
		? `Conteúdos: ${course.contents.pt}`
		: "Conteúdos: o catálogo publica o objectivo e não detalha um programa módulo a módulo. A Academia confirma o programa no pedido de informação.";
	const audience = course.audience
		? `Público-alvo: ${course.audience.pt}`
		: "Público-alvo: profissionais e equipas que precisam desta competência. A Academia confirma o enquadramento no pedido de informação.";
	const featured = course.featured
		? "Este curso está em destaque na página inicial da Academia."
		: "Este curso faz parte da oferta completa do catálogo e não é um dos três cartões em destaque da página inicial.";

	return section(`${course.title.pt} (${course.title.en})`, `
Perguntas a que esta secção responde: o que é o curso ${course.title.pt}? Quanto tempo dura ${course.title.pt}? Qual o preço de ${course.title.pt}? Para quem é ${course.title.pt}? O que se aprende em ${course.title.pt}? Onde me inscrevo em ${course.title.pt}?
A Academia Pumangol inclui no Catálogo de Formação 2026 o curso «${course.title.pt}». O nome em inglês é «${course.title.en}».
Área: ${area}.
Nível: ${levelPt[course.level]}.
Carga horária: ${course.hours} horas.
Objectivo: ${course.objective.pt}
${contents}
${audience}
${featured}
Preço: sob consulta. O site não publica o valor em kwanzas. No catálogo, o botão deste curso é «Pedir informação» e abre a página de contacto.
Datas da turma: sob consulta. O catálogo não fixa o dia de início.
Modalidade indicada para as formações sob consulta: presencial, online ou híbrido.
Local possível: instalações da Academia em Talatona, Luanda; nas instalações da empresa do cliente; ou online.
Turma: até 30 formandos por sessão.
Idioma habitual da formação: português.
Página do curso no site: /courses/${course.slug}
Como avançar: pedir informação em /contact ou pedir uma proposta para a empresa na página inicial. A equipa responde ao pedido de proposta em até 48 horas úteis.
Certificado: a página de perguntas frequentes diz que, depois de concluir o programa e as avaliações, o formando recebe um certificado da Academia Pumangol.
`);
}

function areaIndex(slug: CatalogCourseSeed["category"]) {
	const area = categoryName[slug];
	const lines = catalogCourses
		.filter((course) => course.category === slug)
		.map((course) => `- ${course.title.pt} (${course.title.en}): ${course.hours} horas, nível ${levelPt[course.level].toLowerCase()}. Objectivo: ${course.objective.pt}`);
	return section(`Lista do catálogo 2026 — ${area}`, `
Perguntas a que esta secção responde: que cursos de ${area} existem? Quais são as formações de ${area} no catálogo 2026?
A área «${area}» do Catálogo de Formação 2026 da Academia Pumangol tem ${lines.length} formações. Preços e datas de todas elas estão sob consulta. Modalidade: presencial, online ou híbrido. Até 30 formandos por sessão.
${lines.join("\n")}
Para o detalhe de uma formação, peça o nome do curso. Para receber o PDF do catálogo, indique o email profissional no bloco final da página inicial.
`);
}

const featured = catalogCourses.filter((course) => course.featured);
const totalHours = catalogCourses.reduce((sum, course) => sum + course.hours, 0);

const sections = [
	section("Academia Pumangol — quem somos", `
Perguntas a que esta secção responde: o que é a Academia Pumangol? Qual é o slogan? A quem se destina a formação?
A Academia Pumangol é a unidade de formação do Grupo Pumangol. O slogan é «Cria futuro.» A frase da página inicial é «O futuro não se espera. Cria-se.»
A Academia faz formação executiva e técnica para quem lidera, gere e opera em Angola. Os programas são para os colaboradores do Grupo Pumangol, para os profissionais do setor e, no arco seguinte, para todos os que querem crescer.
A página «A Academia» está em /about. A página inicial está em /.
O site está em português e em inglês. O português é o idioma predefinido.
O texto institucional do rodapé diz: «Formação de excelência para o desenvolvimento de pessoas e o fortalecimento das organizações em Angola.»
`),
	section("História da Academia Pumangol", `
Perguntas a que esta secção responde: quando nasceu a Academia Pumangol? Qual é a história? Desde quando existe?
A página «A Academia» resume a história assim:
2012 — Nasce a Academia Pumangol, criada pelo Grupo Pumangol para a formação contínua dos seus colaboradores.
2016 — Abertura aos profissionais do setor. Os primeiros programas executivos abrem-se a empresas e técnicos de todo o país.
2021 — Parceria com a NOVA SBE Executive Education. Programas e conferências com uma das escolas de negócios mais reconhecidas da Europa.
2026 — Conhecimento aberto a toda a comunidade. O site descreve este passo como o próximo arco: programas acessíveis a todos os que procuram crescer. A página inicial diz que os programas abertos a toda a comunidade chegam em breve.
O texto da história diz que a Academia nasceu para formar os colaboradores do Grupo com a qualidade e a exigência das melhores escolas internacionais e que, ao longo de mais de uma década, a missão se abriu aos profissionais e às empresas de Angola.
`),
	section("Missão, visão e valores", `
Perguntas a que esta secção responde: qual é a missão da Academia Pumangol? Qual é a visão? Quais são os valores?
Missão: desenvolver pessoas e equipas competentes, seguras e produtivas, para organizações mais eficientes e sustentáveis.
Visão: ser referência em formação executiva e técnica em Angola, reconhecida pela qualidade, inovação e impacto social.
Valores: excelência, integridade, segurança, inovação, impacto social e pessoas primeiro.
O manifesto do site diz: «Acreditamos que o conhecimento é um caminho que não termina. Que cada competência abre uma porta, e cada porta revela um novo arco a subir. Por isso formamos pessoas: para que as empresas cresçam, o país avance e cada carreira encontre o seu próximo desafio.»
`),
	section("Símbolo, logótipo e os três públicos", `
Perguntas a que esta secção responde: o que significam as curvas do logótipo? Quem são os públicos da Academia?
As curvas ascendentes do logótipo representam o caminho infinito e a procura incessante pelo conhecimento. Cada arco nasce do anterior e chega mais alto, como cada formação prepara a seguinte.
Três arcos, três públicos: 01 colaboradores do Grupo Pumangol; 02 profissionais do setor; 03 todos os que procuram conhecimento com impacto positivo na sua vida.
`),
	section("Números apresentados no site", `
Perguntas a que esta secção responde: quantos anos tem a Academia? Quantas pessoas já formou? Quantas horas de formação?
A página inicial apresenta estes números: 14+ anos de experiência, 2500+ profissionais formados e 45000+ horas de formação.
Outro dado repetido no site: até 30 formandos por sessão.
A página inicial também anuncia «7 programas abertos», com a indicação «Set — Dez 2026 · Luanda». O catálogo completo tem ${catalogCourses.length} formações e não identifica quais são esses sete programas nem fixa a data de cada turma. Quando alguém perguntar quais são os sete, diga o que o site anuncia e convide a pedir o PDF do catálogo ou a confirmar com a equipa. Não invente a lista dos sete.
`),
	section("Instalações em Talatona", `
Perguntas a que esta secção responde: onde fica a Academia Pumangol? Como são as instalações? Quantas pessoas cabem numa sala?
A Academia fica em Talatona, Luanda, Angola. A morada publicada é «Academia Pumangol, Talatona, Luanda». Não há rua nem número de porta publicados no site.
O mapa da página de contacto pesquisa «Academia Pumangol, Talatona, Luanda, Angola». A página de contacto está em /contact e tem o link «Obter direcções».
As instalações são descritas como infra-estruturas modernas para formações presenciais, híbridas e online, com capacidade para acolher até 30 formandos por sessão.
Os espaços de eventos mostrados no site incluem auditório, participantes, sessões e conferências, e networking. O site não publica a lotação exacta do auditório.
`),
	section("Contactos, horário e WhatsApp", `
Perguntas a que esta secção responde: qual é o email da Academia? Qual é o telefone? Há WhatsApp? Qual é o horário?
Email da página de contacto e do rodapé: academia@pumangol.co.ao
Email mostrado no bloco «Fale connosco» da página inicial: info@academiapumangol.ao
Telefone mostrado no bloco «Fale connosco» da página inicial: +244 923 000 000
WhatsApp mostrado no mesmo bloco: +244 923 000 000, link wa.me/244923000000
Morada: Academia Pumangol, Talatona, Luanda, Angola.
Horário de atendimento publicado na página de contacto: segunda a sexta, 08:00–17:00. O fuso usado nos documentos da Academia é Africa/Luanda.
A página de contacto está em /contact. O bloco de pedido de proposta da página inicial está em /#contacto.
A equipa de apoio, segundo a página de perguntas frequentes, está disponível por email e telefone para dúvidas sobre inscrições, conteúdos e certificados.
Não invente outro telefone, outro email, uma rua ou um horário de fim-de-semana. Estes são os únicos contactos publicados.
`),
	section("Modalidades, turmas e idioma", `
Perguntas a que esta secção responde: a formação é presencial ou online? Onde pode ser dada? Em que língua?
As formações do catálogo 2026 cujo preço está sob consulta são apresentadas no site como «Presencial, online ou híbrido».
A formação para empresas pode ser nas instalações da Academia em Talatona, na empresa do cliente, ou online.
Cada sessão acolhe até 30 formandos.
O idioma associado às formações do catálogo é o português. O site também pode ser lido em inglês.
`),
	section("Preços, datas e o que o site não publica", `
Perguntas a que esta secção responde: quanto custa um curso? Há descontos? Quando começa a próxima turma? Há vagas?
Nenhuma formação do Catálogo 2026 tem preço publicado. O site mostra «Sob consulta». A moeda usada quando um preço é cobrado no site é o kwanza (Kz, AOA). Não invente valores, descontos, promoções nem tabelas de preço.
As datas das turmas do catálogo também estão sob consulta. A página de calendário (/calendario) fala em próximas sessões e diz que as datas são indicativas. Não invente um dia, um mês ou um número de vagas.
O catálogo em PDF pode ser pedido na página inicial: a pessoa indica o email profissional e o site envia o PDF «Catálogo de Formação 2026». O próprio catálogo também não fixa preços nem datas.
Para saber preço ou data, o caminho é pedir informação em /contact ou pedir uma proposta. A resposta ao pedido de proposta da página inicial está indicada como «até 48 horas úteis».
`),
	section("Catálogo de Formação 2026 — visão geral", `
Perguntas a que esta secção responde: que formações existem? Quantos cursos tem o catálogo? Quais são as áreas?
O Catálogo de Formação 2026 da Academia Pumangol tem ${catalogCourses.length} formações, em cinco áreas, com ${totalHours} horas no total se se somarem as cargas horárias.
As cinco áreas são:
- Formações técnicas / HSSE. No site também aparece como segurança, HSE e operações. Inclui condução, empilhadores, HSST, primeiros socorros, incêndios e matérias perigosas.
- Liderança e desenvolvimento humano. Inclui liderança de equipas, comunicação, conflitos, ética e pensamento crítico.
- Customer experience e atendimento. Inclui atendimento, excelência, reclamações e a jornada do cliente.
- Gestão e negócios. Inclui finanças, projectos, planeamento estratégico e gestão de risco.
- Tecnologia e literacia digital. Inclui literacia digital, inteligência artificial, cibersegurança, Excel e Power BI.
A página do catálogo é /catalogo. A pesquisa do site encontra cursos por tema, formador ou palavra-chave.
Três formações estão em destaque na página inicial: ${featured.map((course) => course.title.pt).join("; ")}. A nota junto desses cartões diz «Catálogo 2026 · valores e datas sob consulta».
Há ainda um chip na página inicial com «7 programas abertos» entre setembro e dezembro de 2026, em Luanda. Essa lista de sete não está discriminada no catálogo publicado no site.
`),
	...catalogCategories.map((category) => areaIndex(category.slug)),
	...catalogCourses.map(courseSection),
	section("Formação à medida para empresas", `
Perguntas a que esta secção responde: fazem formação para empresas? O diagnóstico é gratuito? Como peço uma proposta? O que preciso de indicar?
Sim. A Academia desenha formação à medida para empresas, parceiros e prestadores. O texto do site diz: diagnosticamos as lacunas de competências da equipa e desenhamos um plano com objectivos e indicadores claros. Nas instalações da Academia, na empresa ou online.
O diagnóstico de competências é gratuito e sem compromisso. O site descreve o plano como 100% desenhado para a operação do cliente.
Os quatro passos publicados são:
1. Diagnóstico — funções, desafios e lacunas.
2. Proposta — conteúdos, calendário e orçamento.
3. Execução — onde a equipa estiver.
4. Impacto medido — resultados e o próximo arco.
A página para empresas e parceiros é /parceiros. O pedido também pode ser feito no bloco «Fale connosco» da página inicial (/#contacto) e em /contact.
No formulário da página inicial a pessoa indica: perfil (empresa, profissional ou particular), nome, empresa, email profissional, telefone, área de interesse, número de formandos e uma mensagem opcional. Tem de aceitar a política de privacidade. As áreas de interesse do formulário são: Formações técnicas / HSSE; Liderança e Gestão de Pessoas; Atendimento; Gestão e negócios; Tecnologia e literacia digital. Os intervalos de formandos são 1–10, 11–50, 51–200 e 200+.
No formulário de /parceiros pede-se ainda cargo, sector de actividade, número de participantes, modalidade pretendida (a definir, presencial em Talatona, online ou híbrido) e as áreas de formação. A mensagem dessa página diz que a resposta chega em poucos dias úteis. O bloco da página inicial indica resposta em até 48 horas úteis.
Depois do envio, o site confirma que o pedido foi recebido e que foi enviada uma confirmação para o email indicado.
`),
	section("Como pedir informação, inscrever-se e pagar", `
Perguntas a que esta secção responde: como me inscrevo? Como peço informação? Como se paga? O que é a referência Multicaixa?
Para as formações do catálogo 2026, que estão sob consulta, o botão no catálogo é «Pedir informação» e leva a /contact. Não há preço para adicionar ao carrinho enquanto o valor não estiver publicado.
Quando um curso está marcado como gratuito, a inscrição é confirmada no site e o formando recebe por email a confirmação e o comprovativo em PDF.
Quando um curso tem preço publicado, a pessoa adiciona-o ao carrinho (/cart) e segue para o checkout (/checkout). O pagamento publicado no checkout é por transferência ou Multicaixa, com entidade, referência e valor gerados nesse momento. Depois de pagar, a pessoa confirma com «Já efectuei o pagamento». Os cursos pagos ficam então disponíveis na Área do aluno.
A página de perguntas frequentes descreve a inscrição assim: escolher o curso, clicar em Inscrever-se e completar o registo. As instruções de acesso chegam por email. Se a formação estiver sob consulta, o caminho correcto publicado no catálogo é pedir informação, não finalizar uma compra.
Não invente uma entidade, uma referência Multicaixa ou um IBAN. Esses dados só aparecem no checkout de uma compra concreta.
`),
	section("Certificado, acesso aos conteúdos e apoio", `
Perguntas a que esta secção responde: os cursos têm certificado? Durante quanto tempo tenho acesso? Posso aprender ao meu ritmo? Como peço apoio?
A página de perguntas frequentes (/faq) responde assim:
Os cursos incluem certificado. Depois de concluir o programa e as avaliações, o formando recebe um certificado da Academia Pumangol. O site não descreve um certificado de outra entidade.
O formando mantém acesso aos conteúdos durante 12 meses após a inscrição, para rever as aulas ao seu ritmo.
A mesma página diz que a maioria dos cursos é gravada e pode ser seguida quando a pessoa quiser, com sessões ao vivo pontuais.
O apoio é por email e por telefone, para dúvidas sobre inscrições, conteúdos e certificados.
Estas respostas da FAQ coexistem com o catálogo, em que a modalidade indicada é presencial, online ou híbrido e as datas estão sob consulta. Se a pessoa perguntar se um curso concreto é só gravado, diga o que a FAQ afirma em geral e convide a confirmar a modalidade dessa turma com a equipa, porque o catálogo prevê presencial, online ou híbrido.
`),
	section("Conta, palavra-passe e área do aluno", `
Perguntas a que esta secção responde: como crio conta? Como entro? Esqueci-me da palavra-passe. Onde vejo os meus cursos?
O registo está em /register e a entrada em /login. O registo pede nome de utilizador, nome completo, email e palavra-passe. A palavra-passe tem de ter pelo menos 8 caracteres. O nome de utilizador usa letras, números, pontos e underscores, entre 3 e 30 caracteres.
Quem esquece a palavra-passe usa /recuperar-password. O site envia um link para o email da conta, se a conta existir. A nova palavra-passe define-se em /redefinir-password. O link pode expirar.
A Área do aluno está em /aluno. Os cursos pagos confirmados e as inscrições ficam associados a essa área. A página /aluno/cursos mostra os cursos do formando.
O site diz que o registo público cria um perfil de aluno.
`),
	section("Formadores", `
Perguntas a que esta secção responde: quem são os formadores? Quem dá a formação de liderança?
A página de formadores é /instructors.
A página inicial destaca quatro formadores internacionais, todos ligados a liderança e desenvolvimento humano:
- Andreas Galsterer, especialista internacional em Liderança Sistémica, Desenvolvimento Organizacional e Transformação de Equipa.
- Katy Martilíano, formadora internacional.
- Fernando Fallé, formador internacional.
- Miguel Soares, formador internacional.
No catálogo, as formações aparecem associadas à equipa de formadores da Academia Pumangol: formadores especializados, com experiência prática e pedagógica, nas formações do Catálogo 2026. O site também diz que os formadores têm experiência no sector da energia, em segurança, operações e liderança.
Não atribua um curso técnico, de atendimento, de gestão ou de tecnologia a um destes quatro nomes. O site só os associa a liderança e desenvolvimento humano. Se perguntarem quem lecciona um curso concreto fora dessa área, diga que a equipa da Academia confirma o formador no pedido de informação.
`),
	section("Parceria com a NOVA SBE Executive Education", `
Perguntas a que esta secção responde: a Academia tem parceria com a NOVA? O que é a NOVA SBE? Quem é Nadim Habib?
Sim. A Academia Pumangol trabalha em parceria com a NOVA SBE Executive Education, da Nova School of Business and Economics, descrita no site como uma das escolas de negócios mais reconhecidas da Europa. A parceria está datada de 2021 na história da Academia.
A página inicial mostra o logótipo e a frase «Em parceria com NOVA SBE Executive Education». Há um destaque de liderança: «Líderes não nascem. Formam-se.»
Um exemplo publicado desta colaboração é a palestra «Liderar em tempos de mudança permanente», com o Professor Nadim Habib.
O site reserva ainda um lugar para outros parceiros institucionais e para uma universidade parceira, sem os nomear.
`),
	section("Notícias publicadas", `
Perguntas a que esta secção responde: que notícias há? O que foi a palestra do Nadim Habib? O que diz o site sobre competências?
A secção de notícias está em /noticias. As notícias publicadas no site, da mais recente para a mais antiga, são estas. Não invente outras.
- 18 de setembro de 2026, categoria Eventos, em destaque: «Liderar em tempos de mudança permanente». Texto: os melhores momentos da palestra do Professor Nadim Habib, em parceria com a NOVA SBE Executive Education. Página: /noticias/liderar-em-tempos-de-mudanca-permanente
- 12 de setembro de 2026, categoria Carreira: «3 sinais de que o mercado mudou — e as principais competências também». Texto: o novo normal, a experiência já não é suficiente e as competências que estão a ganhar espaço. Página: /noticias/3-sinais-de-que-o-mercado-mudou
- 5 de setembro de 2026, categoria Academia: «Pronto para o próximo desafio? Descubra os novos cursos». Texto: HSSE, liderança, atendimento, gestão e tecnologia. O catálogo 2026 está disponível, com valores e datas sob consulta. Página: /noticias/pronto-para-o-proximo-desafio
- 28 de agosto de 2026, categoria Carreira: «Aprender tornou-se um processo contínuo». Texto: o próximo passo da carreira pode começar com uma nova competência. Página: /noticias/aprender-tornou-se-um-processo-continuo
- 20 de agosto de 2026, categoria Carreira: «As competências que estão a ganhar espaço». Texto: inteligência artificial, automação, análise de dados, CRM, estratégia e liderança de equipas. Página: /noticias/as-competencias-que-estao-a-ganhar-espaco
- 14 de agosto de 2026, categoria Eventos: «Gestores e líderes reunidos para debater a mudança». Texto: a sala cheia na palestra «Liderar em tempos de mudança permanente». Página: /noticias/gestores-e-lideres-reunidos-para-debater-a-mudanca
`),
	section("Páginas úteis do site", `
Perguntas a que esta secção responde: onde vejo os cursos? Onde estão as notícias? Onde está a política de privacidade?
- Página inicial: /
- A Academia: /about
- Catálogo: /catalogo
- Página de um curso: /courses/ seguido do identificador do curso, por exemplo /courses/hsst
- Pedir o PDF do catálogo: bloco no final da página inicial
- Pedido de proposta: /#contacto e /parceiros
- Contacto: /contact
- Formadores: /instructors
- Notícias: /noticias
- Calendário: /calendario
- Perguntas frequentes: /faq
- Privacidade: /privacidade
- Termos: /termos
- Entrar: /login
- Criar conta: /register
- Recuperar palavra-passe: /recuperar-password
- Área do aluno: /aluno
- Carrinho: /cart
- Pagamento: /checkout
As notícias actualmente publicadas estão na secção «Notícias publicadas». Não invente um título, uma data ou um evento que não esteja nessa lista.
`),
	section("Perguntas frequentes publicadas no site", `
Perguntas a que esta secção responde: como me inscrevo num curso? Os cursos incluem certificado? Quanto tempo tenho acesso? Posso aprender ao meu ritmo? Como obtenho apoio?
Como me inscrevo num curso? Escolha o curso, clique em Inscrever-se e complete o registo. Receberá as instruções de acesso por email. Se o curso estiver «sob consulta», use «Pedir informação» em /contact.
Os cursos incluem certificado? Sim. Após concluir o programa e as avaliações, recebe um certificado da Academia Pumangol.
Quanto tempo tenho acesso ao curso? Mantém acesso aos conteúdos durante 12 meses após a inscrição, para rever as aulas ao seu ritmo.
Posso aprender ao meu ritmo? Sim. A maioria dos cursos é gravada e pode ser seguida quando quiser, com sessões ao vivo pontuais. Para uma turma do catálogo, confirme a modalidade, porque o site também indica presencial, online ou híbrido.
Como posso obter apoio? A equipa de apoio está disponível por email e telefone para dúvidas sobre inscrições, conteúdos e certificados. Email da página de contacto: academia@pumangol.co.ao. Telefone publicado no bloco da página inicial: +244 923 000 000.
`),
	section("Privacidade, cookies e termos", `
Perguntas a que esta secção responde: como tratam os meus dados? Usam cookies? Posso apagar os meus dados? Que lei se aplica?
A Política de Privacidade e Cookies está em /privacidade. A data de entrada em vigor publicada é 21 de Janeiro de 2025. O texto refere o site pumangol.co.ao e aplica-se também à informação institucional usada pela Academia.
Dados que podem ser recolhidos: nome, email, telefone e outros dados que a pessoa entrega em formulários, contactos ou newsletters; dados técnicos como dispositivo, endereço IP, navegador e sistema operativo; dados de utilização como páginas visitadas e tempo de visita.
Os dados servem para responder a pedidos, prestar o serviço pedido, melhorar a experiência, enviar comunicações se a pessoa tiver aceite, analisar o uso do site e cumprir a lei.
O site diz que não vende, não aluga e não partilha dados pessoais, excepto com prestadores que operam o site ou o atendimento (por exemplo email e alojamento) e quando a lei o exige.
Direitos indicados: aceder, corrigir, pedir a eliminação, restringir ou opor-se ao tratamento, e retirar o consentimento. O exercício destes direitos faz-se pelos contactos do site.
Cookies: necessários, de desempenho, funcionais, de publicidade e marketing, e de terceiros. A pessoa pode gerir cookies no navegador. Bloquear alguns cookies pode afectar o site.
Os formulários de proposta exigem aceitar a política de privacidade antes do envio.
Os Termos e condições estão em /termos. O acesso ao site é gratuito. O conteúdo (textos, imagens, logótipos, vídeos) é da Pumangol ou usado com autorização, e não pode ser copiado sem autorização escrita. A lei aplicável é a da República de Angola e os litígios vão aos tribunais competentes de Luanda.
O site pode ter ligações para páginas de terceiros. A Pumangol não se responsabiliza por esses sites.
`),
	section("O que o assistente não deve inventar", `
Perguntas a que esta secção responde: podes confirmar o preço? Qual é a data exacta? Há vaga? Qual é a morada completa?
Não publique um preço, um desconto, uma data de turma, um número de vagas, um nome de formador para um curso que esta base não atribui, uma rua, um IBAN, uma entidade Multicaixa ou um certificado de outra escola.
Quando a informação não está nesta base, diga que não está publicada e indique o próximo passo: academia@pumangol.co.ao, a página /contact, ou o telefone +244 923 000 000 em dias úteis, das 08:00 às 17:00.
Não fale de cursos que não estejam na lista do Catálogo 2026. Não prometa admissão universitária, licenciatura ou pós-graduação: a oferta publicada é formação executiva e técnica, não um curso superior.
Não descreva o funcionamento interno do site, do backoffice, de pagamentos ou de sistemas.
`),
];

const document = [
	"# Academia Pumangol — base de conhecimento",
	"",
	"Documento para a base de conhecimento do assistente da Academia Pumangol. Cada secção trata de um único assunto e pode ser lida sozinha. Catálogo de Formação 2026: " +
		`${catalogCourses.length} formações, cinco áreas, preços e datas sob consulta.`,
	"",
	sections.join("\n\n"),
	"",
].join("\n");

const output = resolve(process.cwd(), "docs/dify/base-conhecimento.md");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, document, "utf8");
console.log(`${output} (${document.length} caracteres, ${sections.length} secções)`);
process.exit(0);
