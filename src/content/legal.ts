/**
 * Legal documents — Terms of Use and Privacy Policy.
 *
 * Original, LGPD-aware copy tailored to what this site actually does (a marketing
 * agency site with contact + careers lead forms persisted to PostgreSQL). The
 * controller's corporate data below comes from the company's registration record.
 *
 * Commercial/identifying data is wrapped in `**…**`, which the renderer
 * (`legal-document.tsx`) turns into bold. Keep this as the single source of truth;
 * the `/terms` and `/privacy` pages and their metadata read from here. Update
 * `updated` whenever the text changes.
 */

/** Controller (data + legal entity) — used across both documents. */
export const legalEntity = {
  legalName: "Moraes & Vannuchi LTDA",
  tradeName: "N8 Company",
  cnpj: "43.158.706/0001-99",
  address: "Rua Joaquim Távora, nº 93, sala 93 — CEP 11.075-300, Santos/SP, Brasil",
  phones: "(13) 99658-5790 / (13) 99675-3753",
  email: "comercial@grupovannuchi.com.br",
  privacyEmail: "lidia.sales@grupovannuchi.com.br",
  site: "www.n8xmarketing.com.br",
} as const;

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  title: string;
  /** Human-readable "last updated" date shown under the title. */
  updated: string;
  intro: string[];
  sections: LegalSection[];
};

const e = legalEntity;

/** Bolded forms of the commercial data, reused across the copy. */
const b = {
  legalName: `**${e.legalName}**`,
  tradeName: `**${e.tradeName}**`,
  cnpj: `**${e.cnpj}**`,
  address: `**${e.address}**`,
  phones: `**${e.phones}**`,
  email: `**${e.email}**`,
  privacyEmail: `**${e.privacyEmail}**`,
  site: `**${e.site}**`,
};

