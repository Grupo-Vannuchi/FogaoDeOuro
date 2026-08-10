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

  it("weekday vazio vira null; preenchido vira número", () => {
    const values = emptyMenuItemForm("cat_1");
    values.slug = "feijoada";
    values.name.pt = "Feijoada";

    expect(itemFormToInput(values).weekday).toBeNull();

    values.weekday = "3";
    expect(itemFormToInput(values).weekday).toBe(3);
  });

  it("recusa weekday fora de 1–5 (o restaurante abre de segunda a sexta)", () => {
    const values = emptyMenuItemForm("cat_1");
    values.slug = "x";
    values.name.pt = "X";
    values.weekday = "6";
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
      weekday: null,
    });
    expect(form.tags).toBe("vegetariano, leve");
    expect(form.weekday).toBe("");
  });
});
