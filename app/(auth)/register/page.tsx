"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, ShieldOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((j) => setAllowed(!!j.allowRegistration))
      .catch(() => setAllowed(true));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to register");
      setLoading(false);
      return;
    }
    const login = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (login?.error) {
      setError("Registered, but auto-login failed. Try login.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  if (allowed === false) {
    return (
      <div className="vk-card rounded-2xl p-8 text-center">
        <div
          className="size-12 rounded-lg mx-auto grid place-items-center mb-4"
          style={{ background: "var(--badge-prod-bg)", color: "var(--badge-prod-text)" }}
        >
          <ShieldOff className="size-6" />
        </div>
        <h1 className="text-xl font-semibold vk-text">Registration is disabled</h1>
        <p className="text-sm vk-muted mt-2">
          The administrator has turned off new sign-ups. Contact your workspace admin for access.
        </p>
        <Link
          href="/login"
          className="inline-block mt-5 vk-accent-bg rounded-md px-4 py-2 text-sm font-medium"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="vk-card rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-lg vk-accent-bg grid place-items-center">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold vk-text">Create your vault</h1>
          <p className="text-sm vk-muted">Start managing secrets</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm vk-muted">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm vk-muted">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm vk-muted">Password (min 8)</span>
          <input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md px-3 py-2"
          />
        </label>
        {error && (
          <p className="text-sm" style={{ color: "var(--badge-prod-text)" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || allowed === null}
          className="w-full vk-accent-bg rounded-md py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="text-sm vk-muted mt-6 text-center">
        Have an account?{" "}
        <Link href="/login" className="vk-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
