/**
 * Tira da galeria as fotos cujo assunto é o salão, não a comida.
 *
 * O pedido do cliente em 10/09: a galeria mostra o que se come, e o ambiente
 * já tem lugar próprio no topo de Horários & Reservas e na Experiência.
 *
 * **Por que seis e não três.** As três de interior puro são óbvias. Entram
 * também duas de buffet em que o salão ocupa o terço superior do quadro e uma
 * garrafa com o salão inteiro desfocado atrás — em todas, o cômodo é o que se
 * vê. E seis é o número que fecha a conta: a grade é de 2 colunas no tablet e
 * 3 no desktop, então o total precisa ser múltiplo de 6 para nenhuma fileira
 * terminar torta. 24 - 6 = 18.
 *
 * Uso:
 *   node scripts/trim-gallery.mjs [--dry-run]
 */
import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const DRY = process.argv.includes("--dry-run");

function loadEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

/** Casadas por id: o índice muda a cada reordenação, o id não. */
const FORA = [
  ["cmt7c3d9a0001iowka5ess03z", "salão com o painel de mosaico e as prateleiras"],
  ["cmtbjsek40002iorsi9znhyy1", "salão com as luminárias verdes e a adega"],
  ["cmt7c3d9a0003iowkmxrmfm0t", "salão com as mesas e a parede amarela"],
  ["cmt7c3d9a000eiowk3bf9hqpn", "buffet com o salão no terço de cima"],
  ["cmtagvwrz0000iopob31mlnuu", "buffet e salão — a legenda já dizia"],
  ["cmtioasom0000io5o708gkjdo", "garrafa com o salão desfocado atrás"],
];

async function main() {
  loadEnv();
  const prisma = new PrismaClient();

  const antes = await prisma.galleryPhoto.count();
  const ids = FORA.map(([id]) => id);

  const achadas = await prisma.galleryPhoto.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  const faltando = ids.filter((id) => !achadas.some((f) => f.id === id));
  if (faltando.length > 0) {
    console.error("ids que não existem mais na galeria:");
    faltando.forEach((id) => console.error("  • " + id));
    console.error("nada foi removido.");
    process.exit(1);
  }

  console.log(`galeria hoje: ${antes} fotos`);
  FORA.forEach(([, motivo]) => console.log(`  sai — ${motivo}`));
  console.log(`ficam: ${antes - FORA.length}`);

  if (DRY) {
    console.log("\n--dry-run: nada removido.");
    await prisma.$disconnect();
    return;
  }

  await prisma.galleryPhoto.deleteMany({ where: { id: { in: ids } } });

  // Renumera de 0 em diante preservando a ordem relativa: a ordem atual foi
  // resolvida para não pôr duas fotos parecidas lado a lado, e tirar seis do
  // meio abriria buracos na numeração sem desfazer esse trabalho.
  const restantes = await prisma.galleryPhoto.findMany({
    orderBy: { order: "asc" },
    select: { id: true },
  });
  await prisma.$transaction(
    restantes.map((f, i) =>
      prisma.galleryPhoto.update({ where: { id: f.id }, data: { order: i } }),
    ),
  );

  console.log(`\ngaleria agora: ${restantes.length} fotos, ordem 0..${restantes.length - 1}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
