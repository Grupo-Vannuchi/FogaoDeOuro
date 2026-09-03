import { Fragment } from "react";
import { Link } from "@/i18n/navigation";
import { siteConfig, whatsappLink, fullAddress } from "@/config/site";

/**
 * Lightweight, dependency-free renderer for the lightly-marked-up text stored in
 * `LocalizedRichText` content fields (one block per array element / per line in
 * the admin editor). It renders semantic HTML — `<h2>`/`<h3>`, `<ul>`, `<strong>`,
 * `<em>`, `<a>` — which is what search engines read, so emphasis written by
 * editors becomes real SEO signal rather than decorative styling.
 *
 * Supported per-block syntax:
 *   `## Heading`         → <h2>
 *   `### Heading`        → <h3>
 *   `- item` / `* item`  → grouped into a single <ul>
 *   anything else        → <p>
 *
 * Supported inline syntax (inside any block):
 *   `**bold**`                  → <strong>
 *   `*italic*` / `_italic_`     → <em>
 *   `[label](/path)`            → localized <Link> (internal) or <a> (external)
 *
 * Além disso, o número de WhatsApp e o endereço da casa viram link sozinhos
 * onde quer que apareçam escritos — ver `AUTO_LINKS`.
 */

const INLINE =
  /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Trechos que viram link automaticamente, sem markdown no texto.
 *
 * **Por que automático e não `[texto](url)` gravado no banco.** Este conteúdo é
 * editado pelo restaurante, e o próprio texto de hoje avisa que vai ser
 * reescrito. Markdown colado na linha some na primeira reescrita, e a URL
 * gravada junto envelhece calada quando o endereço ou a mensagem padrão mudam
 * em `config/site.ts`. Aqui o dono do dado continua sendo o `siteConfig`: quem
 * escrever "Rua Frei Gaspar, 46" numa novidade nova ganha o mapa de graça.
 *
 * Ordem importa — o endereço longo vem antes do curto, senão o curto casa
 * primeiro e o resto do endereço fica de fora do link.
 */
const { address, whatsapp } = siteConfig.contact;
const zap = whatsappLink();

const AUTO_LINKS: { pattern: string; href: string }[] = [
  {
    pattern: `${address.street}, ${address.city}, ${address.region}`,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`,
  },
  {
    pattern: address.street,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`,
  },
  ...(zap
    ? [
        { pattern: whatsapp.display, href: zap },
        // Sem o DDI: é como o número costuma aparecer escrito no meio de uma
        // frase, e cai no mesmo link com a mesma mensagem já preenchida.
        { pattern: whatsapp.display.replace(/^\+55\s*/, ""), href: zap },
      ]
    : []),
];

const AUTO = new RegExp(
  AUTO_LINKS.map(({ pattern }) => `(${escapeRe(pattern)})`).join("|"),
  "g",
);

const linkClass = "font-medium text-brand underline-offset-4 hover:underline";

/**
 * Transforma endereço e WhatsApp em link dentro de um trecho de texto puro.
 * Roda só sobre o que sobrou fora do markdown, para não quebrar um
 * `[label](url)` que já cite o endereço no rótulo.
 */
function autoLink(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(AUTO)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      nodes.push(
        <Fragment key={`${keyBase}-t${key++}`}>
          {text.slice(lastIndex, start)}
        </Fragment>,
      );
    }
    // O índice do grupo que casou diz qual link usar.
    const hit = match.slice(1).findIndex((g) => g !== undefined);
    nodes.push(
      <a
        key={`${keyBase}-a${key++}`}
        href={AUTO_LINKS[hit].href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {match[0]}
      </a>,
    );
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <Fragment key={`${keyBase}-t${key++}`}>{text.slice(lastIndex)}</Fragment>,
    );
  }

  return nodes;
}

/** Parse inline emphasis/links within a single block of text. */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      nodes.push(
        <Fragment key={key++}>
          {autoLink(text.slice(lastIndex, start), `i${key}`)}
        </Fragment>,
      );
    }

    const [, linkLabel, linkHref, bold, italicStar, italicUnderscore] = match;
    if (linkLabel && linkHref) {
      nodes.push(
        linkHref.startsWith("/") ? (
          <Link
            key={key++}
            href={linkHref}
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            {linkLabel}
          </Link>
        ) : (
          <a
            key={key++}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-4 hover:underline"
          >
            {linkLabel}
          </a>
        ),
      );
    } else if (bold) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {bold}
        </strong>,
      );
    } else if (italicStar || italicUnderscore) {
      nodes.push(
        <em key={key++} className="italic">
          {italicStar || italicUnderscore}
        </em>,
      );
    }

    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <Fragment key={key++}>
        {autoLink(text.slice(lastIndex), `i${key}`)}
      </Fragment>,
    );
  }

  return nodes;
}

/** Render an ordered list of marked-up blocks into semantic HTML. */
export function RichText({
  blocks,
  className,
}: {
  blocks: string[];
  className?: string;
}) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length === 0) return;
    const items = list;
    list = [];
    out.push(
      <ul
        key={`ul-${out.length}`}
        className="flex list-disc flex-col gap-2 pl-6 text-base text-muted-foreground sm:text-lg"
      >
        {items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
  };

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    if (/^[-*]\s+/.test(block)) {
      list.push(block.replace(/^[-*]\s+/, ""));
      continue;
    }
    flushList();

    if (block.startsWith("### ")) {
      out.push(
        <h3 key={`h3-${out.length}`} className="text-xl font-semibold tracking-tight">
          {renderInline(block.slice(4))}
        </h3>,
      );
    } else if (block.startsWith("## ")) {
      out.push(
        <h2 key={`h2-${out.length}`} className="text-2xl font-bold tracking-tight sm:text-3xl">
          {renderInline(block.slice(3))}
        </h2>,
      );
    } else {
      out.push(
        <p key={`p-${out.length}`} className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {renderInline(block)}
        </p>,
      );
    }
  }
  flushList();

  return <div className={className}>{out}</div>;
}
