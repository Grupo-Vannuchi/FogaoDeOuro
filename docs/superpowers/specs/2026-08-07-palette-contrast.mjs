const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const R = (a, b) => {
  const [x, y] = [L(a), L(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const f = (r) => r.toFixed(2).padStart(5) + ":1 " + (r >= 4.5 ? "AA" : r >= 3 ? "3:1" : "XX");

const AMBAR = "#E68A08", BRASA = "#E04F26", CREME = "#EFE9C2", GRAFITE = "#474544";

console.log("### fundo escuro: candidatos");
for (const bg of ["#121110", "#171615", "#1C1A19", "#232120"]) {
  console.log(`  ${bg}  creme ${f(R(CREME, bg))}  ambar ${f(R(AMBAR, bg))}  brasa ${f(R(BRASA, bg))}`);
}

console.log("\n### superficie (card) sobre o fundo escolhido #171615");
for (const card of ["#232120", "#2A2827", "#332F2D", GRAFITE]) {
  console.log(`  card ${card}  creme sobre ele ${f(R(CREME, card))}  ambar ${f(R(AMBAR, card))}  vs fundo ${R(card, "#171615").toFixed(2)}:1`);
}

console.log("\n### texto do botao sobre a marca ambar #E68A08");
for (const fg of ["#000000", "#0a0a0a", "#171615", GRAFITE, "#ffffff"])
  console.log(`  ${fg}  ${f(R(fg, AMBAR))}`);

console.log("\n### TEMA CLARO: ambar escurecido como texto sobre creme");
for (const hex of ["#B36A06", "#A66105", "#9A5A05", "#8A5206", "#7D4A05"])
  console.log(`  ${hex}  sobre creme ${f(R(hex, CREME))}   branco sobre ele ${f(R("#ffffff", hex))}`);

console.log("\n### TEMA CLARO: outros pares");
console.log(`  grafite sobre creme (texto)   ${f(R(GRAFITE, CREME))}`);
console.log(`  brasa sobre creme (estrelas)  ${f(R(BRASA, CREME))}`);
console.log(`  preto sobre brasa (botao)     ${f(R("#0a0a0a", BRASA))}`);

console.log("\n### neutros quentes p/ tema claro (fundo creme #EFE9C2)");
for (const card of ["#FBF7E6", "#F7F2DC", "#FFFDF5"])
  console.log(`  card ${card}  grafite sobre ele ${f(R(GRAFITE, card))}  vs fundo ${R(card, CREME).toFixed(2)}:1`);
