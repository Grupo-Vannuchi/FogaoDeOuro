import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}));

import {
  InformationGallery,
  useInformationGallery,
} from "@/components/information-gallery";
import { renderWithIntl, screen, userEvent, waitFor } from "./test-utils";

/**
 * A janela de foto declarava ser modal e não movia o foco.
 *
 * `role="dialog"` e `aria-modal="true"` são uma PROMESSA à tecnologia
 * assistiva: a de que o resto da página está inerte enquanto a janela estiver
 * aberta. Declarar sem mover o foco torna a promessa falsa — o cursor continua
 * atrás do véu, a tabulação passeia pela página escondida, e os controles da
 * janela (fechar, anterior, próxima) ficam inalcançáveis por teclado.
 *
 * O que já existia: Escape fecha e a rolagem do fundo trava. O que faltava eram
 * as outras três garantias — o foco entrar, ficar preso, e voltar para quem
 * abriu. Sem a última, fechar joga a pessoa no `<body>`, ou seja, no topo do
 * documento, longe da foto que ela estava vendo.
 */
/**
 * Só os campos que o carrossel usa. `InformationView` tem muito mais, e um
 * objeto completo aqui só esconderia o que o componente de fato lê.
 */
const ITENS = [
  { slug: "buffet", image: "/a.jpg", title: "Buffet quentinho" },
  { slug: "brasa", image: "/b.jpg", title: "Corte na brasa" },
] as unknown as Parameters<typeof InformationGallery>[0]["items"];

function Abridor() {
  const galeria = useInformationGallery();
  return (
    <button type="button" onClick={() => galeria?.openAt("buffet")}>
      abrir a galeria
    </button>
  );
}

async function abrir() {
  const user = userEvent.setup();
  renderWithIntl(
    <InformationGallery items={ITENS}>
      <Abridor />
    </InformationGallery>,
  );
  const gatilho = screen.getByRole("button", { name: "abrir a galeria" });
  await user.click(gatilho);
  return { user, gatilho };
}

describe("a janela de foto", () => {
  it("leva o foco para dentro ao abrir", async () => {
    await abrir();
    const dialogo = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(dialogo.contains(document.activeElement)).toBe(true),
    );
  });

  it("prende a tabulação dentro dela", async () => {
    const { user } = await abrir();
    const dialogo = await screen.findByRole("dialog");
    // Volta suficiente para sair da janela se nada segurasse.
    for (let i = 0; i < 12; i++) {
      await user.tab();
      expect(
        dialogo.contains(document.activeElement),
        `o foco escapou na tabulação ${i + 1}`,
      ).toBe(true);
    }
  });

  it("devolve o foco a quem abriu, ao fechar", async () => {
    const { user, gatilho } = await abrir();
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // Sem isto a pessoa cai no `<body>`, ou seja, no topo do documento, longe
    // da foto que estava vendo.
    await waitFor(() => expect(gatilho).toHaveFocus());
  });

  it("continua fechando com Escape e travando a rolagem", async () => {
    // Sentinela: as duas garantias que já existiam não podem sumir na troca.
    const { user } = await abrir();
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
