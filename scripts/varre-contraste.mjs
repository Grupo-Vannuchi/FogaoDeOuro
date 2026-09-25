/**
 * Varredura de contraste no COMPOSTO RENDERIZADO.
 *
 * Não mede o token declarado: esconde o texto, fotografa, e amostra a cor que
 * sobra sob cada elemento. É a única forma de pegar texto que cai sobre foto,
 * gradiente ou forma decorativa — casos em que o valor do token não diz nada
 * sobre o que a pessoa vê.
 *
 * Uso, com o servidor de desenvolvimento no ar:
 *
 *   rm -rf .next/dev/cache/images
 *   node scripts/varre-contraste.mjs /cardapio,/
 *
 * Sai com código 1 se houver qualquer reprova, para servir de porta em CI.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  As três armadilhas que esta varredura já caiu, e a defesa de cada uma
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Cada uma custou horas e produziu números convincentes e errados. Número
 * errado e evidente a gente descarta; o perigo é o número errado e crível —
 * ele manda procurar o defeito no lugar errado, e às vezes aprova a tela
 * quebrada.
 *
 * **1. Amostrar um ponto que não é do elemento medido.** Sem confirmar a
 * quem o pixel pertence, a varredura compara a cor do texto com o que estiver
 * por cima ou ao lado — um cartão vizinho, o botão flutuante do WhatsApp, o
 * próprio glifo. Em 11/09 isso rendeu dezenas de reprovas falsas e escondeu a
 * única verdadeira. Defesa: `document.elementFromPoint` confirma o dono do
 * ponto antes de medir.
 *
 * **2. Descongelar a animação acendendo a decoração junto.** A primeira
 * versão forçava `opacity: 1 !important` em `*` para a animação de entrada não
 * ser fotografada no meio. Só que decoração de fundo usa opacidade baixa de
 * propósito — forçar 1 acende o fundo na força total e mede uma tela que não
 * existe. Em 14/09 isso produziu 123 reprovas fantasmas. Defesa: só
 * descongela o que NÃO é `aria-hidden`; decoração é sempre `aria-hidden`
 * neste projeto, e conteúdo nunca é.
 *
 * **3. Medir com o layout ainda se mexendo.** As fotos são `lazy`: se a
 * medição dos retângulos acontece antes de elas carregarem, o layout desloca
 * entre a medição e a foto, e os pontos caem noutro lugar. Defesa: esperar
 * `img.complete` em todas antes de medir.
 *
 * **4. Confiar numa guarda de COR para descartar sobreposição.** O botão
 * flutuante do WhatsApp cobre texto, e a defesa era pular o ponto cuja cor
 * fosse exatamente o verde dele. Só que a borda arredondada é anti-serrilhada
 * e a `shadow-lg` esmaece: a rampa entre o verde e o fundo passa por dezenas
 * de tons, nenhum deles igual ao verde. Em 25/09 isso produziu uma reprova de
 * `4,47` num texto que, medido nos outros pontos de rolagem, dava `5,11` — e
 * quase rendeu um token escurecido para corrigir uma tela que estava certa.
 * Aumentar a tolerância da cor não resolve: a rampa termina no próprio fundo,
 * então qualquer tolerância larga o bastante para pegar a sombra também
 * descarta o fundo legítimo. Defesa: descartar por GEOMETRIA. Elemento
 * `fixed`/`sticky` COM `z-index` positivo e que não seja ancestral do medido é
 * sobreposição; o retângulo dele, folgado para a sombra, vira zona morta. O
 * `z-index` é o que separa sobreposição de fundo full-bleed: a lavagem do
 * cardápio também é `fixed inset-0`, mas em `-z-10`, e é justamente o fundo a
 * medir.
 *
 * E uma quinta, que não é do script: **o cache de imagens do Next**. Trocar um
 * arquivo em `public/` não invalida as versões otimizadas em
 * `.next/dev/cache/images`. Medir sem limpar mede a imagem antiga — e cada
 * largura do `srcset` é uma entrada de cache diferente, então conferir uma só
 * não prova nada. Por isso o `rm -rf` no uso acima.
 */

