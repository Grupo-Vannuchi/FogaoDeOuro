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

test("um prato servido em vários dias aparece em todos eles, com um cadastro só", async ({
  page,
}) => {
  await page.goto("/cardapio");

  // Abre um prato qualquer da segunda e lê os dias que ele declara.
  await page.getByRole("tab", { name: /^Segunda/ }).click();
  const primeiro = page.locator(`${painelAtivo} li a`).first();
  const nome = (await primeiro.locator("h3").innerText()).trim();
  await primeiro.click();

  await expect(page.getByRole("heading", { level: 1, name: nome })).toBeVisible();

  const corpo = await page.locator("body").innerText();
  const linhaDias = /Servido às\s*\n?\s*(.+)/.exec(corpo);
  const dias = linhaDias
    ? linhaDias[1].split(",").map((d) => d.trim()).filter(Boolean)
    : [];

  await page.goBack();

  // Cada dia declarado precisa mesmo listar o prato — é isso que distingue um
  // cadastro com vários dias de três cadastros duplicados.
  for (const dia of dias) {
    await page.getByRole("tab", { name: new RegExp(`^${dia}`) }).click();
    await expect(page.locator(painelAtivo).getByText(nome, { exact: true })).toBeVisible();
  }
});

test("a página do prato mostra o preço da seção e volta para o cardápio", async ({
  page,
}) => {
  await page.goto("/cardapio");
  // Fixar o dia antes de clicar: ao abrir, o servidor entrega segunda e o
  // navegador troca para hoje ao hidratar. Clicar durante essa troca pega um
  // card que o React acabou de esconder.
  await page.getByRole("tab", { name: /^Segunda/ }).click();
  await page.locator(`${painelAtivo} li a`).first().click();
  // Sem esperar a rota trocar, o innerText abaixo ainda é o do cardápio — que
  // tem três "R$" por natureza (buffet, massas no topo, massas no título).
  await page.waitForURL(/\/cardapio\/.+/);
  await expect(page.getByRole("link", { name: "Voltar ao cardápio" })).toBeVisible();

  // Um "R$" só na página: o da seção. Dois significaria preço por prato.
  const ocorrencias = (await page.locator("body").innerText()).match(/R\$/g) ?? [];
  expect(ocorrencias).toHaveLength(1);

  await page.getByRole("link", { name: "Voltar ao cardápio" }).click();
  await expect(page).toHaveURL(/\/cardapio$/);
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
