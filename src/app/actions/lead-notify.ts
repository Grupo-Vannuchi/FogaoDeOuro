"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGroups, type EvoGroup, type EvoResult } from "@/lib/evolution";
import { notifyLead } from "@/lib/lead-notify";

type Result = { ok: true } | { ok: false; error: string };

export type LeadNotifyConfigView = {
  enabled: boolean;
  instance: string;
  groupId: string;
  groupName: string;
};

async function requireAdmin(): Promise<boolean> {
  return Boolean(await getCurrentUser());
}

/** Read the singleton lead-notification config (defaults when unset). */
export async function getLeadNotifyConfig(): Promise<
  LeadNotifyConfigView | { error: "unauthorized" }
> {
  if (!(await requireAdmin())) return { error: "unauthorized" };
  const c = await prisma.leadNotificationConfig.findFirst();
  return {
    enabled: c?.enabled ?? false,
    instance: c?.instance ?? "",
    groupId: c?.groupId ?? "",
    groupName: c?.groupName ?? "",
  };
}

/** Save the singleton config. Enabling requires an instance + group. */
export async function saveLeadNotifyConfig(
  input: LeadNotifyConfigView,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "unauthorized" };
  const enabled = Boolean(input.enabled);
  const instance = input.instance.trim();
  const groupId = input.groupId.trim();
  const groupName = input.groupName.trim();
  if (enabled && (!instance || !groupId)) {
    return { ok: false, error: "missing_target" };
  }
  const existing = await prisma.leadNotificationConfig.findFirst();
  const data = { enabled, instance, groupId, groupName };
  if (existing) {
    await prisma.leadNotificationConfig.update({ where: { id: existing.id }, data });
  } else {
    await prisma.leadNotificationConfig.create({ data });
  }
  return { ok: true };
}

/** List an instance's WhatsApp groups for the picker. */
export async function listGroupsAction(
  instance: string,
  force = false,
): Promise<EvoResult<EvoGroup[]> | { ok: false; error: "unauthorized" }> {
  if (!(await requireAdmin())) return { ok: false, error: "unauthorized" };
  return fetchGroups(instance, force);
}

/** Manually (re)send a lead to the configured sales group. */
export async function forwardLeadAction(leadId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "unauthorized" };
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { ok: false, error: "not_found" };
  return notifyLead(lead, { manual: true });
}
