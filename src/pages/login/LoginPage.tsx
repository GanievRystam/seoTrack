import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, AuthError } from "../../shared/storage/authStore";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !isSubmitting;
  }, [email, password, isSubmitting]);

  return (
    <div className="page">
      <div className="panel">
        <div className="page__header">
          <div>
            <h1 className="page__title">Welcome back</h1>
            <p className="page__subtitle">
              Sign in to keep an eye on your SEO and performance alerts.
            </p>
          </div>
        </div>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);

            try {
              setIsSubmitting(true);
              login(email, password);
              navigate("/projects", { replace: true });
            } catch (e) {
              if (e instanceof AuthError) setError(e.message);
              else setError("Something went wrong. Try again.");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className="form__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="form__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(null);
              }}
              placeholder="********"
              required
              autoComplete="current-password"
            />
          </label>

          {error && <div className="form__error" role="alert">{error}</div>}

          <button type="submit" className="button button--primary" disabled={!canSubmit}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <div className="form__hint" style={{ marginTop: 10 }}>
            <Link to='/register'> Зарегестрироваться</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
