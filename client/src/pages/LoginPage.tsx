import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Headset, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ErrorBanner } from "../components/ui/ErrorState";
import { PasswordInput } from "../components/ui/PasswordInput";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
            <Headset size={18} />
          </div>
          <span className="text-base font-semibold text-text">Support AI</span>
        </Link>

        <h1 className="mb-1 text-xl font-semibold text-text">Welcome back</h1>
        <p className="mb-6 text-sm text-muted">Sign in to your support account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">Password</label>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create account
          </Link>
        </p>

        <div className="mt-6 rounded-md bg-surface-alt p-3 text-xs text-muted">
          <p className="font-medium text-text">Demo credentials</p>
          <p>customer@example.com / Password123!</p>
          <p>support@example.com / Password123!</p>
        </div>
      </div>
    </div>
  );
}
