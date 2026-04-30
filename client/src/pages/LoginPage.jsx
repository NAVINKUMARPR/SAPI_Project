import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roles = [
  {
    value: "admin",
    label: "Admin",
    title: "Admin Access",
    description: "Manage users, subjects, departments, and academic reporting.",
    tone: "blue"
  },
  {
    value: "faculty",
    label: "Faculty",
    title: "Faculty Access",
    description: "Review classes, update marks, and monitor student progress.",
    tone: "green"
  },
  {
    value: "student",
    label: "Student",
    title: "Student Access",
    description: "View marks, attendance, subject insights, and performance trends.",
    tone: "violet"
  }
];

const demoCredentials = {
  admin: { email: "admin@sapi.com", password: "admin123" },
  faculty: { email: "faculty@sapi.com", password: "faculty123" },
  student: { email: "student@sapi.com", password: "student123" }
};

const featureCards = [
  {
    title: "Fast Role Login",
    description: "Choose a role, validate credentials, and move directly into the matching dashboard."
  },
  {
    title: "Academic Insights",
    description: "Bring marks, attendance, and performance trends into one focused workspace."
  },
  {
    title: "Protected Access",
    description: "Keep admin, faculty, and student dashboards separated by authenticated role."
  }
];

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="currentColor" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4Zm2 9.75A1.75 1.75 0 1 1 13.75 15 1.75 1.75 0 0 1 12 16.75Z" fill="currentColor" />
    </svg>
  );
}

function IconEye({ off = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {off ? (
        <path d="m3.27 2 18.73 18.73-1.27 1.27-3.08-3.08A12.9 12.9 0 0 1 12 20C6.8 20 2.55 16.89 1 12c.67-2.12 1.98-4.01 3.73-5.5L2 3.27Zm8.17 8.17 2.39 2.39A2.99 2.99 0 0 0 11.44 10.17ZM12 6c5.2 0 9.45 3.11 11 8a12.66 12.66 0 0 1-3.92 5.55l-1.43-1.43A10.74 10.74 0 0 0 20.88 14C19.53 10.41 16.05 8 12 8c-.92 0-1.81.12-2.66.35L7.68 6.69A13.06 13.06 0 0 1 12 6Zm-5.07 3.76 1.48 1.48a3.95 3.95 0 0 0 4.35 4.35l1.48 1.48c-.71.29-1.46.43-2.24.43a6 6 0 0 1-6-6c0-.78.14-1.53.43-2.24Z" fill="currentColor" />
      ) : (
        <path d="M12 5c5.23 0 9.61 3.36 11 8-1.39 4.64-5.77 8-11 8S2.39 17.64 1 13c1.39-4.64 5.77-8 11-8Zm0 2C7.97 7 4.52 9.52 3.13 13 4.52 16.48 7.97 19 12 19s7.48-2.52 8.87-6C19.48 9.52 16.03 7 12 7Zm0 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" fill="currentColor" />
      )}
    </svg>
  );
}

function IconCap() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4 2 9l10 5 8-4v6h2V9Zm-6 8.2V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-3.8l-6 3Z" fill="currentColor" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h11.17l-4.58 4.59L13 18l7-7-7-7-1.41 1.41L16.17 10H5Z" fill="currentColor" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5Zm-1 14-4-4 1.41-1.41L11 13.17l4.59-4.58L17 10Z" fill="currentColor" />
    </svg>
  );
}

function IconGraph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h2v18H5Zm6 8h2v10h-2Zm6-5h2v15h-2Zm-9 9 4-4 3 3 5-7 1.6 1.2L15.2 17l-3-3-2.8 2.8Z" fill="currentColor" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11a3 3 0 1 0-2.99-3A3 3 0 0 0 16 11Zm-8 0A3 3 0 1 0 5 8a3 3 0 0 0 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05A5.58 5.58 0 0 1 18 16.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5Z" fill="currentColor" />
    </svg>
  );
}

