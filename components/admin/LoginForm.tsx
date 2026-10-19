"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { usernameToEmail } from "@/lib/supabase/config";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginEmail = username ? usernameToEmail(username) : "";

  function explainAuthError(message: string) {
    if (message === "Email not confirmed") {
      return `Kontot ${loginEmail} finns, men e-postadressen är inte bekräftad i Supabase.`;
    }
    if (message === "Invalid login credentials") {
      return `Supabase godkände inte ${loginEmail}. Kontrollera att exakt den användaren finns under Authentication → Users och ange sedan användarens nuvarande lösenord.`;
    }
    return `Supabase svarade: ${message}`;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (signInError) {
        setError(explainAuthError(signInError.message));
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label>
        <span>Användarnamn</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
        {loginEmail && (
          <small className="login-email">Intern adress: {loginEmail}</small>
        )}
      </label>
      <label>
        <span>Lösenord</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Loggar in …" : "Logga in"}
      </button>
    </form>
  );
}
