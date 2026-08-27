import { describe, it, expect } from "vitest";
import { coverOf, normalizeMedia, toPosts } from "@/lib/instagram-media";

/**
 * As regras de capa e descarte do feed do Instagram.
 *
 * Escrito antes de existirem credenciais: quando o token chegar, a dúvida deve
 * ser "a Meta respondeu?", não "será que o carrossel pega a capa certa?". Cada
 * caso aqui é uma armadilha documentada da Graph API, não hipótese.
 */

const base = {
  id: "1",
  permalink: "https://instagram.com/p/abc",
  timestamp: "2026-08-27T12:00:00+0000",
};

describe("escolha da capa", () => {
  it("imagem usa a própria mídia", () => {
    expect(coverOf({ ...base, media_type: "IMAGE", media_url: "foto.jpg" })).toBe(
      "foto.jpg",
    );
  });

  it("vídeo usa a miniatura, nunca o arquivo do vídeo", () => {
    // `media_url` de um VIDEO é o .mp4. Usá-lo como capa faria o navegador
    // baixar megabytes para desenhar um quadrado de 280px.
    const capa = coverOf({
      ...base,
      media_type: "VIDEO",
      media_url: "video.mp4",
      thumbnail_url: "capa.jpg",
    });
    expect(capa).toBe("capa.jpg");
    expect(capa).not.toBe("video.mp4");
  });

  it("carrossel usa a primeira criança, porque o álbum não tem mídia própria", () => {
    expect(
      coverOf({
        ...base,
        media_type: "CAROUSEL_ALBUM",
        // Repare: sem `media_url` — é assim que a Meta costuma devolver.
        children: { data: [{ media_url: "1.jpg" }, { media_url: "2.jpg" }] },
      }),
    ).toBe("1.jpg");
  });

  it("carrossel cujo primeiro item é vídeo cai na miniatura dele", () => {
    expect(
      coverOf({
        ...base,
        media_type: "CAROUSEL_ALBUM",
        children: { data: [{ thumbnail_url: "capa-do-video.jpg" }] },
      }),
    ).toBe("capa-do-video.jpg");
  });

  it("devolve null quando não há imagem utilizável", () => {
    expect(coverOf({ ...base, media_type: "VIDEO" })).toBeNull();
    expect(coverOf({ ...base, media_type: "CAROUSEL_ALBUM" })).toBeNull();
    expect(coverOf({ ...base, media_type: "IMAGE" })).toBeNull();
  });
});

describe("normalização de um post", () => {
  it("preenche legenda vazia em vez de deixar indefinida", () => {
    const post = normalizeMedia({ ...base, media_type: "IMAGE", media_url: "a.jpg" });
    expect(post?.caption).toBe("");
  });

  it("tipo desconhecido vira IMAGE", () => {
    // A Meta pode introduzir tipos novos; a interface só sabe desenhar três.
    const post = normalizeMedia({ ...base, media_type: "REELS", media_url: "a.jpg" });
    expect(post?.type).toBe("IMAGE");
  });

  it("descarta post sem imagem, sem link ou sem data", () => {
    expect(normalizeMedia({ ...base, media_type: "IMAGE" })).toBeNull();
    expect(
      normalizeMedia({ id: "1", media_type: "IMAGE", media_url: "a.jpg", timestamp: base.timestamp }),
    ).toBeNull();
    expect(
      normalizeMedia({ id: "1", media_type: "IMAGE", media_url: "a.jpg", permalink: base.permalink }),
    ).toBeNull();
  });
});

describe("lista completa", () => {
  const post = (id: string, timestamp: string) => ({
    id,
    permalink: `https://instagram.com/p/${id}`,
    timestamp,
    media_type: "IMAGE",
    media_url: `${id}.jpg`,
  });

  it("ordena do mais recente para o mais antigo", () => {
    const posts = toPosts(
      [
        post("antigo", "2026-08-01T10:00:00+0000"),
        post("novo", "2026-08-27T10:00:00+0000"),
        post("medio", "2026-08-15T10:00:00+0000"),
      ],
      10,
    );
    expect(posts.map((p) => p.id)).toEqual(["novo", "medio", "antigo"]);
  });

  it("corta no limite pedido", () => {
    const muitos = Array.from({ length: 12 }, (_, i) =>
      post(String(i), `2026-08-${String(i + 1).padStart(2, "0")}T10:00:00+0000`),
    );
    expect(toPosts(muitos, 4)).toHaveLength(4);
  });

  it("descarta os inválidos e ainda entrega o limite cheio", () => {
    // É por isto que o cliente pede o triplo do que exibe: sem folga, uma
    // sequência de posts sem imagem deixaria a grade incompleta.
    const lista = [
      post("ok1", "2026-08-27T10:00:00+0000"),
      { id: "quebrado", media_type: "VIDEO", timestamp: "2026-08-26T10:00:00+0000" },
      post("ok2", "2026-08-25T10:00:00+0000"),
      post("ok3", "2026-08-24T10:00:00+0000"),
    ];
    const posts = toPosts(lista, 3);
    expect(posts.map((p) => p.id)).toEqual(["ok1", "ok2", "ok3"]);
  });

  it("lista vazia devolve lista vazia, sem estourar", () => {
    expect(toPosts([], 4)).toEqual([]);
  });
});
