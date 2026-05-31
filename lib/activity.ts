import { ActivityLog } from "@/models/ActivityLog";
import { Types } from "mongoose";

export async function logActivity(input: {
  userId: string;
  action: string;
  entryId?: string;
  entryTitle?: string;
  clientId?: string;
}) {
  try {
    await ActivityLog.create({
      user: new Types.ObjectId(input.userId),
      action: input.action,
      entryId: input.entryId ? new Types.ObjectId(input.entryId) : undefined,
      entryTitle: input.entryTitle,
      clientId: input.clientId ? new Types.ObjectId(input.clientId) : undefined,
      timestamp: new Date(),
    });
  } catch {
    // swallow — logging must never break request
  }
}