/**
 * `@playwright/test`, a dependência deste projeto mesmo.
 *
 * Até 17/09 esta linha era um caminho absoluto para o `node_modules` do
 * projeto irmão, com um aviso dizendo que o Playwright "não é dependência
 * deste projeto". A premissa estava errada: `@playwright/test` já estava no
 * `devDependencies` — o caminho absoluto sobreviveu de quando a varredura foi
 * adaptada de lá, e ninguém reconferiu. O efeito era que o script rodava só
 * nesta máquina, e quebrava para qualquer outra pessoa e no CI.
 *
 * `chromium` vem de `@playwright/test` (que o reexporta do `playwright-core`)
 * e não de `playwright`: é o pacote que este projeto declara.
 */
import { chromium } from "@playwright/test";
const sharp = (await import("sharp")).default;

/** Mínimo da WCAG para texto normal. */
const MINIMO = 4.5;

const LARGURAS = [
  ["desktop", 1920, 950],
  ["laptop", 1440, 900],
  ["celular", 390, 844],
];

/**
 * Folga, em px, somada ao retângulo de cada sobreposição `fixed`/`sticky`.
 *
 * A sombra pinta FORA do retângulo, e é justamente a rampa dela que enganou a
 * guarda de cor (armadilha 4). `shadow-lg` do Tailwind desloca 10px e desfoca
 * 15px, então 24px cobre a sombra inteira com margem.
 */
const FOLGA_SOBREPOSICAO = 24;

