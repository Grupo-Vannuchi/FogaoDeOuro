import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  Link: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/app/actions/menu", () => ({
  createMenuCategory: vi.fn(),
  updateMenuCategory: vi.fn(),
}));

import { createMenuCategory } from "@/app/actions/menu";
import { MenuCategoryForm } from "@/components/admin/menu-category-form";
import { renderWithIntl, screen, userEvent, waitFor } from "./test-utils";

/**
 * Os cinco formulários do painel sumiam com a falha de transporte.
 *
 * Eles JÁ tratavam a resposta `{ ok: false }` — o servidor dizendo que não deu.
 * O que faltava era o caso em que a ação **não chega a responder**: rede caída,
 * servidor reiniciando, publicação no meio da requisição.
 *
 * Sem `try/catch`, `setServerError` nunca roda. O react-hook-form devolve
 * `isSubmitting` a false no seu próprio `finally` e RELANÇA, então o botão
 * destrava e a tela não muda em nada. Quem estava cadastrando um prato conclui
 * que salvou, sai da tela, e o prato não existe.
 *
 * Dois detalhes que vêm junto, pela mesma razão de sempre:
 *
 * - **`aria-disabled`, e não `disabled`.** No Chrome, desabilitar o elemento que
 *   tem o foco joga o foco no `<body>` — a pessoa perde o lugar no instante do
 *   clique. Quem impede o envio duplicado é a guarda no `onSubmit`.
 * - **A mensagem usa o token de erro**, não o `text-red-500` do Tailwind, que dá
 *   3,07:1 sobre o creme deste site e reprova o mínimo de 4,5.
 */
const acao = vi.mocked(createMenuCategory);

const VALORES = {
  slug: "da-brasa",
  name: { pt: "Da brasa" },
  description: { pt: "" },
  order: 0,
  published: true,
} as unknown as Parameters<typeof MenuCategoryForm>[0]["defaultValues"];

beforeEach(() => {
  acao.mockReset();
  push.mockReset();
  refresh.mockReset();
});

async function salvar() {
  const user = userEvent.setup();
  renderWithIntl(<MenuCategoryForm mode="create" defaultValues={VALORES} />);
  const botao = screen.getByRole("button", { name: /salvar|criar/i });
  await user.click(botao);
  return { user, botao };
}

describe("salvar no formulário do painel", () => {
  it("avisa quando a chamada não chega ao servidor", async () => {
    // Falha de transporte simulada com a ação devolvendo `undefined`: ler `.ok`
    // de `undefined` lança dentro do `try`, igual ao `await` de uma chamada
    // recusada, e sem deixar promessa rejeitada órfã em `mock.results`.
    acao.mockResolvedValue(undefined as never);
    await salvar();
    const aviso = await screen.findByRole("alert");
    await waitFor(() => expect(aviso).toHaveTextContent(/\S/));
    expect(push).not.toHaveBeenCalled();
  });

  it("continua avisando quando o servidor responde que não deu", async () => {
    // Sentinela: o `catch` novo não pode engolir o caminho que já funcionava.
    acao.mockResolvedValue({ ok: false, error: "unknown" } as never);
    await salvar();
    const aviso = await screen.findByRole("alert");
    await waitFor(() => expect(aviso).toHaveTextContent(/\S/));
    expect(push).not.toHaveBeenCalled();
  });

  it("navega quando dá certo", async () => {
    // Sentinela: sem esta, um formulário que nunca salva passaria nos dois
    // testes acima.
    acao.mockResolvedValue({ ok: true } as never);
    await salvar();
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("não desabilita o botão que tem o foco durante o envio", async () => {
    let liberar!: (v: unknown) => void;
    acao.mockReturnValue(
      new Promise((res) => {
        liberar = res;
      }) as never,
    );
    const { botao } = await salvar();
    await waitFor(() => expect(botao).toHaveAttribute("aria-disabled", "true"));
    // `disabled` tira o elemento da árvore de foco; `aria-disabled` não.
    expect(botao).not.toBeDisabled();
    liberar({ ok: true });
    await waitFor(() => expect(push).toHaveBeenCalled());
  });

  it("não salva duas vezes quando o botão é clicado durante o envio", async () => {
    // A contrapartida de trocar `disabled` por `aria-disabled`: o clique ainda
    // chega. Sem guarda, viram duas categorias iguais.
    let liberar!: (v: unknown) => void;
    acao.mockReturnValue(
      new Promise((res) => {
        liberar = res;
      }) as never,
    );
    const { user, botao } = await salvar();
    await waitFor(() => expect(acao).toHaveBeenCalledTimes(1));
    await user.click(botao);
    await user.click(botao);
    expect(acao).toHaveBeenCalledTimes(1);
    liberar({ ok: true });
    await waitFor(() => expect(push).toHaveBeenCalled());
  });
});

/**
 * A varredura, porque o defeito estava nos CINCO ao mesmo tempo.
 *
 * O teste de comportamento acima exercita um formulário. Consertar cinco e
 * guardar só um é convidar o sexto — foi assim que os sete controles de sexta
 * nasceram, cada cópia carregando o mesmo defeito.
 */
const FORMULARIOS = readdirSync(join(process.cwd(), "src/components/admin"))
  .filter((n) => /-form\.tsx$/.test(n) && n !== "login-form.tsx")
  .map((n) => join("src/components/admin", n).split(sep).join("/"));

const semComentarios = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("todos os formulários do painel", () => {
  it("são cinco, e a lista foi lida de fato", () => {
    // Sentinela: um caminho errado deixaria as duas checagens abaixo vazias.
    expect(FORMULARIOS.length).toBe(5);
  });

  for (const caminho of FORMULARIOS) {
    const nome = relative("src/components/admin", caminho);

    it(`${nome} captura a falha de transporte`, () => {
      expect(semComentarios(readFileSync(caminho, "utf8"))).toMatch(/catch/);
    });

    it(`${nome} não perde o foco desabilitando o botão`, () => {
      const fonte = semComentarios(readFileSync(caminho, "utf8"));
      // `(?<!aria-)` e não `\b`: a borda de palavra casa DENTRO de
      // `aria-disabled`, então a primeira versão desta guarda reprovava a
      // própria correção que ela existe para cobrar.
      expect(fonte).not.toMatch(/(?<!aria-)disabled=\{isSubmitting\}/);
      expect(fonte).toMatch(/aria-disabled=\{isSubmitting\}/);
    });

    it(`${nome} mostra o erro na cor medida, não no vermelho cru`, () => {
      expect(semComentarios(readFileSync(caminho, "utf8"))).not.toMatch(
        /text-red-\d{3}/,
      );
    });
  }
});
