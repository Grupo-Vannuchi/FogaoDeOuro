import "server-only";
import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";

/**
 * Feed do Instagram — **Instagram API with Instagram Login**.
 *
 * ── Por que esta API, e não outra ──────────────────────────────────────────
 *
 * A Basic Display API, que quase todo tutorial ainda ensina, foi descontinuada
 * pela Meta em dezembro de 2024. Restam duas modalidades, e a diferença entre
 * elas é o que o restaurante precisa ter:
 *
 *  - **com Instagram Login** (esta): fala com `graph.instagram.com`, exige
 *    apenas uma conta profissional do Instagram e **não** exige Página do
 *    Facebook vinculada;
 *  - **com Facebook Login**: fala com `graph.facebook.com` e exige Página do
 *    Facebook, com o Instagram conectado a ela.
 *
 * O Fogão de Ouro quer mostrar os próprios posts. Amarrar isso a uma Página do
 * Facebook seria criar uma dependência que o negócio não tem — e mais uma
 * coisa para quebrar quando alguém desvincular a página.
 *
 * ── Estado sem credenciais ────────────────────────────────────────────────
 *
 * Sem `INSTAGRAM_ACCESS_TOKEN` a integração fica desligada e `getInstagramPosts`
 * devolve `null`. Nulo e lista vazia significam coisas diferentes de propósito:
 * nulo é "não configurado" e some da página; lista vazia é "configurado, mas a
 * conta não tem posts" — e um erro momentâneo da Meta também devolve lista
 * vazia, para o feed sumir em vez de derrubar a home.
 */

/** O que a interface consome. Cru da Graph API não passa daqui. */
export type InstagramPost = {
  id: string;
  /** Legenda; string vazia quando o post não tem. */
  caption: string;
  type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  /** Imagem a exibir: a própria, a capa do vídeo ou a primeira do álbum. */
  image: string;
  permalink: string;
  /** ISO — `unstable_cache` serializa o payload, e um Date volta string. */
  timestamp: string;
};

/** Formato bruto da Graph API, só com o que pedimos. */
type RawMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  children?: { data?: { media_url?: string; thumbnail_url?: string }[] };
};

/** Está configurado? Usado pela seção para nem renderizar quando não está. */
export function isInstagramConfigured(): boolean {
  return Boolean(env.INSTAGRAM_ACCESS_TOKEN && env.INSTAGRAM_USER_ID);
}

/**
 * Escolhe a imagem do card.
 *
 * `media_url` não vem sempre: em VIDEO ele é o arquivo do vídeo (pesado, e não
 * serve de capa) e em CAROUSEL_ALBUM costuma vir ausente — o álbum não tem
 * mídia própria, tem filhos. Daí a ordem: capa do vídeo, primeiro filho do
 * álbum, e só então a mídia direta.
 */
function coverOf(media: RawMedia): string | null {
  if (media.media_type === "VIDEO") {
    return media.thumbnail_url ?? null;
  }
  if (media.media_type === "CAROUSEL_ALBUM") {
    const first = media.children?.data?.[0];
    return first?.media_url ?? first?.thumbnail_url ?? media.media_url ?? null;
  }
  return media.media_url ?? media.thumbnail_url ?? null;
}

function normalize(media: RawMedia): InstagramPost | null {
  const image = coverOf(media);
  // Sem imagem ou sem link não há card possível: o post é descartado em vez de
  // virar um quadrado quebrado na grade.
  if (!image || !media.permalink || !media.timestamp) return null;

  const type =
    media.media_type === "VIDEO" || media.media_type === "CAROUSEL_ALBUM"
      ? media.media_type
      : "IMAGE";

  return {
    id: media.id,
    caption: media.caption ?? "",
    type,
    image,
    permalink: media.permalink,
    timestamp: media.timestamp,
  };
}

/**
 * Registra a falha sem vazar credencial.
 *
 * A Meta devolve a mensagem de erro com o token na query da URL em alguns
 * casos, e logs de build ficam guardados. Só o essencial sai daqui.
 */
function logFailure(context: string, detail: string) {
  console.error(`[instagram] ${context}: ${detail.slice(0, 200)}`);
}

async function fetchPosts(): Promise<InstagramPost[]> {
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  const userId = env.INSTAGRAM_USER_ID;
  if (!token || !userId) return [];

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
    // Capa do carrossel: o álbum não tem mídia própria.
    "children{media_url,thumbnail_url}",
  ].join(",");

  const url = new URL(
    `https://graph.instagram.com/${env.INSTAGRAM_API_VERSION}/${userId}/media`,
  );
  url.searchParams.set("fields", fields);
  // Pede a mais que o necessário: posts sem imagem utilizável são descartados
  // na normalização, e sem folga a grade viria incompleta.
  url.searchParams.set("limit", String(env.INSTAGRAM_POST_LIMIT * 3));

  try {
    const res = await fetch(url, {
      // O token vai no cabeçalho, não na query: assim ele não aparece em log
      // de proxy nem em mensagem de erro que ecoe a URL.
      headers: { Authorization: `Bearer ${token}` },
      // A Meta às vezes demora; melhor desistir e manter a home rápida.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      // 190 = token inválido/expirado; 4 e 17 = limite de requisições.
      const body = (await res.text().catch(() => "")) as string;
      const code = /"code"\s*:\s*(\d+)/.exec(body)?.[1] ?? "?";
      logFailure(
        "a Meta recusou a requisição",
        `HTTP ${res.status}, código ${code}` +
          (code === "190"
            ? " — token inválido ou expirado, gere um novo (docs/RUNBOOK.md)"
            : ""),
      );
      return [];
    }

    const json = (await res.json()) as { data?: RawMedia[] };
    if (!Array.isArray(json.data)) {
      logFailure("resposta inesperada", "campo `data` ausente ou não é lista");
      return [];
    }

    return json.data
      .map(normalize)
      .filter((post): post is InstagramPost => post !== null)
      // A Meta já devolve do mais novo para o mais antigo, mas ordenar aqui
      // torna a garantia nossa em vez de suposição sobre o comportamento dela.
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, env.INSTAGRAM_POST_LIMIT);
  } catch (error) {
    const motivo =
      error instanceof Error && error.name === "TimeoutError"
        ? "tempo esgotado"
        : "falha de rede";
    logFailure("não foi possível falar com a Meta", motivo);
    return [];
  }
}

/**
 * Os posts, em cache de dez minutos.
 *
 * O feed não é tempo real e a Meta limita requisições por hora: sem cache,
 * cada visitante geraria uma chamada e o limite chegaria num almoço movimentado.
 * Dez minutos mantém o conteúdo fresco o suficiente para um restaurante.
 *
 * Devolve `null` quando a integração não está configurada — a seção usa isso
 * para não renderizar nada.
 */
export const getInstagramPosts = unstable_cache(
  async (): Promise<InstagramPost[] | null> => {
    if (!isInstagramConfigured()) return null;
    return fetchPosts();
  },
  ["instagram", "posts"],
  { tags: ["instagram"], revalidate: 600 },
);