const luminancia = ([r, g, b]) => {
  const c = [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const razao = (a, b) => {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [alto, baixo] = la > lb ? [la, lb] : [lb, la];
  return (alto + 0.05) / (baixo + 0.05);
};

const corDoTexto = (s) => s.match(/\d+/g).slice(0, 3).map(Number);

const rotas = (process.argv[2] ?? "/cardapio").split(",").filter(Boolean);
const base = process.env.BASE_URL ?? "http://localhost:3000";

const navegador = await chromium.launch();
let reprovas = 0;

for (const rota of rotas) {
  for (const [nome, largura, altura] of LARGURAS) {
    const pagina = await navegador.newPage({
      viewport: { width: largura, height: altura },
      reducedMotion: "reduce",
    });
    await pagina.goto(`${base}${rota}`, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });

    // Armadilha 2: descongela só o conteúdo. Decoração é `aria-hidden` e
    // mantém a opacidade que o desenho lhe deu.
    await pagina.addStyleTag({
      content: `
        *,*::before,*::after { animation: none !important; transition: none !important }
        *:not([aria-hidden="true"]):not([aria-hidden="true"] *) { opacity: 1 !important }
      `,
    });
    await pagina.waitForTimeout(500);

    const alturaTotal = await pagina.evaluate(() => document.body.scrollHeight);
    let amostras = 0;
    let pior = { r: 99 };
    const vistos = new Set();

    for (let y = 0; y < alturaTotal - altura * 0.15; y += Math.floor(altura * 0.75)) {
      await pagina.evaluate((yy) => window.scrollTo(0, yy), y);

      // Armadilha 3: espera o layout parar de se mexer.
      await pagina
        .waitForFunction(() => [...document.images].every((i) => i.complete), null, {
          timeout: 15000,
        })
        .catch(() => {});
      await pagina.waitForTimeout(400);

      const alvos = await pagina.evaluate((folga) => {
        const saida = [];

        // Armadilha 4: sobreposição se descarta por geometria, não por cor.
        // `elementFromPoint` não basta — ele devolve quem está embaixo quando a
        // sobreposição tem `pointer-events: none`, e ignora a sombra, que pinta
        // fora do retângulo do elemento.
        // `fixed` sozinho não serve de critério: a lavagem do cardápio é
        // `fixed inset-0` e cobriria a tela toda — mas ela fica ATRÁS, em
        // `-z-10`, e é o fundo que a varredura quer medir. Quem pinta por cima
        // precisa se levantar do empilhamento, então o critério é o `z-index`
        // positivo. (Primeira tentativa deste conserto usou só a posição e
        // zerou as 1200 amostras do cardápio: uma porta que não mede nada
        // aprova tudo.)
        const sobreposicoes = [];
        for (const el of document.querySelectorAll("body *")) {
          const estilo = getComputedStyle(el);
          const pos = estilo.position;
          if (pos !== "fixed" && pos !== "sticky") continue;
          if (!(Number(estilo.zIndex) > 0)) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          sobreposicoes.push({
            el,
            topo: r.top - folga,
            base: r.bottom + folga,
            esq: r.left - folga,
            dir: r.right + folga,
          });
        }

        const seletor =
          "main p, main h1, main h2, main h3, main h4, main span, main li, main a, footer p, footer a, footer h3";
        for (const el of document.querySelectorAll(seletor)) {
          const texto = el.textContent?.trim();
          if (!texto || texto.length < 3) continue;
          // Só folhas: um contêiner "contém" o texto dos filhos, e medir a cor
          // dele contra a foto que ele embrulha não diz nada.
          if (el.children.length > 0) continue;

          const r = el.getBoundingClientRect();
          const topo = Math.max(r.top, 1);
          const base = Math.min(r.bottom, window.innerHeight - 1);
          const esq = Math.max(r.left, 1);
          const dir = Math.min(r.right, window.innerWidth - 1);
          if (base - topo < 6 || dir - esq < 6) continue;

          const ym = (topo + base) / 2;

          // Uma sobreposição que EMBRULHA o medido (cabeçalho grudado, por
          // exemplo) é o fundo dele, não estorvo: essas não valem como zona
          // morta, senão o próprio texto delas nunca seria medido.
          const zonasMortas = sobreposicoes.filter((s) => !s.el.contains(el));

          const pontos = [];
          for (let k = 1; k <= 5; k++) {
            const x = esq + ((dir - esq) * k) / 6;
            // Armadilha 1: o ponto tem de pertencer a ESTE elemento.
            const dono = document.elementFromPoint(x, ym);
            if (dono !== el && !el.contains(dono)) continue;
            // Armadilha 4: e não pode cair na sombra de uma sobreposição.
            const coberto = zonasMortas.some(
              (s) => x >= s.esq && x <= s.dir && ym >= s.topo && ym <= s.base,
            );
            if (coberto) continue;
            pontos.push([x, ym]);
          }
          if (pontos.length) {
            saida.push({
              txt: texto.slice(0, 44),
              cor: getComputedStyle(el).color,
              pontos,
            });
          }
        }
        return saida;
      }, FOLGA_SOBREPOSICAO);
      if (!alvos.length) continue;

      const esconde = await pagina.addStyleTag({
        content: `main *, footer * { color: transparent !important }`,
      });
      await pagina.waitForTimeout(150);
      const { data, info } = await sharp(await pagina.screenshot())
        .raw()
        .toBuffer({ resolveWithObject: true });
      await esconde.evaluate((n) => n.remove());

      const pixel = (x, y) => {
        const i = (Math.round(y) * info.width + Math.round(x)) * info.channels;
        return [data[i], data[i + 1], data[i + 2]];
      };

      for (const alvo of alvos) {
        const cor = corDoTexto(alvo.cor);
        for (const [x, y] of alvo.pontos) {
          if (x < 0 || y < 0 || x >= info.width || y >= info.height) continue;
          const fundo = pixel(x, y);

          amostras++;
          const r = razao(cor, fundo);
          if (r < MINIMO) {
            const chave = `${alvo.txt}|${fundo}`;
            if (!vistos.has(chave)) {
              vistos.add(chave);
              reprovas++;
              console.log(`  ❌ ${r.toFixed(2)}  "${alvo.txt}"  sobre rgb(${fundo})`);
            }
          }
          if (r < pior.r) pior = { r, txt: alvo.txt };
        }
      }
    }

    const larguraRolagem = await pagina.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const vaza = larguraRolagem > largura;
    if (vaza) {
      reprovas++;
      console.log(
        `  ❌ rolagem horizontal: ${larguraRolagem}px numa tela de ${largura}px`,
      );
    }

    console.log(
      `${rota} ${nome.padEnd(8)} ${String(amostras).padStart(5)} amostras | ` +
        `pior ${pior.r.toFixed(2)} | rolagem ${vaza ? "VAZA" : "ok"}`,
    );
    await pagina.close();
  }
}

await navegador.close();
console.log(reprovas === 0 ? "\n✅ 0 reprovas" : `\n❌ ${reprovas} reprovas`);
process.exit(reprovas === 0 ? 0 : 1);
