import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/app/actions/gallery", () => ({ deleteGalleryPhoto: vi.fn() }));

import { deleteGalleryPhoto } from "@/app/actions/gallery";
import { AdminNotice } from "@/components/admin/admin-notice";
import { GalleryPhotoDeleteButton } from "@/components/admin/gallery-photo-delete-button";
import { renderWithIntl, screen, userEvent, waitFor } from "./test-utils";

/**
 * Sete controles do painel engoliam a falha, e o caminho feliz também.
 *
 * Os cinco botões de excluir e os dois da tela de contatos faziam a mesma dança
 * de dez linhas, copiada sete vezes:
 *
 *     startTransition(async () => {
 *       await acao(id);
 *       router.refresh();
 *     });
 *
 * Parece correto, e é a sugestão natural do React para uma ação que atualiza a
 * tela. Mas **descarta o valor de retorno do callback por construção**: o
 * `{ ok }` que a ação devolve morre ali. Se a exclusão falha — sessão expirada,
 * banco fora, registro com dependência — o `router.refresh()` roda do mesmo
 * jeito, a lista recarrega, a linha continua lá e nada explica por quê.
 *
 * Não era ausência de aviso. Era um aviso ERRADO: a tela se comportava
 * exatamente igual nos dois casos.
 *
 * E uma promessa rejeitada ali dentro não é capturada por nada: sobe para o
 * error boundary e derruba a página em vez de virar uma linha de texto.
 *
 * O sucesso tinha o problema simétrico: a linha some, o botão que tinha o foco
 * some junto, o foco cai no `<body>` e nada anuncia que deu certo — o caminho
 * feliz era indistinguível de não ter acontecido nada.
 */
const acao = vi.mocked(deleteGalleryPhoto);

/**
 * ⚠️ A região de erro existe DESDE SEMPRE, vazia — é o desenho de
 * `status-message.tsx`: região viva criada junto com a mensagem faz o leitor de
 * tela perder o anúncio. A consequência para o teste é que `findByRole("alert")`
 * encontra a região vazia e passa verde sem nada ter falhado. Por isso as
 * asserções cobram TEXTO, não presença.
 */
const aguardaErro = async () => {
  const regiao = await screen.findByRole("alert");
  await waitFor(() => expect(regiao).toHaveTextContent(/\S/));
  return regiao;
};

beforeEach(() => {
  acao.mockReset();
  refresh.mockReset();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

async function excluir() {
  const user = userEvent.setup();
  renderWithIntl(
    <AdminNotice>
      <GalleryPhotoDeleteButton id="foto-1" />
    </AdminNotice>,
  );
  await user.click(screen.getByRole("button", { name: /excluir/i }));
}

describe("excluir no painel", () => {
  it("avisa quando o servidor responde que não deu", async () => {
    acao.mockResolvedValue({ ok: false });
    await excluir();
    await aguardaErro();
  });

  it("não recarrega a lista quando a exclusão falha", async () => {
    // O `refresh` sempre rodava. A lista voltava idêntica e a pessoa ficava
    // olhando para a linha que achava ter apagado.
    acao.mockResolvedValue({ ok: false });
    await excluir();
    await aguardaErro();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("avisa quando a chamada nem chega ao servidor", async () => {
    // Falha de transporte simulada com a ação devolvendo `undefined`: ler `.ok`
    // de `undefined` lança dentro do `try`, igual ao `await` de uma chamada
    // recusada, e sem deixar promessa rejeitada órfã em `mock.results`.
    acao.mockResolvedValue(undefined as never);
    await excluir();
    await aguardaErro();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("recarrega e anuncia quando dá certo", async () => {
    // Sentinela: sem isto, um botão que nunca faz nada passaria nos três
    // testes acima.
    acao.mockResolvedValue({ ok: true });
    await excluir();
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    // A região continua no DOM (é o desenho), mas calada.
    expect(screen.getByRole("alert")).toHaveTextContent("");
    // Quem anuncia não pode ser o botão: ele é destruído junto com a linha que
    // apagou. O aviso mora acima, no painel, e sobrevive ao `refresh` porque
    // ele recarrega os componentes de servidor sem descartar o estado dos de
    // cliente.
    const aviso = await screen.findByRole("status");
    expect(aviso).toHaveTextContent(/./);
    await waitFor(() => expect(aviso).toHaveFocus());
  });

  it("destrava o botão depois da falha, para haver como tentar de novo", async () => {
    acao.mockResolvedValue({ ok: false });
    await excluir();
    await aguardaErro();
    expect(screen.getByRole("button", { name: /excluir/i })).not.toBeDisabled();
  });
});
