import { Activity } from "lucide-react";

export function ActivityFeedItem({
  action,
  entryTitle,
  timestamp,
}: {
  action: string;
  entryTitle?: string;
  timestamp: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="size-7 rounded-md bg-amber-500/10 grid place-items-center vk-accent shrink-0">
        <Activity className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="capitalize">{action.replaceAll("_", " ")}</span>
          {entryTitle && <span className="text-neutral-400"> ”” {entryTitle}</span>}
        </p>
        <p className="text-xs text-neutral-500">{new Date(timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}
