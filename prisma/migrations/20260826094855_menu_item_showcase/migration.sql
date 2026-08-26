-- Separa a vitrine institucional do cardápio da semana.
--
-- "Nossa Gastronomia" apresenta o que a casa serve sempre — churrasco na brasa,
-- ilha de massas, sobremesas — com fotos curadas. O cardápio digital lista o
-- que sai em cada dia útil. São conteúdos diferentes na mesma tabela, e sem
-- esta marca as duas páginas mostram a mesma coisa.
ALTER TYPE "MenuItemKind" ADD VALUE 'SHOWCASE';
