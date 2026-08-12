import { describe, it, expect } from "vitest";
import { emptyTestimonialForm, formToInput } from "@/lib/testimonial-form";
import { testimonialSchema } from "@/lib/validations/testimonial";

/**
 * O `sourceUrl` de uma avaliação vira o `href` de um link **público**
 * (`src/components/sections/testimonials.tsx`). O `.url()` do zod se apoia no
 * `new URL()`, que aceita qualquer esquema — inclusive `javascript:`, `data:` e
 * `vbscript:`. Só o admin autenticado escreve o campo e o React 19 bloqueia
 * `href="javascript:…"` no render, então isto é **defesa em profundidade**: a
 * validação é a camada que deveria recusar, e ela precisa recusar.
 */

/** Avaliação mínima válida, com o `sourceUrl` sob teste. */
function inputWithSourceUrl(sourceUrl: string) {
  const v = emptyTestimonialForm();
  v.authorName = "Ana Paula";
  v.quote.pt = "Melhor almoço do Centro.";
  v.sourceUrl = sourceUrl;
  return formToInput(v);
}

const accepts = (sourceUrl: string) =>
  testimonialSchema.safeParse(inputWithSourceUrl(sourceUrl)).success;

describe("sourceUrl da avaliação: só http e https", () => {
  it("recusa javascript:", () => {
    expect(accepts("javascript:alert(1)")).toBe(false);
  });

  it("recusa data:", () => {
    expect(accepts("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("recusa vbscript:", () => {
    expect(accepts("vbscript:msgbox(1)")).toBe(false);
  });

  it("aceita https", () => {
    expect(accepts("https://g.co/kgs/exemplo")).toBe(true);
  });

  it("aceita http", () => {
    expect(accepts("http://exemplo.com/avaliacao")).toBe(true);
  });

  it("aceita string vazia — o campo é opcional e a action a transforma em null", () => {
    const parsed = testimonialSchema.safeParse(inputWithSourceUrl(""));
    expect(parsed.success).toBe(true);
    // `toData` em src/app/actions/testimonials.ts faz `input.sourceUrl || null`,
    // então o valor precisa continuar sendo exatamente a string vazia.
    expect(parsed.success && parsed.data.sourceUrl).toBe("");
  });

  it("continua recusando o que não é URL nenhuma, sem estourar exceção", () => {
    // `new URL("google.com/maps")` lança — a checagem de esquema não pode
    // deixar a exceção escapar do `safeParse`.
    expect(() => testimonialSchema.safeParse(inputWithSourceUrl("google.com/maps"))).not.toThrow();
    expect(accepts("google.com/maps")).toBe(false);
  });
});
