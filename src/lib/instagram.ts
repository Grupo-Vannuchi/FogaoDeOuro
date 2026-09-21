import "server-only";
import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import { toPosts, type RawMedia } from "@/lib/instagram-media";

export type { InstagramPost } from "@/lib/instagram-media";

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

/** Está configurado? Usado pela seção para nem renderizar quando não está. */
export function isInstagramConfigured(): boolean {
  return Boolean(env.INSTAGRAM_ACCESS_TOKEN);
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

async function fetchPosts(): Promise<import("@/lib/instagram-media").InstagramPost[]> {
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  /**
   * `me` — o próprio token já diz de quem é a conta.
   *
   * A Meta documenta `/me` como endpoint especial que "traduz para o ID do
   * objeto da conta cujo token de acesso está sendo usado na chamada", e isso
   * vale para `media`. Como este projeto serve UMA conta, pedir o ID à parte
   * só criava uma segunda chance de errar: o `GET /me` devolve `id` E
   * `user_id`, com nomes parecidos e valores diferentes, e escolher o errado
   * produz a pior falha possível — a integração se declara configurada e
   * devolve zero post, o que parece defeito do site.
   *
   * `INSTAGRAM_USER_ID` continua sendo respeitado quando existe: quem já o
   * tem preenchido não precisa mexer em nada.
   */
  const userId = env.INSTAGRAM_USER_ID ?? "me";

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
    // Capa do carrossel: o álbum não tem mídia própria. `media_type` da
    // criança não é enfeite — sem ele, um carrossel que começa por vídeo
    // entrega o .mp4 como capa (ver `coverOf`).
    "children{media_type,media_url,thumbnail_url}",
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

    return toPosts(json.data, env.INSTAGRAM_POST_LIMIT);
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
  async (): Promise<
    import("@/lib/instagram-media").InstagramPost[] | null
  > => {
    if (!isInstagramConfigured()) return null;
    return fetchPosts();
  },
  ["instagram", "posts"],
  { tags: ["instagram"], revalidate: 600 },
);
