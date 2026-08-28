import { siteConfig } from "@/config/site";

/**
 * Formatação de data e hora no fuso do restaurante.
 *
 * ⚠️ **Nunca instancie `Intl.DateTimeFormat` nem chame `toLocaleDateString`
 * direto para mostrar data a uma pessoa.** Sem a opção `timeZone`, os dois
 * formatam no fuso do *processo* — que em desenvolvimento é o da máquina de
 * quem programa (São Paulo, onde o resultado sai certo por coincidência) e na
 * Vercel é UTC, onde sai errado.
 *
 * Santos é UTC−3, então das 21h à meia-noite os dois fusos discordam sobre o
 * dia: um lead recebido às 22h de terça aparecia no painel como quarta-feira,
 * enquanto a notificação por WhatsApp — a única superfície que já fixava o fuso
 * — dizia terça. As duas telas contavam histórias diferentes sobre o mesmo
 * lead, e nada no build, no typecheck ou no ambiente local acusava.
 *
 * `test/fuso-do-restaurante.test.ts` é a guarda: além de cobrar o dia certo,
 * ela varre `src/` e falha se qualquer outro arquivo formatar data por conta
 * própria, por qualquer um dos dois caminhos.
 */
export function restaurantDateFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  // `timeZone` vem DEPOIS do spread de propósito: o chamador não consegue
  // sobrescrevê-lo nem por engano. Este é o único lugar que decide o fuso.
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: siteConfig.timeZone,
  });
}
