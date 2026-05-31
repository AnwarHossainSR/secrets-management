"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="vk-card rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-lg vk-accent-bg grid place-items-center">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Create your vault</h1>
          <p className="text-sm text-neutral-400">Start managing secrets</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-300">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mt-1 w-full bg-[#11141c] border vk-border rounded-lg px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1 w-full bg-[#11141c] border vk-border rounded-lg px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-300">Password (min 8)</span>
          <input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1 w-full bg-[#11141c] border vk-border rounded-lg px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn w-full vk-accent-bg rounded-lg py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-neutral-400 mt-6 text-center">
        Have an account?{" "}
        <Link href="/login" className="vk-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
