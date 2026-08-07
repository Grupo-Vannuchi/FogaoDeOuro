import { z } from "zod";

/**
 * Validation for the public lead forms. The same constraints run on the client
 * (react-hook-form, with translated messages) and on the server (security
 * boundary, with default messages). Pass a translated message map on the client.
 */
export type LeadMessages = {
  nameMin: string;
  emailInvalid: string;
  messageMin: string;
  required: string;
};

const defaultMessages: LeadMessages = {
  nameMin: "Name must be at least 2 characters.",
  emailInvalid: "Enter a valid email.",
  messageMin: "Message must be at least 10 characters.",
  required: "This field is required.",
};

/** Optional free-text field that may arrive as an empty string. */
const optionalText = z.string().trim().max(200).optional().or(z.literal(""));

/** Honeypot: hidden from humans; bots tend to fill it → dropped server-side. */
const honeypot = z.string().max(200).optional();

/** Client-captured first-touch attribution (all optional, capped in length). */
const attributionShape = {
  referrer: optionalText,
  landingPage: optionalText,
  utmSource: optionalText,
  utmMedium: optionalText,
  utmCampaign: optionalText,
};

export function contactSchema(m: LeadMessages = defaultMessages) {
  return z.object({
    name: z.string().trim().min(2, m.nameMin).max(120),
    email: z.string().trim().email(m.emailInvalid).max(200),
    phone: optionalText,
    company: optionalText,
    message: z.string().trim().min(10, m.messageMin).max(2000),
    hp: honeypot,
    ...attributionShape,
  });
}

export type ContactInput = z.infer<ReturnType<typeof contactSchema>>;
