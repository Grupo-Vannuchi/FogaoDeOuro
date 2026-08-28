"use client";

import { usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { MapEmbed } from "@/components/layout/map-embed";

/**
 * O mapa do rodapé — em todas as páginas, menos na de contato.
 *
 * Lá ele aparece acima do formulário, junto do endereço, que é onde a pessoa
 * está procurando por ele. Dois mapas na mesma página, a algumas centenas de
 * pixels um do outro, não informam duas vezes: informam uma vez e ocupam o
 * dobro do espaço.
 *
 * Cliente porque a decisão depende da rota, e o rodapé é montado no layout, que
 * não conhece a página que está renderizando. `usePathname` do next-intl já
 * devolve o caminho sem o prefixo de idioma.
 */
export function FooterMap({ src, title }: { src: string; title: string }) {
  const pathname = usePathname();
  if (pathname === "/contato") return null;

  return (
    <div className="border-t border-border">
      <Container className="py-10">
        <MapEmbed src={src} title={title} />
      </Container>
    </div>
  );
}
