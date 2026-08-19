"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type AuthState } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "A entrar…" : "Entrar"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(login, { ok: false });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="proximo" value={next} />

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          className="input" aria-invalid={!!state.errors?.email}
        />
        {state.errors?.email && (
          <p className="mt-1 text-xs text-red-700">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="label">Palavra-passe</label>
        <input
          id="password" name="password" type="password" required autoComplete="current-password"
          className="input" aria-invalid={!!state.errors?.password}
        />
        {state.errors?.password && (
          <p className="mt-1 text-xs text-red-700">{state.errors.password}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
