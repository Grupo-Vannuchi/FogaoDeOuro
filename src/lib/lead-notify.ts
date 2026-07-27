import "server-only";
import { prisma } from "@/lib/prisma";
import { sendToGroup } from "@/lib/evolution";
import { normalizePhoneBR, toWhatsappNumber } from "@/lib/phone";

/**
 * Pushes a new (or manually forwarded) site lead to the sales WhatsApp group via
 * Evolution. Best-effort: never throws, and the lead itself is already persisted
 * by the caller, so a WhatsApp failure never affects lead capture. The message
 * is Portuguese (the internal sales team) — no i18n needed.
 */

export type LeadForNotify = {
  id: string;
  type: "CONTACT" | "CAREER";
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string | null;
  portfolio: string | null;
  message: string;
  createdAt: Date;
};

export type NotifyResult = { ok: true } | { ok: false; error: string };

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

/** Build the organized WhatsApp message for a lead (mirrors the Calendar event
 * layout used by the funnel: labeled fields, then the message body). */
export function formatLeadMessage(
  lead: LeadForNotify,
  opts: { manual?: boolean } = {},
): string {
  const source = lead.type === "CAREER" ? "Vaga/Carreira" : "Contato";
  const header = opts.manual ? "📋 Lead encaminhado" : "🔔 Novo lead";
  const lines = [
    `${header} — ${source}`,
    "━━━━━━━━━━━━━━━",
    `👤 Nome: ${lead.name}`,
    `📧 E-mail: ${lead.email}`,
  ];
  if (lead.phone) lines.push(`📱 Telefone: ${lead.phone}`);
  if (lead.type === "CAREER") {
    if (lead.role) lines.push(`💼 Cargo pretendido: ${lead.role}`);
    if (lead.portfolio) lines.push(`🔗 Portfólio: ${lead.portfolio}`);
  } else if (lead.company) {
    lines.push(`🏢 Empresa: ${lead.company}`);
  }
  lines.push("", "💬 Mensagem:", lead.message.trim());
  lines.push("", `🕓 ${dateFmt.format(lead.createdAt)}`);

  const e164 = lead.phone ? normalizePhoneBR(lead.phone) : null;
  if (e164) lines.push(`↩️ Responder: https://wa.me/${toWhatsappNumber(e164)}`);

  return lines.join("\n");
}

/**
 * Send the lead to the configured sales group, if lead notifications are enabled
 * and configured. On success, stamps `whatsappNotifiedAt` (drives the badge).
 */
export async function notifyLead(
  lead: LeadForNotify,
  opts: { manual?: boolean } = {},
): Promise<NotifyResult> {
  const config = await prisma.leadNotificationConfig.findFirst();
  // A target (instance + group) is always required; the `enabled` toggle only
  // gates the AUTOMATIC send — a manual forward works as long as it's configured.
  if (!config?.instance || !config.groupId) {
    return { ok: false, error: "not_configured" };
  }
  if (!opts.manual && !config.enabled) {
    return { ok: false, error: "disabled" };
  }

  const res = await sendToGroup(
    config.instance,
    config.groupId,
    formatLeadMessage(lead, opts),
  );
  if (!res.ok) return res;

  try {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { whatsappNotifiedAt: new Date() },
    });
  } catch (err) {
    // The message went out; failing to stamp the badge is non-fatal.
    console.error("Failed to stamp lead whatsappNotifiedAt", err);
  }
  return { ok: true };
}
