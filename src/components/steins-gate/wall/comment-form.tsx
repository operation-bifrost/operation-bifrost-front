import { useCallback, useState } from "react";

import { TurnstileWidget } from "@/components/steins-gate/wall/turnstile-widget";
import { steinsGateContent } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const { form, success, errors, limits } = steinsGateContent.wall;

interface CommentFormProps {
  siteKey: string;
  onSubmitted: () => void;
}

export function CommentForm({ siteKey, onSubmitted }: CommentFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");

  const handleToken = useCallback((t: string | null) => setToken(t), []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setErrorText(errors.captcha);
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/steins-gate/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, turnstileToken: token }),
      });
      if (res.status === 202) {
        setStatus("success");
        setName("");
        setMessage("");
        onSubmitted();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setErrorText(data.error ?? errors.generic);
    } catch {
      setStatus("error");
      setErrorText(errors.generic);
    }
  };

  if (status === "success") {
    return (
      <div className="border-primary/40 bg-primary/5 border p-6 text-center" role="status">
        <p className="text-primary mb-1 font-semibold">{success.title}</p>
        <p className="text-muted-foreground text-sm">{success.body}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <textarea
        value={message}
        maxLength={limits.maxMessage}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={form.messagePlaceholder}
        aria-label={form.messagePlaceholder}
        rows={3}
        required
        className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring resize-none border px-3 py-2 outline-none focus-visible:ring-2"
      />
      <input
        type="text"
        value={name}
        maxLength={limits.maxName}
        onChange={(e) => setName(e.target.value)}
        placeholder={form.namePlaceholder}
        aria-label={form.namePlaceholder}
        className="border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring border px-3 py-2 outline-none focus-visible:ring-2"
      />

      <TurnstileWidget siteKey={siteKey} onToken={handleToken} />

      {status === "error" ? <p className="text-destructive text-sm">{errorText}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(
          "bg-primary text-primary-foreground hover:bg-accent cursor-pointer px-5 py-2.5 font-semibold transition-colors disabled:opacity-60",
        )}
      >
        {status === "submitting" ? form.submittingLabel : form.submitLabel}
      </button>
    </form>
  );
}
