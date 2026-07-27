"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyLead } from "@/lib/lead-notify";
import { resolveLandingLabel } from "@/lib/lead-landing";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  careerSchema,
  contactSchema,
  type CareerInput,
  type ContactInput,
} from "@/lib/validations/lead";
import { hasLocale } from "next-intl";
import { defaultLocale, routing } from "@/i18n/routing";

export type LeadResult = { ok: boolean };

function resolveLocale(locale: string): string {
  return hasLocale(routing.locales, locale) ? locale : defaultLocale;
}

/** First-touch attribution fields, normalized to null, for the lead row. */
function attributionData(d: {
  referrer?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  return {
    referrer: d.referrer || null,
    landingPage: d.landingPage || null,
    utmSource: d.utmSource || null,
    utmMedium: d.utmMedium || null,
    utmCampaign: d.utmCampaign || null,
  };
}

/** Persist a contact-form submission. Re-validates server-side. */
export async function submitContactLead(
  input: ContactInput,
  locale: string,
): Promise<LeadResult> {
  // Public write endpoint → per-IP rate limit (5/min).
  const rl = await rateLimit("contact-lead", await clientIp(), {
    limit: 5,
    windowSeconds: 60,
  });
  if (!rl.ok) return { ok: false };

  const parsed = contactSchema().safeParse(input);
  if (!parsed.success) return { ok: false };
  // Honeypot tripped → pretend success, persist nothing.
  if (parsed.data.hp) return { ok: true };

  try {
    const { name, email, phone, company, message } = parsed.data;
    // Resolve the landing page to a human label and FREEZE it on the lead.
    const landingLabel = parsed.data.landingPage
      ? await resolveLandingLabel(parsed.data.landingPage, locale)
      : null;
    const lead = await prisma.lead.create({
      data: {
        type: "CONTACT",
        name,
        email,
        phone: phone || null,
        company: company || null,
        message,
        locale: resolveLocale(locale),
        ...attributionData(parsed.data),
        landingLabel,
      },
    });
    // Push to the sales WhatsApp group after the response — never delays or fails
    // the visitor's submit.
    after(() => notifyLead(lead));
    return { ok: true };
  } catch (error) {
    console.error("Failed to persist contact lead", error);
    return { ok: false };
  }
}

/** Persist a careers-form submission. Re-validates server-side. */
export async function submitCareerLead(
  input: CareerInput,
  locale: string,
): Promise<LeadResult> {
  // Public write endpoint → per-IP rate limit (5/min).
  const rl = await rateLimit("career-lead", await clientIp(), {
    limit: 5,
    windowSeconds: 60,
  });
  if (!rl.ok) return { ok: false };

  const parsed = careerSchema().safeParse(input);
  if (!parsed.success) return { ok: false };
  // Honeypot tripped → pretend success, persist nothing.
  if (parsed.data.hp) return { ok: true };

  try {
    const { name, email, phone, role, portfolio, message } = parsed.data;
    const landingLabel = parsed.data.landingPage
      ? await resolveLandingLabel(parsed.data.landingPage, locale)
      : null;
    const lead = await prisma.lead.create({
      data: {
        type: "CAREER",
        name,
        email,
        phone: phone || null,
        role: role || null,
        portfolio: portfolio || null,
        message,
        locale: resolveLocale(locale),
        ...attributionData(parsed.data),
        landingLabel,
      },
    });
    after(() => notifyLead(lead));
    return { ok: true };
  } catch (error) {
    console.error("Failed to persist career lead", error);
    return { ok: false };
  }
}
