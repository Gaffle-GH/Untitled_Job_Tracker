import { AlertCircle } from "lucide-react";

export function AuthErrorBox({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-4 border-[3px] border-black bg-accent-pink p-3 brutal-shadow-sm"
    >
      <div className="flex gap-3 border-[3px] border-black bg-white p-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-black text-white"
          aria-hidden
        >
          <AlertCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide">{title}</p>
          <p className="mt-1 text-sm font-medium leading-snug">{message}</p>
        </div>
      </div>
    </div>
  );
}

function normalizeLoginError(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid email or password") ||
    lower.includes("invalid email") ||
    lower.includes("invalid password") ||
    lower.includes("unauthorized")
  ) {
    return {
      title: "Couldn't sign in",
      message:
        "That email or password doesn't match our records. Check both and try again, or create an account if you're new here.",
    };
  }
  if (lower.includes("database not configured")) {
    return {
      title: "Server not ready",
      message: "The database isn't set up yet. Run db:migrate and restart the dev server.",
    };
  }
  return {
    title: "Sign in failed",
    message,
  };
}

export function loginCredentialsError() {
  return normalizeLoginError("Invalid email or password");
}

export function loginErrorFromMessage(message: string) {
  return normalizeLoginError(message);
}

export function signupErrorFromMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("409")) {
    return {
      title: "Email already in use",
      message: "An account with this email already exists. Try signing in instead.",
    };
  }
  return {
    title: "Couldn't create account",
    message,
  };
}