function RoleIcon({ role }) {
  if (role === "faculty") return <IconUsers />;
  if (role === "student") return <IconCap />;
  return <IconShield />;
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const identifierInputRef = useRef(null);
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    role: "student",
    remember: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const selectedRole = roles.find((role) => role.value === form.role) || roles[2];

  function getRequestErrorMessage(err, fallback) {
    const serverMessage = err.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (err.code === "ERR_NETWORK") return "Cannot reach backend API. Start the server on port 5000.";
    if (err.response?.status) return `${fallback} (HTTP ${err.response.status})`;
    return fallback;
  }

  function redirectByRole(user) {
    if (user.role === "admin") navigate("/admin");
    if (user.role === "faculty") navigate("/faculty");
    if (user.role === "student") navigate("/student");
  }

  function validate() {
    const identifier = form.identifier.trim();
    const password = form.password.trim();

    if (!identifier) return "Enter your email or username.";
    if (identifier.includes("@")) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(identifier)) return "Enter a valid email address.";
    }
    if (!password) return "Enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function chooseRole(role) {
    setForm((prev) => ({ ...prev, role }));
    setError("");
    setNotice("");
  }

  function fillDemoCredentials(role) {
    const demo = demoCredentials[role];
    setForm((prev) => ({
      ...prev,
      role,
      identifier: demo.email,
      password: demo.password
    }));
    setError("");
    setNotice(`${role.charAt(0).toUpperCase() + role.slice(1)} demo credentials filled.`);
    window.setTimeout(() => identifierInputRef.current?.focus(), 80);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const user = await login(form.identifier.trim(), form.password, { remember: form.remember });
      if (user.role !== form.role) {
        setError(`This account is registered as ${user.role}. Please select the correct role.`);
        return;
      }
      redirectByRole(user);
    } catch (err) {
      setError(getRequestErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword(event) {
    event.preventDefault();
    setError("");
    setNotice("Password reset is not configured yet. Please contact your institution administrator.");
  }

  function focusLogin(role = form.role) {
    chooseRole(role);
    window.setTimeout(() => identifierInputRef.current?.focus(), 80);
  }

  return (
    <main className="landing-shell efficient-login-shell">
      <div className="landing-frame efficient-login-frame">
        <header className="landing-nav efficient-login-nav">
          <div className="brand-lockup">
            <span className="brand-mark">
              <IconCap />
            </span>
            <span className="brand-name">SAPI</span>
          </div>

          <div className="nav-actions">
            <button type="button" className="ghost-button" onClick={() => focusLogin()}>
              <IconUser />
              <span>Focus Login</span>
            </button>
          </div>
        </header>

        <section className="efficient-login-layout">
          <section className="efficient-login-copy">
            <p className="section-kicker">Academic Intelligence</p>
            <h1>SAPI</h1>
            <h2>Student Academic Performance Intelligence System</h2>
            <p>
              A cleaner login experience for students, faculty, and admins. Pick your role, use your credentials, and open the right dashboard without extra steps.
            </p>

            <div className="login-insight-grid">
              {featureCards.map((feature) => (
                <article key={feature.title} className="login-insight-card">
                  <span>
                    <IconGraph />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="quick-login-panel" aria-labelledby="login-title">
            <div className="login-panel-head">
              <div>
                <p className="section-kicker">Secure Access</p>
                <h2 id="login-title">Login to Dashboard</h2>
                <p>{selectedRole.description}</p>
              </div>
              <span className={`role-access-icon ${selectedRole.tone}`}>
                <RoleIcon role={selectedRole.value} />
              </span>
            </div>

            <div className="signin-role-pills" aria-label="Choose role">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={form.role === role.value ? "signin-role-pill active" : "signin-role-pill"}
                  onClick={() => chooseRole(role.value)}
                  disabled={loading}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="signin-form compact-signin-form">
              <label htmlFor="identifier-input">Email / Username</label>
              <div className="field-shell">
                <span className="field-icon">
                  <IconUser />
                </span>
                <input
                  id="identifier-input"
                  ref={identifierInputRef}
                  name="identifier"
                  type="text"
                  placeholder="Enter your email"
                  value={form.identifier}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <label htmlFor="password-input">Password</label>
              <div className="field-shell">
                <span className="field-icon">
                  <IconLock />
                </span>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <IconEye off={showPassword} />
                </button>
              </div>

              <div className="signin-meta">
                <label className="remember-option">
                  <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} disabled={loading} />
                  <span>Remember me</span>
                </label>
                <a href="/" className="forgot-link" onClick={handleForgotPassword}>
                  Forgot password?
                </a>
              </div>

              {error ? (
                <p className="message-box error-box" role="alert">
                  {error}
                </p>
              ) : null}
              {notice ? <p className="message-box info-box">{notice}</p> : null}

              <button type="submit" className="signin-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login as {selectedRole.label}</span>
                    <IconArrow />
                  </>
                )}
              </button>
            </form>

            <div className="demo-login-strip" aria-label="Demo credentials">
              {roles.map((role) => (
                <button key={role.value} type="button" onClick={() => fillDemoCredentials(role.value)} disabled={loading}>
                  <span>{role.label}</span>
                  <small>{demoCredentials[role.value].email}</small>
                </button>
              ))}
            </div>
          </section>
        </section>

        <section className="workspace-panel efficient-role-panel">
          <div className="workspace-head">
            <h3>Choose Your Workspace</h3>
            <p>Each role opens only the tools it needs.</p>
          </div>

          <div className="role-card-grid">
            {roles.map((role) => (
              <article key={role.value} className={`role-access-card ${role.tone}`}>
                <span className={`role-access-icon ${role.tone}`}>
                  <RoleIcon role={role.value} />
                </span>
                <h4>{role.title}</h4>
                <p>{role.description}</p>
                <button type="button" className={`role-access-button ${role.tone}`} onClick={() => focusLogin(role.value)}>
                  <span>Use {role.label}</span>
                  <IconArrow />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
