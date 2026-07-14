import { useState } from "react";

import { dashboardContent } from "@/data/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      setError(res.status === 429 ? login.errorRateLimited : login.errorInvalid);
    } catch {
      setError(login.errorNetwork);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="gap-1">
        <span className="dash-wordmark text-lg">{dashboardContent.console.brand}</span>
        <h1 className="text-foreground text-base font-semibold">{login.title}</h1>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            aria-label={login.prompt}
            placeholder={login.prompt}
          />
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || password.length === 0}>
            {login.submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
