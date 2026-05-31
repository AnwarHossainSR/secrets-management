import { auth } from "@/lib/auth";
import { SettingsForms } from "./_forms";

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForms userName={session!.user.name ?? ""} userEmail={session!.user.email ?? ""} />
    </div>
  );
}
