import { test, expect } from "@playwright/test";

test("submits the contact form and shows the success state", async ({ page }) => {
  await page.goto("/contato");

  await page.getByLabel("Nome").fill("Ana E2E");
  await page.getByLabel("E-mail").fill("ana.e2e@example.com");
  await page
    .getByLabel("Mensagem")
    .fill("Mensagem de teste E2E com mais de dez caracteres.");

  await page.getByRole("button", { name: "Enviar mensagem" }).click();

  await expect(
    page.getByText("Mensagem enviada! Em breve entramos em contato."),
  ).toBeVisible();
});
