import { useState } from "react";

import { dashboardContent } from "@/data/dashboard";

export function LoginForm() {
  const { login } = dashboardContent;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(res.status === 429 ? login.errorRateLimited : (data.error ?? login.errorInvalid));
    } catch {
      setError(login.errorNetwork);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="dash-scanline bg-card/90 border-border w-full max-w-sm rounded-md border p-8 backdrop-blur-sm"
    >
      <h1 className="dash-glow-number mb-1 text-center font-mono text-lg font-bold tracking-[0.3em]">
        {login.title}
      </h1>
      <p className="text-muted-foreground mb-6 text-center font-mono text-[0.7rem] tracking-widest uppercase">
        {login.prompt}
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        className="bg-background border-input text-foreground focus:border-ring focus:ring-ring/40 w-full rounded border px-3 py-2 text-center font-mono tracking-widest outline-none focus:ring-2"
        aria-label={login.prompt}
      />
      {error && (
        <p
          role="alert"
          className="text-destructive mt-3 text-center font-mono text-xs tracking-widest"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="bg-primary text-primary-foreground hover:bg-accent mt-5 w-full rounded py-2 font-mono text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
      >
        {login.submitLabel}
      </button>
    </form>
  );
}
