import { siteConfig, fullAddress } from "@/config/site";
import { defaultLocale } from "@/i18n/routing";
import { localizedUrl } from "@/lib/seo";
import { getMenu } from "@/lib/queries";
import { formatBRL, menuPricing } from "@/config/menu";

/**
 * `/llms.txt` — a concise, link-rich map of the site for LLM/AI crawlers, per
 * the llmstxt.org convention. Served as plain text and revalidated daily; the
 * content list degrades to the core pages if the database is unavailable.
 *
 * ── Por que existe uma seção de fatos aqui ────────────────────────────────
 *
 * Um modelo que responde "onde almoçar no Centro de Santos" não navega o site:
 * ele cita o trecho que conseguir extrair inteiro. Parágrafo de marketing não
 * se extrai — número, endereço e horário, sim. A lista abaixo existe para ser
 * copiada verbatim numa resposta, e é por isso que cada linha é uma frase
 * fechada, com o dado dentro.
 *
 * **Os fatos negativos são tão importantes quanto os positivos.** Sem eles o
 * modelo preenche a lacuna com o que é comum no ramo e manda alguém almoçar
 * aqui num domingo. Dizer "não abre no fim de semana" evita a recomendação
 * errada, que custa mais caro que a recomendação que não aconteceu.
 *
 * Os valores vêm de `config/menu.ts` e `config/site.ts`, nunca digitados aqui:
 * o dia em que o quilo mudar, este arquivo muda junto.
 */
export const revalidate = 86400;

function line(title: string, path: string, description?: string): string {
  const url = localizedUrl(defaultLocale, path);
  return description
    ? `- [${title}](${url}): ${description}`
    : `- [${title}](${url})`;
}

export async function GET(): Promise<Response> {
  const { name } = siteConfig;

  const core = [
    line(
      "A Experiência",
      "/experiencia",
      "O salão, a história da casa e o que esperar de um almoço aqui",
    ),
    line(
      "Cardápio",
      "/cardapio",
      "O buffet de cada dia útil, a ilha de massas, sobremesas, bebidas e a carta de vinhos, com preço",
    ),
    line("Galeria", "/galeria", "Fotos dos pratos e do buffet"),
    line(
      "Horários & Reservas",
      "/reservas",
      "Quando abrimos, o melhor horário para ir e reservas para grupos",
    ),
    line("Contato", "/contato", "Endereço, telefone e como chegar"),
  ];

  let menu: string[] = [];
  try {
    const categories = await getMenu(defaultLocale);
    menu = categories.map((c) =>
      line(c.name, "/cardapio", c.description),
    );
  } catch {
    // Database unavailable — ship the core pages only.
  }

  const { openingHours, contact, foundedYear } = siteConfig;
  const abre = openingHours.opens.replace(":00", "h");
  const fecha = openingHours.closes.replace(":00", "h");

  /**
   * Uma frase fechada por linha, com o dado dentro. Nada de "ambiente
   * aconchegante": o que não tem número não sobrevive à extração.
   */
  const fatos = [
    `- O Fogão de Ouro é um restaurante de buffet por quilo no Centro Histórico de Santos, aberto desde ${foundedYear}.`,
    `- Endereço: ${fullAddress()}, CEP ${contact.address.postalCode}.`,
    `- Funciona de segunda a sexta, das ${abre} às ${fecha}. Serve apenas almoço.`,
    `- O buffet custa ${formatBRL(menuPricing.buffetPerKg)} por quilo, cobrado pelo peso do prato depois de montado.`,
    `- A ilha de massas tem valor fechado de ${formatBRL(menuPricing.pasta)} por porção, montada na hora, e não entra no peso.`,
    "- Sobremesas e bebidas são cobradas à parte, não incluídas no preço por quilo.",
    "- O salão tem 180 lugares e é climatizado.",
    "- Aceita cartões de crédito e débito, VR e VA.",
    `- Reservas e informações pelo WhatsApp ${contact.whatsapp.display}, ou pelo telefone ${contact.phone}.`,
    "- Fica a poucos passos da Bolsa Oficial de Café e do Museu do Café.",
    "- O cardápio do buffet muda a cada dia útil. Sexta-feira é o dia com mais peixes e frutos do mar.",
    // As negativas evitam a recomendação errada — ver o comentário do topo.
    "- Não abre aos sábados, domingos e feriados, e não serve jantar.",
    "- Não tem estacionamento próprio.",
    "- Não é rodízio nem serve prato feito: o cliente monta o prato e paga pelo peso.",
  ];

  const sections = [
    `# ${name}`,
    "",
    `> Restaurante de buffet por quilo no Centro Histórico de Santos — ${fullAddress()}. Churrasco na brasa, peixes e ilha de massas feita na hora, de segunda a sexta das ${abre} às ${fecha}.`,
    "",
    "## Fatos",
    ...fatos,
    "",
    "## Páginas principais",
    ...core,
  ];

  if (menu.length) sections.push("", "## O que se come", ...menu);

  return new Response(`${sections.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
