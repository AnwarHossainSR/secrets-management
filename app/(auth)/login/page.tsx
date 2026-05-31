"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";

function LoginForm() {
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
    <div className="vk-card rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-lg vk-accent-bg grid place-items-center">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold vk-text">VaultKit</h1>
          <p className="text-sm vk-muted">Sign in to your vault</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm vk-muted">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md px-3 py-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm vk-muted">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md px-3 py-2"
            placeholder="********"
          />
        </label>
        {error && <p className="text-sm" style={{ color: "var(--badge-prod-text)" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full vk-accent-bg rounded-md py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm vk-muted mt-6 text-center">
        No account?{" "}
        <Link href="/register" className="vk-accent hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
