import { describe, it, expect } from "vitest";
import {
  emptyMenuCategoryForm,
  categoryFormToInput,
  emptyMenuItemForm,
  itemFormToInput,
  itemToForm,
} from "@/lib/menu-form";
import { menuCategorySchema, menuItemSchema } from "@/lib/validations/menu";

describe("categoria do cardápio", () => {
  it("o formulário vazio não passa na validação (nome é obrigatório)", () => {
    const input = categoryFormToInput(emptyMenuCategoryForm());
    expect(menuCategorySchema.safeParse(input).success).toBe(false);
  });

  it("preenchido, passa e converte a ordem para número", () => {
    const values = emptyMenuCategoryForm();
    values.slug = "entradas";
    values.name.pt = "Entradas";
    values.order = "3";
    const input = categoryFormToInput(values);
    expect(input.order).toBe(3);
    expect(menuCategorySchema.safeParse(input).success).toBe(true);
  });

  it("apara espaços do nome e do slug", () => {
    const values = emptyMenuCategoryForm();
    values.slug = "  sobremesas  ";
    values.name.pt = "  Sobremesas  ";
    const input = categoryFormToInput(values);
    expect(input.slug).toBe("sobremesas");
    expect(input.name.pt).toBe("Sobremesas");
  });
});

describe("item do cardápio", () => {
  it("o formulário vazio não passa (nome e categoria obrigatórios)", () => {
    const input = itemFormToInput(emptyMenuItemForm(""));
    expect(menuItemSchema.safeParse(input).success).toBe(false);
  });

  it("preenchido, passa na validação", () => {
    const values = emptyMenuItemForm("cat_1");
    values.slug = "picanha";
    values.name.pt = "Picanha na brasa";
    const input = itemFormToInput(values);
    expect(input.categoryId).toBe("cat_1");
    expect(menuItemSchema.safeParse(input).success).toBe(true);
  });

  it("sem dia marcado o prato é permanente; marcados viram lista", () => {
    const values = emptyMenuItemForm("cat_1");
    values.slug = "feijoada";
    values.name.pt = "Feijoada";

    expect(itemFormToInput(values).weekdays).toEqual([]);

    values.weekdays = ["3"];
    expect(itemFormToInput(values).weekdays).toEqual([3]);
  });

  it("guarda vários dias no mesmo prato, ordenados e sem repetir", () => {
    const values = emptyMenuItemForm("cat_1");
    values.slug = "frango-grelhado";
    values.name.pt = "Frango grelhado";
    // A ordem é a dos checkboxes clicados, e o mesmo dia pode chegar duas vezes
    // se o formulário for remontado — a página do prato precisa de "Segunda,
    // Quarta e Quinta", nunca "Quinta, Segunda e Quarta".
    values.weekdays = ["4", "1", "3", "1"];

    const parsed = menuItemSchema.safeParse(itemFormToInput(values));
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.weekdays).toEqual([1, 3, 4]);
  });

  it("recusa dia fora de 1–5 (o restaurante abre de segunda a sexta)", () => {
    const values = emptyMenuItemForm("cat_1");
    values.slug = "x";
    values.name.pt = "X";
    values.weekdays = ["6"];
    expect(menuItemSchema.safeParse(itemFormToInput(values)).success).toBe(false);
  });

  it("separa as tags por vírgula, aparando e descartando vazias", () => {
    const values = emptyMenuItemForm("cat_1");
    values.slug = "salada";
    values.name.pt = "Salada";
    values.tags = " vegetariano , , picante ";
    expect(itemFormToInput(values).tags).toEqual(["vegetariano", "picante"]);
  });

  it("itemToForm devolve as tags como texto separado por vírgula", () => {
    const form = itemToForm({
      slug: "salada",
      categoryId: "cat_1",
      name: { pt: "Salada" },
      description: { pt: "" },
      image: "",
      available: true,
      order: 0,
      tags: ["vegetariano", "leve"],
      descriptionLong: { pt: "" },
      kind: "BUFFET",
      weekdays: [],
    });
    expect(form.tags).toBe("vegetariano, leve");
    expect(form.weekdays).toEqual([]);
  });

  it("itemToForm devolve os dias como texto, para os checkboxes marcarem", () => {
    // O DOM entrega o value do checkbox como string. Com números aqui, o
    // formulário de edição reabria com todos os dias desmarcados e salvar
    // transformava o prato em permanente — um dado perdido em silêncio.
    const form = itemToForm({
      slug: "frango-grelhado",
      categoryId: "cat_1",
      name: { pt: "Frango grelhado" },
      description: { pt: "" },
      image: "",
      available: true,
      order: 0,
      tags: [],
      descriptionLong: { pt: "" },
      kind: "BUFFET",
      weekdays: [1, 3, 4],
    });
    expect(form.weekdays).toEqual(["1", "3", "4"]);
    expect(itemFormToInput(form).weekdays).toEqual([1, 3, 4]);
  });
});
