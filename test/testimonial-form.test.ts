import { describe, it, expect } from "vitest";
import {
  emptyTestimonialForm,
  testimonialToForm,
  formToInput,
} from "@/lib/testimonial-form";
import { testimonialSchema } from "@/lib/validations/testimonial";

describe("avaliação", () => {
  it("o formulário vazio não passa: autor e citação são obrigatórios", () => {
    expect(
      testimonialSchema.safeParse(formToInput(emptyTestimonialForm())).success,
    ).toBe(false);
  });

  it("preenchido, passa — sourceUrl é opcional", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana Paula";
    v.quote.pt = "Melhor almoço do Centro.";
    const input = formToInput(v);
    expect(input.sourceUrl).toBe("");
    expect(testimonialSchema.safeParse(input).success).toBe(true);
  });

  it("o formulário vazio já vem com o source padrão", () => {
    expect(emptyTestimonialForm().source).toBe("Google");
  });

  it("recusa um sourceUrl que não é URL", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana";
    v.quote.pt = "Ótimo.";
    v.sourceUrl = "google.com/maps";
    expect(testimonialSchema.safeParse(formToInput(v)).success).toBe(false);
  });

  it("aceita um sourceUrl válido", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana";
    v.quote.pt = "Ótimo.";
    v.sourceUrl = "https://maps.google.com/?cid=123";
    expect(testimonialSchema.safeParse(formToInput(v)).success).toBe(true);
  });

  it("recusa nota fora de 1–5", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana";
    v.quote.pt = "Ótimo.";
    v.rating = "6";
    expect(testimonialSchema.safeParse(formToInput(v)).success).toBe(false);
  });

  it("testimonialToForm lê sourceUrl nulo como texto vazio", () => {
    const form = testimonialToForm({
      authorName: "Ana",
      avatarUrl: null,
      rating: 5,
      quote: { pt: "Ótimo." },
      source: "Google",
      sourceUrl: null,
      order: 0,
      published: true,
    });
    expect(form.sourceUrl).toBe("");
    expect(form.avatarUrl).toBe("");
    expect(form.source).toBe("Google");
  });
});
