import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, AuthError } from "../../shared/storage/authStore";

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && email.trim().length > 0 && password.length > 0 && !isSubmitting;
  }, [name, email, password, isSubmitting]);

  return (
    <div className="page">
      <div className="panel">
        <div className="page__header">
          <div>
            <h1 className="page__title">Create account</h1>
            <p className="page__subtitle">
              Sign up to start monitoring your stores.
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
              register(email, password, name);

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
            <span>Name</span>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
              }}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </label>

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
              placeholder="min 6 characters"
              required
              autoComplete="new-password"
            />
          </label>

          {error && (
            <div className="form__error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="button button--primary" disabled={!canSubmit}>
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