const pt: { terms: LegalDoc; privacy: LegalDoc } = {
  terms: {
    title: "Termos de Uso",
    updated: "Última atualização: 12 de junho de 2026",
    intro: [
      `Estes Termos de Uso ("Termos") regulam o acesso e a utilização do site ${b.site} ("Site"), mantido por ${b.legalName}, nome fantasia ${b.tradeName}, inscrita no CNPJ sob o nº ${b.cnpj}, com sede em ${b.address} ("nós", "nosso" ou "Empresa").`,
      "Ao acessar ou utilizar o Site, você ('Usuário') declara ter lido, compreendido e concordado integralmente com estes Termos. Caso não concorde com qualquer disposição, pedimos que não utilize o Site.",
    ],
    sections: [
      {
        heading: "1. Definições",
        body: [
          "Para os fins destes Termos, considera-se:",
          "(a) Site: o endereço eletrônico, suas páginas e funcionalidades, mantido pela Empresa;",
          "(b) Usuário: qualquer pessoa que acesse ou utilize o Site;",
          "(c) Conteúdo: todo material disponibilizado no Site, incluindo textos, imagens, logotipos, marcas, layout e código;",
          "(d) Empresa: a pessoa jurídica identificada acima, responsável pelo Site.",
        ],
      },
      {
        heading: "2. Objeto",
        body: [
          "O Site tem caráter institucional e informativo, destinando-se a apresentar a Empresa, seus serviços, portfólio e conteúdos, bem como a disponibilizar canais de contato e de candidatura a oportunidades profissionais.",
          "O Site não comercializa produtos ou serviços diretamente nem realiza transações financeiras. Eventuais contratações ocorrem por meio dos canais de atendimento e mediante instrumentos próprios.",
        ],
      },
      {
        heading: "3. Aceitação dos Termos",
        body: [
          "A utilização do Site implica a aceitação integral destes Termos e da nossa Política de Privacidade. Se você utilizar o Site em nome de uma pessoa jurídica, declara possuir poderes para vinculá-la a estes Termos.",
          "Caso não concorde com qualquer condição aqui prevista, você deverá interromper imediatamente o uso do Site.",
        ],
      },
      {
        heading: "4. Capacidade e veracidade das informações",
        body: [
          "O Usuário declara ser plenamente capaz, nos termos da legislação civil, para utilizar o Site e enviar informações por meio dele.",
          "O Usuário é o único responsável pela veracidade, exatidão e atualização das informações que fornece, respondendo por eventuais danos decorrentes de informações falsas, incorretas ou desatualizadas.",
        ],
      },
      {
        heading: "5. Condições e regras de uso",
        body: [
          "O Usuário se compromete a utilizar o Site de forma lícita, ética e de acordo com a legislação aplicável, abstendo-se de praticar atos que possam prejudicar a Empresa, outros usuários ou terceiros.",
          "É vedado, a título exemplificativo: (a) tentar obter acesso não autorizado a sistemas, contas ou áreas restritas; (b) interferir no funcionamento do Site ou introduzir códigos maliciosos; (c) utilizar mecanismos automatizados para extração massiva de dados (scraping); e (d) reproduzir, distribuir ou explorar comercialmente o Conteúdo sem autorização.",
        ],
      },
      {
        heading: "6. Envio de informações pelos formulários",
        body: [
          "O Site disponibiliza formulários de contato e de candidatura a vagas ('Trabalhe Conosco'). Ao enviá-los, o Usuário declara que as informações fornecidas são verdadeiras, completas e atualizadas, e que possui autorização para compartilhá-las.",
          "As informações enviadas são tratadas conforme a nossa Política de Privacidade. O envio de uma mensagem ou candidatura não gera, por si só, qualquer obrigação de resposta, contratação ou contato por parte da Empresa.",
        ],
      },
      {
        heading: "7. Propriedade intelectual",
        body: [
          "Todo o Conteúdo do Site é de titularidade da Empresa ou de seus licenciadores e é protegido pela legislação de propriedade intelectual, incluindo direitos autorais e de marcas.",
          "É proibida a cópia, modificação, reprodução, publicação ou qualquer outra forma de utilização do Conteúdo sem autorização prévia e por escrito da Empresa, ressalvado o uso pessoal e não comercial inerente à navegação.",
          "As marcas, logotipos e nomes empresariais exibidos no Site não podem ser utilizados sem o consentimento expresso de seus respectivos titulares.",
        ],
      },
      {
        heading: "8. Links e serviços de terceiros",
        body: [
          "O Site pode conter links para sites e serviços de terceiros (por exemplo, redes sociais e aplicativos de mensagens). Tais links são fornecidos por conveniência e não implicam endosso.",
          "A Empresa não se responsabiliza pelo conteúdo, pelas práticas de privacidade ou pelo funcionamento desses sites e serviços, cujo acesso ocorre por conta e risco do Usuário.",
        ],
      },
      {
        heading: "9. Privacidade e proteção de dados",
        body: [
          "O tratamento de dados pessoais coletados por meio do Site é regido pela nossa Política de Privacidade, parte integrante destes Termos, elaborada em conformidade com a Lei nº 13.709/2018 (LGPD).",
          "Recomendamos a leitura atenta da Política de Privacidade para compreender como os seus dados são coletados, utilizados e protegidos.",
        ],
      },
      {
        heading: "10. Cookies",
        body: [
          "O Site utiliza cookies estritamente necessários ao seu funcionamento e tecnologias de armazenamento de sessão para funcionalidades do Site, incluindo o registro temporário da origem do acesso. Ferramentas de análise de audiência são utilizadas de forma agregada e sem cookies. Mais detalhes estão descritos na Política de Privacidade. O Usuário pode gerenciar cookies nas configurações do seu navegador.",
        ],
      },
      {
        heading: "11. Disponibilidade e isenção de garantias",
        body: [
          "Empenhamo-nos para manter o Site disponível e atualizado, mas ele é fornecido 'no estado em que se encontra', sem garantias de disponibilidade ininterrupta, ausência de erros ou adequação a uma finalidade específica.",
          "Podemos, a qualquer tempo e sem aviso prévio, alterar, suspender ou descontinuar, total ou parcialmente, o Site ou quaisquer de suas funcionalidades, sem que isso gere qualquer obrigação de indenizar.",
        ],
      },
      {
        heading: "12. Limitação de responsabilidade",
        body: [
          "Na máxima extensão permitida pela legislação aplicável, a Empresa não será responsável por danos indiretos, incidentais ou lucros cessantes decorrentes do uso ou da impossibilidade de uso do Site, ou de conteúdos de terceiros acessados a partir dele.",
          "A Empresa não se responsabiliza por falhas decorrentes de caso fortuito, força maior, indisponibilidade de internet ou ações de terceiros alheias ao seu controle.",
        ],
      },
      {
        heading: "13. Comunicações",
        body: [
          `As comunicações entre o Usuário e a Empresa poderão ser realizadas pelos canais oficiais indicados no Site, especialmente o e-mail ${b.email} e os telefones ${b.phones}.`,
        ],
      },
      {
        heading: "14. Alterações destes Termos",
        body: [
          "Podemos atualizar estes Termos periodicamente para refletir mudanças legais, técnicas ou de negócio. A versão vigente será sempre a publicada no Site, com a respectiva data de atualização.",
          "O uso continuado do Site após a publicação de alterações representa concordância com a nova versão.",
        ],
      },
      {
        heading: "15. Disposições gerais",
        body: [
          "A eventual tolerância quanto ao descumprimento de qualquer disposição destes Termos não constituirá renúncia ou novação, podendo a Empresa exigir o cumprimento a qualquer tempo.",
          "Caso qualquer cláusula destes Termos seja considerada inválida ou inexequível, as demais permanecerão em pleno vigor e efeito.",
        ],
      },
      {
        heading: "16. Legislação aplicável e foro",
        body: [
          "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Santos/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.",
        ],
      },
      {
        heading: "17. Contato",
        body: [
          `Em caso de dúvidas sobre estes Termos, entre em contato com ${b.legalName} (${b.tradeName}) pelo e-mail ${b.email} ou pelos telefones ${b.phones}.`,
        ],
      },
    ],
  },
  privacy: {
    title: "Política de Privacidade",
    updated: "Última atualização: 12 de junho de 2026",
    intro: [
      `Esta Política de Privacidade descreve como ${b.legalName}, nome fantasia ${b.tradeName}, inscrita no CNPJ nº ${b.cnpj}, com sede em ${b.address} ("nós" ou "Empresa"), coleta, utiliza, armazena e protege os dados pessoais dos usuários do site ${b.site} ("Site").`,
      "O tratamento de dados pessoais é realizado em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD) e demais normas aplicáveis. Ao utilizar o Site, você declara estar ciente desta Política.",
    ],
    sections: [
      {
        heading: "1. Definições",
        body: [
          "Para os fins desta Política, conforme a LGPD, considera-se:",
          "(a) Dado pessoal: informação relacionada a pessoa natural identificada ou identificável;",
          "(b) Titular: a pessoa natural a quem se referem os dados pessoais;",
          "(c) Tratamento: toda operação realizada com dados pessoais, como coleta, uso, armazenamento e eliminação;",
          "(d) Controlador: a quem competem as decisões sobre o tratamento — no caso, a Empresa;",
          "(e) Operador: quem realiza o tratamento em nome do Controlador.",
        ],
      },
      {
        heading: "2. Controlador dos dados",
        body: [
          `O controlador responsável pelo tratamento dos seus dados pessoais é ${b.legalName}, nome fantasia ${b.tradeName}, inscrita no CNPJ nº ${b.cnpj}, com sede em ${b.address}.`,
        ],
      },
      {
        heading: "3. Encarregado e canal de atendimento",
        body: [
          `Para assuntos relativos a dados pessoais e privacidade, bem como para o exercício dos seus direitos, disponibilizamos o canal de atendimento: ${b.privacyEmail}.`,
          `Você também pode entrar em contato pelos telefones ${b.phones}.`,
        ],
      },
      {
        heading: "4. Dados fornecidos por você",
        body: [
          "Formulário de contato: ao utilizá-lo, coletamos nome, e-mail, telefone, empresa (quando informada) e o conteúdo da mensagem.",
          "Formulário 'Trabalhe Conosco': ao se candidatar a uma vaga, coletamos nome, e-mail, telefone, a vaga ou função desejada, eventual link de portfólio e o conteúdo da mensagem.",
          "Origem do acesso: ao enviar um dos formulários, registramos também informações sobre como você chegou até o Site — por exemplo, a página de entrada, o endereço de referência (site de origem) e eventuais parâmetros de campanha (UTMs) —, com a finalidade de compreender a eficácia dos nossos canais de divulgação e direcionar melhor o atendimento.",
          "Não coletamos intencionalmente dados pessoais sensíveis. Pedimos que você não inclua tais informações nas mensagens enviadas pelos formulários.",
        ],
      },
      {
        heading: "5. Dados coletados automaticamente",
        body: [
          "Durante a navegação, podem ser registrados dados técnicos como endereço IP, tipo de navegador e dispositivo, sistema operacional, páginas acessadas, data e horário de acesso e preferências (por exemplo, idioma), por meio de cookies e tecnologias semelhantes.",
          "Utilizamos serviços de análise de audiência e de desempenho (Vercel Web Analytics e Speed Insights) que coletam métricas de forma agregada e anônima, sem uso de cookies, para acompanhar acessos e a performance do Site.",
          "Para registrar a origem do seu acesso durante a visita (conforme o item 4), utilizamos o armazenamento de sessão (sessionStorage) do navegador, que é apagado ao encerrar a aba ou a sessão — não se trata de cookie de rastreamento persistente.",
          "Esses dados são utilizados de forma agregada para fins de operação, segurança e melhoria do Site.",
        ],
      },
      {
        heading: "6. Finalidades do tratamento",
        body: [
          "Tratamos os seus dados para: (a) responder a contatos e solicitações; (b) avaliar candidaturas a oportunidades profissionais; (c) operar, manter, melhorar e proteger o Site; e (d) cumprir obrigações legais ou regulatórias.",
        ],
      },
      {
        heading: "7. Bases legais",
        body: [
          "O tratamento dos seus dados fundamenta-se nas seguintes bases legais previstas na LGPD, conforme o caso: execução de procedimentos preliminares relacionados a solicitação do titular; legítimo interesse da Empresa; cumprimento de obrigação legal ou regulatória; e consentimento do titular, quando aplicável.",
          "Quando o tratamento se basear no consentimento, você poderá revogá-lo a qualquer momento pelos canais indicados nesta Política.",
        ],
      },
      {
        heading: "8. Cookies",
        body: [
          "Utilizamos cookies estritamente necessários ao funcionamento do Site (por exemplo, para lembrar o idioma escolhido e manter sessões de áreas administrativas). Esses cookies são essenciais e não dependem de consentimento.",
          "Além dos cookies necessários, empregamos o armazenamento de sessão (sessionStorage) do seu navegador para fins funcionais — em especial, registrar temporariamente a origem do seu acesso até o envio de um formulário —, o qual é apagado ao encerrar a sessão. Não utilizamos cookies de rastreamento publicitário, e nossas ferramentas de análise de audiência funcionam sem cookies.",
          "Você pode configurar o seu navegador para bloquear ou alertar sobre cookies; contudo, algumas funcionalidades do Site podem deixar de operar corretamente.",
        ],
      },
      {
        heading: "9. Compartilhamento de dados",
        body: [
          "Não vendemos os seus dados pessoais. Podemos compartilhá-los com prestadores de serviço (operadores) que atuam em nosso nome — por exemplo, provedores de hospedagem e de infraestrutura de banco de dados — estritamente para viabilizar o funcionamento do Site, sob obrigações de confidencialidade e segurança.",
          "Também poderemos compartilhar dados quando necessário para cumprir obrigação legal, ordem de autoridade competente ou para o exercício regular de direitos.",
        ],
      },
      {
        heading: "10. Provedores e operadores",
        body: [
          "Para a operação do Site, utilizamos serviços de terceiros, como provedores de hospedagem de aplicação e de banco de dados em nuvem. Esses provedores tratam dados exclusivamente conforme nossas instruções e adotam medidas de segurança próprias.",
        ],
      },
      {
        heading: "11. Armazenamento e transferência internacional",
        body: [
          "Os dados são armazenados em ambiente de banco de dados e em provedores de nuvem contratados pela Empresa. Conforme a infraestrutura utilizada, parte do tratamento pode ocorrer em servidores localizados fora do Brasil.",
          "Nesses casos, adotamos salvaguardas adequadas para assegurar que a transferência internacional observe os requisitos da LGPD e mantenha um nível de proteção compatível.",
        ],
      },
      {
        heading: "12. Segurança da informação",
        body: [
          "Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda, alteração ou divulgação. Senhas de acesso administrativo, por exemplo, são armazenadas de forma cifrada.",
          "Nenhum sistema é completamente imune a riscos; por isso, trabalhamos continuamente para aprimorar nossas práticas de segurança.",
        ],
      },
      {
        heading: "13. Retenção e eliminação",
        body: [
          "Mantemos os dados pessoais pelo tempo necessário ao cumprimento das finalidades para as quais foram coletados, ou pelo prazo exigido por obrigações legais.",
          "Encerradas as finalidades, os dados são eliminados ou anonimizados, ressalvadas as hipóteses de guarda permitidas pela legislação.",
        ],
      },
      {
        heading: "14. Direitos do titular",
        body: [
          "Nos termos da LGPD, você pode, a qualquer momento, solicitar: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade; portabilidade; informação sobre compartilhamentos; e revogação do consentimento, quando esta for a base legal aplicável.",
        ],
      },
      {
        heading: "15. Como exercer seus direitos",
        body: [
          `Para exercer qualquer um dos seus direitos ou esclarecer dúvidas sobre o tratamento dos seus dados, entre em contato pelo e-mail ${b.privacyEmail}. Poderemos solicitar informações adicionais para confirmar a sua identidade antes de atender ao pedido.`,
        ],
      },
      {
        heading: "16. Reclamação à autoridade",
        body: [
          "Sem prejuízo do contato direto conosco, o titular tem o direito de peticionar à Autoridade Nacional de Proteção de Dados (ANPD) a respeito do tratamento dos seus dados pessoais.",
        ],
      },
      {
        heading: "17. Privacidade de menores",
        body: [
          "O Site não se destina a menores de 18 anos e não coletamos intencionalmente dados de crianças e adolescentes. Caso identifiquemos tal coleta sem a devida autorização, os dados serão eliminados.",
        ],
      },
      {
        heading: "18. Alterações desta Política",
        body: [
          "Esta Política pode ser atualizada periodicamente. A versão vigente será sempre a publicada no Site, com a respectiva data de atualização. Recomendamos a revisão periódica deste documento.",
        ],
      },
      {
        heading: "19. Contato",
        body: [
          `Dúvidas, solicitações ou reclamações relativas a esta Política e ao tratamento de dados pessoais podem ser encaminhadas a ${b.legalName} (${b.tradeName}) pelo e-mail ${b.privacyEmail} ou pelos telefones ${b.phones}.`,
        ],
      },
    ],
  },
};

