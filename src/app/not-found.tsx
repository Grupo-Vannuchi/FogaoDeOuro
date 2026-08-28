import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * Global fallback for requests that don't match any locale segment. Renders its
 * own document because it lives above the locale root layout.
 *
 * ⚠️ Estava inteira em inglês — `lang="en"` e o texto padrão do Next, nunca
 * trocado. Num restaurante do Centro de Santos, cujo site é português por
 * decisão de projeto, quem digitava o endereço errado caía numa página noutro
 * idioma. E o `lang` errado não é detalhe de etiqueta: é o atributo que faz o
 * leitor de tela escolher a voz e a pronúncia.
 *
 * O texto fica fixo aqui, sem next-intl, porque esta página vive ACIMA da raiz
 * de locale e não alcança o contexto de requisição — e o site tem um idioma só.
 *
 * As cores vêm de `siteConfig` em vez de hexadecimal copiado: o azul que estava
 * aqui, `#4f46e5`, não tinha relação nenhuma com a marca. Como o documento é
 * próprio e não recebe o CSS do site, os dois temas entram por um `<style>`
 * mínimo — o site tem tema claro e escuro, e uma página de erro que ignora isso
 * pisca branco na cara de quem está no escuro.
 */
const { light, dark } = siteConfig.theme;

const estilos = `
  :root {
    --fundo: ${light.background};
    --texto: ${light.foreground};
    --marca: ${light.brand};
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fundo: ${dark.background};
      --texto: ${dark.foreground};
      --marca: ${dark.brand};
      color-scheme: dark;
    }
  }
`;

export default function GlobalNotFound() {
  return (
    <html lang="pt-BR">
      <head>
        <style dangerouslySetInnerHTML={{ __html: estilos }} />
      </head>
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
          background: "var(--fundo)",
          color: "var(--texto)",
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
          Não encontramos esta página
        </h1>
        <p style={{ opacity: 0.75, maxWidth: "34rem" }}>
          O endereço pode ter mudado ou ter sido digitado com algum erro.
        </p>
        <Link href="/" style={{ color: "var(--marca)", fontWeight: 600 }}>
          Voltar para o início
        </Link>
      </body>
    </html>
  );
}
