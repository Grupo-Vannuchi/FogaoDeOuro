import { test, expect } from "@playwright/test";

/**
 * Regressão: o proxy de locale engolia as rotas de metadata sem extensão.
 *
 * O matcher de `src/proxy.ts` isenta `api`, `_next`, `_vercel` e qualquer path
 * com ponto (`.*\..*`). `/icon` e `/apple-icon` não têm ponto — então o
 * next-intl processava as duas e reescrevia para `/pt/icon`, que não existe:
 * os arquivos de ícone vivem na raiz de `src/app/`, fora de `[locale]/`. O
 * `<link rel="icon">` saía no HTML apontando para uma URL que devolvia 404, e
 * a aba do navegador ficava sem a logo.
 *
 * O que tornava o bug invisível é justamente o contraste testado aqui: as
 * rotas COM extensão (`robots.txt`, `sitemap.xml`, `manifest.webmanifest`)
 * sempre funcionaram, porque o ponto no path já as tirava do matcher.
 */
const metadataRoutes = [
  "/icon",
  "/apple-icon",
  // Esta nunca quebrou, e o motivo é a lição: `opengraph-image.tsx` fica DENTRO
  // de `[locale]/`, então a reescrita do next-intl (`/opengraph-image` →
  // `/pt/opengraph-image`) cai numa rota que existe. Fica no teste para que
  // mover o arquivo para a raiz — ou tirar a rota do `[locale]` — apareça aqui
  // e não numa prévia de WhatsApp sem imagem.
  "/opengraph-image",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
];

for (const path of metadataRoutes) {
  test(`serve ${path} sem passar pelo proxy de locale`, async ({ request }) => {
    const response = await request.get(path);

    expect(response.status()).toBe(200);
  });
}

// Os dois ícones são gerados por `ImageResponse`; um 200 devolvendo HTML seria
// a página 404 renderizada com status errado, então o tipo importa.
for (const path of ["/icon", "/apple-icon"]) {
  test(`${path} devolve PNG, não HTML`, async ({ request }) => {
    const response = await request.get(path);

    expect(response.headers()["content-type"]).toContain("image/png");
  });
}