const en: { terms: LegalDoc; privacy: LegalDoc } = {
  terms: {
    title: "Terms of Use",
    updated: "Last updated: June 12, 2026",
    intro: [
      `These Terms of Use ("Terms") govern access to and use of the website ${b.site} (the "Site"), operated by ${b.legalName}, trade name ${b.tradeName}, enrolled with the Brazilian taxpayer registry (CNPJ) under No. ${b.cnpj}, headquartered at ${b.address} ("we", "our" or the "Company").`,
      "By accessing or using the Site, you (the 'User') confirm that you have read, understood and fully agree to these Terms. If you do not agree with any provision, please do not use the Site.",
    ],
    sections: [
      {
        heading: "1. Definitions",
        body: [
          "For the purposes of these Terms:",
          "(a) Site: the web address, its pages and features, maintained by the Company;",
          "(b) User: any person who accesses or uses the Site;",
          "(c) Content: all material made available on the Site, including texts, images, logos, trademarks, layout and code;",
          "(d) Company: the legal entity identified above, responsible for the Site.",
        ],
      },
      {
        heading: "2. Purpose",
        body: [
          "The Site is institutional and informational in nature. It presents the Company, its services, portfolio and content, and provides contact and job-application channels.",
          "The Site does not sell products or services directly and does not process financial transactions. Any engagement takes place through our service channels and under separate agreements.",
        ],
      },
      {
        heading: "3. Acceptance of the Terms",
        body: [
          "Using the Site implies full acceptance of these Terms and of our Privacy Policy. If you use the Site on behalf of a legal entity, you represent that you are authorized to bind it to these Terms.",
          "If you do not agree with any condition set out herein, you must immediately stop using the Site.",
        ],
      },
      {
        heading: "4. Capacity and accuracy of information",
        body: [
          "The User declares that they are fully capable, under civil law, to use the Site and to submit information through it.",
          "The User is solely responsible for the truthfulness, accuracy and timeliness of the information they provide, and is liable for any damages arising from false, incorrect or outdated information.",
        ],
      },
      {
        heading: "5. Conditions and rules of use",
        body: [
          "The User agrees to use the Site lawfully, ethically and in accordance with applicable law, refraining from any act that may harm the Company, other users or third parties.",
          "The following are prohibited, by way of example: (a) attempting unauthorized access to systems, accounts or restricted areas; (b) interfering with the Site's operation or introducing malicious code; (c) using automated means to mass-extract data (scraping); and (d) reproducing, distributing or commercially exploiting the Content without authorization.",
        ],
      },
      {
        heading: "6. Information submitted through forms",
        body: [
          "The Site provides contact and job-application ('Careers') forms. By submitting them, the User represents that the information provided is true, complete and up to date, and that they are authorized to share it.",
          "Submitted information is handled in accordance with our Privacy Policy. Sending a message or application does not, in itself, create any obligation on the Company to respond, hire or make contact.",
        ],
      },
      {
        heading: "7. Intellectual property",
        body: [
          "All Site Content belongs to the Company or its licensors and is protected by intellectual property law, including copyright and trademark rights.",
          "Copying, modifying, reproducing, publishing or otherwise using the Content without the Company's prior written authorization is prohibited, except for the personal, non-commercial use inherent to browsing.",
          "The trademarks, logos and trade names displayed on the Site may not be used without the express consent of their respective owners.",
        ],
      },
      {
        heading: "8. Third-party links and services",
        body: [
          "The Site may contain links to third-party sites and services (for example, social networks and messaging apps). Such links are provided for convenience and do not imply endorsement.",
          "The Company is not responsible for the content, privacy practices or operation of those sites and services, which are accessed at the User's own risk.",
        ],
      },
      {
        heading: "9. Privacy and data protection",
        body: [
          "The processing of personal data collected through the Site is governed by our Privacy Policy, an integral part of these Terms, prepared in accordance with Brazilian Law No. 13,709/2018 (LGPD).",
          "We recommend reading the Privacy Policy carefully to understand how your data is collected, used and protected.",
        ],
      },
      {
        heading: "10. Cookies",
        body: [
          "The Site uses cookies strictly necessary for its operation and session-storage technologies for Site features, including temporarily recording the traffic source. Audience analytics tools are used in aggregate form and without cookies. Further details are described in the Privacy Policy. The User may manage cookies in their browser settings.",
        ],
      },
      {
        heading: "11. Availability and disclaimer of warranties",
        body: [
          "We strive to keep the Site available and up to date, but it is provided 'as is', without warranties of uninterrupted availability, error-free operation or fitness for a particular purpose.",
          "We may, at any time and without prior notice, change, suspend or discontinue all or part of the Site or any of its features, without any obligation to indemnify.",
        ],
      },
      {
        heading: "12. Limitation of liability",
        body: [
          "To the maximum extent permitted by applicable law, the Company shall not be liable for indirect or incidental damages or lost profits arising from the use of, or inability to use, the Site, or from third-party content accessed through it.",
          "The Company is not liable for failures resulting from acts of God, force majeure, internet unavailability or actions of third parties beyond its control.",
        ],
      },
      {
        heading: "13. Communications",
        body: [
          `Communications between the User and the Company may be carried out through the official channels indicated on the Site, in particular the email ${b.email} and the phone numbers ${b.phones}.`,
        ],
      },
      {
        heading: "14. Changes to these Terms",
        body: [
          "We may update these Terms from time to time to reflect legal, technical or business changes. The version in force will always be the one published on the Site, with its update date.",
          "Continued use of the Site after changes are published constitutes acceptance of the new version.",
        ],
      },
      {
        heading: "15. General provisions",
        body: [
          "Any tolerance regarding the breach of any provision of these Terms shall not constitute waiver or novation, and the Company may require compliance at any time.",
          "If any clause of these Terms is held invalid or unenforceable, the remaining clauses shall remain in full force and effect.",
        ],
      },
      {
        heading: "16. Governing law and venue",
        body: [
          "These Terms are governed by the laws of the Federative Republic of Brazil. The courts of the District of Santos/SP are elected to settle any disputes, waiving any other, however privileged.",
        ],
      },
      {
        heading: "17. Contact",
        body: [
          `If you have questions about these Terms, contact ${b.legalName} (${b.tradeName}) at ${b.email} or by phone at ${b.phones}.`,
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: June 12, 2026",
    intro: [
      `This Privacy Policy describes how ${b.legalName}, trade name ${b.tradeName}, enrolled with CNPJ No. ${b.cnpj}, headquartered at ${b.address} ("we" or the "Company"), collects, uses, stores and protects the personal data of users of the website ${b.site} (the "Site").`,
      "Personal data is processed in accordance with Brazilian Law No. 13,709/2018 (General Data Protection Law — LGPD) and other applicable rules. By using the Site, you acknowledge this Policy.",
    ],
    sections: [
      {
        heading: "1. Definitions",
        body: [
          "For the purposes of this Policy, under the LGPD:",
          "(a) Personal data: information relating to an identified or identifiable natural person;",
          "(b) Data subject: the natural person to whom the personal data relates;",
          "(c) Processing: any operation carried out with personal data, such as collection, use, storage and deletion;",
          "(d) Controller: the party responsible for decisions regarding the processing — here, the Company;",
          "(e) Processor: the party that carries out the processing on behalf of the Controller.",
        ],
      },
      {
        heading: "2. Data controller",
        body: [
          `The controller responsible for processing your personal data is ${b.legalName}, trade name ${b.tradeName}, enrolled with CNPJ No. ${b.cnpj}, headquartered at ${b.address}.`,
        ],
      },
      {
        heading: "3. Data protection contact",
        body: [
          `For matters regarding personal data and privacy, as well as to exercise your rights, we provide the following channel: ${b.privacyEmail}.`,
          `You may also contact us by phone at ${b.phones}.`,
        ],
      },
      {
        heading: "4. Data you provide",
        body: [
          "Contact form: when you use it, we collect your name, email, phone, company (when provided) and the message content.",
          "'Careers' form: when you apply for a position, we collect your name, email, phone, the desired role, an optional portfolio link and the message content.",
          "Traffic source: when you submit a form, we also record how you reached the Site — for example, the landing page, the referring address (source site) and any campaign parameters (UTMs) — in order to understand the effectiveness of our channels and better direct our follow-up.",
          "We do not intentionally collect sensitive personal data. Please do not include such information in messages sent through the forms.",
        ],
      },
      {
        heading: "5. Automatically collected data",
        body: [
          "During browsing, technical data such as IP address, browser and device type, operating system, pages visited, date and time of access and preferences (for example, language) may be recorded through cookies and similar technologies.",
          "We use audience and performance analytics services (Vercel Web Analytics and Speed Insights) that collect metrics in aggregate, anonymous form, without cookies, to monitor traffic and Site performance.",
          "To record your traffic source during a visit (as described in item 4), we use your browser's session storage (sessionStorage), which is cleared when the tab or session ends — it is not a persistent tracking cookie.",
          "This data is used in aggregate form for operation, security and Site improvement purposes.",
        ],
      },
      {
        heading: "6. Purposes of processing",
        body: [
          "We process your data to: (a) respond to contacts and requests; (b) assess job applications; (c) operate, maintain, improve and protect the Site; and (d) comply with legal or regulatory obligations.",
        ],
      },
      {
        heading: "7. Legal bases",
        body: [
          "The processing of your data is based on the following legal bases set out in the LGPD, as applicable: the carrying out of preliminary procedures related to a request by the data subject; the Company's legitimate interest; compliance with a legal or regulatory obligation; and the data subject's consent, where applicable.",
          "Where processing is based on consent, you may withdraw it at any time through the channels indicated in this Policy.",
        ],
      },
      {
        heading: "8. Cookies",
        body: [
          "We use cookies strictly necessary for the Site to function (for example, to remember the chosen language and maintain administrative sessions). These cookies are essential and do not depend on consent.",
          "In addition to necessary cookies, we use your browser's session storage (sessionStorage) for functional purposes — in particular, to temporarily record your traffic source until a form is submitted — which is cleared when the session ends. We do not use advertising tracking cookies, and our audience analytics tools work without cookies.",
          "You can configure your browser to block or alert you about cookies; however, some Site features may stop working properly.",
        ],
      },
      {
        heading: "9. Data sharing",
        body: [
          "We do not sell your personal data. We may share it with service providers (processors) acting on our behalf — for example, hosting and database infrastructure providers — strictly to enable the Site's operation, under confidentiality and security obligations.",
          "We may also share data when necessary to comply with a legal obligation, an order from a competent authority, or for the regular exercise of rights.",
        ],
      },
      {
        heading: "10. Providers and processors",
        body: [
          "To operate the Site, we use third-party services such as application hosting and cloud database providers. These providers process data solely according to our instructions and adopt their own security measures.",
        ],
      },
      {
        heading: "11. Storage and international transfer",
        body: [
          "Data is stored in a database environment and with cloud providers contracted by the Company. Depending on the infrastructure used, part of the processing may occur on servers located outside Brazil.",
          "In such cases, we adopt appropriate safeguards to ensure that any international transfer meets LGPD requirements and maintains a comparable level of protection.",
        ],
      },
      {
        heading: "12. Information security",
        body: [
          "We adopt reasonable technical and organizational measures to protect personal data against unauthorized access and accidental or unlawful destruction, loss, alteration or disclosure. Administrative access passwords, for instance, are stored in encrypted form.",
          "No system is completely immune to risk; we therefore work continuously to improve our security practices.",
        ],
      },
      {
        heading: "13. Retention and deletion",
        body: [
          "We retain personal data for as long as necessary to fulfill the purposes for which it was collected, or for the period required by legal obligations.",
          "Once the purposes are exhausted, data is deleted or anonymized, except where retention is permitted by law.",
        ],
      },
      {
        heading: "14. Data subject rights",
        body: [
          "Under the LGPD, you may at any time request: confirmation that processing exists; access to the data; correction of incomplete, inaccurate or outdated data; anonymization, blocking or deletion of unnecessary data or data processed in non-compliance; portability; information about sharing; and withdrawal of consent, where consent is the applicable legal basis.",
        ],
      },
      {
        heading: "15. How to exercise your rights",
        body: [
          `To exercise any of your rights or to clarify questions about the processing of your data, contact us at ${b.privacyEmail}. We may request additional information to confirm your identity before fulfilling the request.`,
        ],
      },
      {
        heading: "16. Complaint to the authority",
        body: [
          "Without prejudice to contacting us directly, the data subject has the right to petition the Brazilian National Data Protection Authority (ANPD) regarding the processing of their personal data.",
        ],
      },
      {
        heading: "17. Children's privacy",
        body: [
          "The Site is not intended for individuals under 18, and we do not intentionally collect data from children or adolescents. If we identify such collection without proper authorization, the data will be deleted.",
        ],
      },
      {
        heading: "18. Changes to this Policy",
        body: [
          "This Policy may be updated from time to time. The version in force will always be the one published on the Site, with its update date. We recommend reviewing this document periodically.",
        ],
      },
      {
        heading: "19. Contact",
        body: [
          `Questions, requests or complaints regarding this Policy and the processing of personal data may be sent to ${b.legalName} (${b.tradeName}) at ${b.privacyEmail} or by phone at ${b.phones}.`,
        ],
      },
    ],
  },
};

export const legalContent: Record<string, { terms: LegalDoc; privacy: LegalDoc }> = {
  pt,
  en,
};

/** Resolve the legal documents for a locale, falling back to Portuguese. */
export function getLegal(locale: string) {
  return legalContent[locale] ?? legalContent.pt;
}
