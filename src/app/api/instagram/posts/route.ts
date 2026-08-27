import { NextResponse } from "next/server";
import {
  getInstagramPosts,
  isInstagramConfigured,
} from "@/lib/instagram";

/**
 * `GET /api/instagram/posts` — os posts já normalizados.
 *
 * A seção da home **não** passa por aqui: ela é um Server Component e chama
 * `getInstagramPosts()` direto, sem dar a volta por uma requisição HTTP à
 * própria aplicação. O token fica no servidor nos dois caminhos; a diferença é
 * uma ida e volta de rede a menos em cada visita.
 *
 * Esta rota existe para o que o componente não resolve: **conferir a
 * integração**. Depois de preencher as variáveis na Vercel, abrir esta URL diz
 * em uma linha se a Meta respondeu, quantos posts vieram e de que tipo — sem
 * precisar ler log de build. É a ferramenta de diagnóstico citada no RUNBOOK.
 *
 * Nunca devolve token, App Secret nem mensagem crua da Meta.
 */
export async function GET() {
  if (!isInstagramConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        posts: [],
        message:
          "Integração desligada: INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID não estão definidos.",
      },
      // 200, não erro: "não configurado" é um estado válido do projeto, e um
      // 500 aqui poluiria o monitoramento com um alarme que não é problema.
      { status: 200 },
    );
  }

  const posts = await getInstagramPosts();

  return NextResponse.json(
    {
      configured: true,
      count: posts?.length ?? 0,
      posts: posts ?? [],
    },
    {
      status: 200,
      // Mesma janela do cache do servidor, para um proxy à frente não servir
      // algo mais velho do que a própria aplicação serviria.
      headers: { "cache-control": "public, max-age=0, s-maxage=600" },
    },
  );
}
