import { test, expect } from "@playwright/test";

/**
 * Cardápio digital — a página do QR Code das mesas.
 *
 * Cobre o que quebraria em silêncio: o preço aparecendo no lugar errado, um
 * prato de vários dias saindo em um só, e a troca de dia deixando duas grades
 * visíveis ao mesmo tempo. Todos passam por render e não por chamada de API,
 * então só um teste de navegador os pega.
 *
 * Os testes leem o cardápio que estiver cadastrado em vez de fixar pratos: o
 * restaurante edita o cardápio pelo admin, e um teste preso a "salmão assado"
 * quebraria na primeira troca de fornecedor de peixe.
 */

const painelAtivo = '[role="tabpanel"]:not([hidden])';

/**
 * Aquece as rotas antes dos testes paralelos.
 *
 * Localmente a suíte roda contra `next dev`, que compila cada rota no primeiro
 * acesso. Cinco testes disputando essa compilação faziam um deles estourar o
 * tempo — e nunca o mesmo, o que denunciava concorrência e não defeito. Uma
 * requisição a cada rota antes de começar resolve. Em CI, que roda contra o
 * build de produção, isto é inofensivo.
 */
test.beforeAll(async ({ request }) => {
  await Promise.all([request.get("/cardapio"), request.get("/gastronomia")]);
});

test("mostra os dois preços e nenhum valor dentro de um card de prato", async ({
  page,
}) => {
  await page.goto("/cardapio");

  // O buffet é por peso e a massa tem valor fechado: são duas contas, e é por
  // isso que aparecem separados.
  await expect(page.getByText("R$ 105,90/kg")).toBeVisible();
  await expect(page.getByText("R$ 41,90").first()).toBeVisible();

  // Preço em card faria o cliente somar pratos — o valor é sempre da seção.
  const cardsComPreco = await page
    .locator(`${painelAtivo} li`)
    .filter({ hasText: /R\$/ })
    .count();
  expect(cardsComPreco).toBe(0);
});

test("troca de dia sem recarregar, com uma grade visível por vez", async ({
  page,
}) => {
  await page.goto("/cardapio");

  const abas = page.getByRole("tab");
  await expect(abas).toHaveCount(5);

  // A semana inteira já vem no HTML; a aba só alterna qual grade aparece.
  await expect(page.locator(painelAtivo)).toHaveCount(1);

  await page.getByRole("tab", { name: /^Terça/ }).click();
  await expect(page.getByRole("tab", { name: /^Terça/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(painelAtivo)).toHaveCount(1);

  await page.getByRole("tab", { name: /^Sexta/ }).click();
  await expect(page.locator(painelAtivo)).toHaveCount(1);
  await expect(page.locator(`${painelAtivo} li`).first()).toBeVisible();
});

test("há prato saindo em mais de um dia, com um cadastro só", async ({ page }) => {
  await page.goto("/cardapio");

  const nomes: string[] = [];
  for (const dia of ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]) {
    await page.getByRole("tab", { name: new RegExp(`^${dia}`) }).click();
    nomes.push(
      ...(await page.locator(`${painelAtivo} li h3`).allInnerTexts()).map((n) =>
        n.trim(),
      ),
    );
  }

  // Mais aparições do que nomes distintos significa prato repetido entre dias.
  // É o que um cadastro com `weekdays: [1,3,4]` produz — e o que três cadastros
  // duplicados também produziriam, mas esses o admin não permite criar com o
  // mesmo slug.
  const distintos = new Set(nomes);
  expect(nomes.length).toBeGreaterThan(distintos.size);
});

test("nenhum item do cardápio é clicável", async ({ page }) => {
  await page.goto("/cardapio");

  // Os pratos são informativos: a página individual foi removida, e um link
  // por item seria promessa de destino que não existe.
  await expect(page.locator(`${painelAtivo} li a`)).toHaveCount(0);
  await expect(page.getByText("Ver o prato")).toHaveCount(0);

  // E a rota individual não responde mais.
  const r = await page.request.get("/cardapio/arroz-branco");
  expect(r.status()).toBe(404);
});

test("a seção de massas mostra o passo a passo da ilha, sem listar ingredientes", async ({
  page,
}) => {
  await page.goto("/cardapio");

  await expect(page.getByText("190 gramas")).toBeVisible();
  await expect(page.getByText("Nhoque de mandioquinha")).toBeVisible();
  await expect(page.getByText("Bolonhesa")).toBeVisible();
  await expect(page.getByText("R$ 7,50")).toBeVisible();
  await expect(page.getByText("R$ 9,50")).toBeVisible();

  // Os ingredientes mudam toda semana: o cardápio informa quantos, nunca quais.
  for (const ingrediente of ["Milho verde", "Ervilha", "Alcaparra", "Berinjela"]) {
    await expect(page.getByText(ingrediente)).toHaveCount(0);
  }
});

test("Nossa Gastronomia leva ao cardápio e continua sendo a vitrine", async ({
  page,
}) => {
  await page.goto("/gastronomia");

  // A vitrine não repete o cardápio da semana: se repetisse, as duas páginas
  // diriam a mesma coisa e a separação de conteúdo teria se perdido.
  await expect(page.getByText("R$ 105,90/kg")).toHaveCount(0);

  await page.getByRole("link", { name: "Ver o cardápio" }).click();
  await expect(page).toHaveURL(/\/cardapio$/);
  await expect(page.getByRole("tab")).toHaveCount(5);
});
