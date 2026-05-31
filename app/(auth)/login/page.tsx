"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(from);
    router.refresh();
  };

  return (
    <div className="vk-card rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-lg vk-accent-bg grid place-items-center">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">VaultKit</h1>
          <p className="text-sm text-neutral-400">Sign in to your vault</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-300">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn w-full vk-accent-bg rounded-lg py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing inÃ¢â‚¬Â¦" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-neutral-400 mt-6 text-center">
        No account?{" "}
        <Link href="/register" className="vk-accent hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
