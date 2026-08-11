import { describe, it, expect } from "vitest";
import {
  emptyGalleryPhotoForm,
  photoToForm,
  photoFormToInput,
} from "@/lib/gallery-form";
import { galleryPhotoSchema } from "@/lib/validations/gallery";

describe("foto da galeria", () => {
  it("o formulário vazio não passa: a imagem é obrigatória", () => {
    const input = photoFormToInput(emptyGalleryPhotoForm());
    expect(galleryPhotoSchema.safeParse(input).success).toBe(false);
  });

  it("com imagem, passa mesmo sem legenda — a legenda é opcional", () => {
    const values = emptyGalleryPhotoForm();
    values.image = "https://exemplo.com/salao.webp";
    const input = photoFormToInput(values);
    expect(input.caption.pt).toBe("");
    expect(galleryPhotoSchema.safeParse(input).success).toBe(true);
  });

  it("recusa uma imagem que não é URL", () => {
    const values = emptyGalleryPhotoForm();
    values.image = "salao.webp";
    expect(galleryPhotoSchema.safeParse(photoFormToInput(values)).success).toBe(
      false,
    );
  });

  it("converte a ordem para número e apara a legenda", () => {
    const values = emptyGalleryPhotoForm();
    values.image = "https://exemplo.com/salao.webp";
    values.caption.pt = "  O salão renovado  ";
    values.order = "7";
    const input = photoFormToInput(values);
    expect(input.order).toBe(7);
    expect(input.caption.pt).toBe("O salão renovado");
  });

  it("photoToForm lê uma legenda ausente como texto vazio", () => {
    // `caption` tem default `{}` no Prisma: a chave `pt` só existe depois que
    // alguém salva o formulário. Ler isso como undefined quebraria o input.
    const form = photoToForm({
      image: "https://exemplo.com/fachada.webp",
      caption: {},
      order: 2,
      published: false,
    });
    expect(form.caption.pt).toBe("");
    expect(form.order).toBe("2");
    expect(form.published).toBe(false);
  });

  it("photoToForm devolve a legenda existente", () => {
    const form = photoToForm({
      image: "https://exemplo.com/mesa.webp",
      caption: { pt: "A mesa posta" },
      order: 0,
      published: true,
    });
    expect(form.caption.pt).toBe("A mesa posta");
  });
});
