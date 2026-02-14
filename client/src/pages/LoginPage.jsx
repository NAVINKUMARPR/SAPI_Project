import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  { role: "Admin", email: "admin@sapi.com", password: "admin123" },
  { role: "Faculty", email: "faculty@sapi.com", password: "faculty123" },
  { role: "Student", email: "student@sapi.com", password: "student123" }
];

function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    semester: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  function getRequestErrorMessage(err, fallback) {
    const serverMessage = err.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (err.code === "ERR_NETWORK") return "Cannot reach backend API. Start server on port 5000.";
    if (err.response?.status) return `${fallback} (HTTP ${err.response.status})`;
    return fallback;
  }

  function redirectByRole(user) {
    if (user.role === "admin") navigate("/admin");
    if (user.role === "faculty") navigate("/faculty");
    if (user.role === "student") navigate("/student");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      redirectByRole(user);
    } catch (err) {
      setError(getRequestErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const user = await signup({
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        department: signupForm.department.trim(),
        semester: Number(signupForm.semester)
      });

      setStatus("Account created successfully");
      redirectByRole(user);
    } catch (err) {
      setError(getRequestErrorMessage(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  }

  async function loginWithDemoAccount(email, password) {
    setError("");
    setStatus("");
    setLoading(true);
    setForm({ email, password });
    try {
      const user = await login(email, password);
      redirectByRole(user);
    } catch (err) {
      setError(getRequestErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="login-panel login-card auth-card simple-login-card">
        <span className="login-tag">SAPI Portal</span>
        <div className="login-head">
          <h2>Sign in</h2>
          <p className="muted">Use your account credentials</p>
        </div>

        <div className="mode-switch">
          <button
            type="button"
            className={mode === "login" ? "mode-btn active" : "mode-btn"}
            onClick={() => {
              setMode("login");
              setError("");
              setStatus("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "mode-btn active" : "mode-btn"}
            onClick={() => {
              setMode("signup");
              setError("");
              setStatus("");
            }}
          >
            Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              placeholder="name@sapi.com"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />

            <label htmlFor="password-input">Password</label>
            <div className="password-wrap">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                type="button"
                className="text-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error ? <p className="error">{error}</p> : null}
            {status ? <p className="ok">{status}</p> : null}
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="login-form">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Your full name"
              value={signupForm.name}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@sapi.com"
              value={signupForm.email}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />

            <label htmlFor="signup-department">Department</label>
            <input
              id="signup-department"
              type="text"
              placeholder="CSE"
              value={signupForm.department}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, department: e.target.value }))}
              required
            />

            <label htmlFor="signup-semester">Semester</label>
            <input
              id="signup-semester"
              type="number"
              min="1"
              value={signupForm.semester}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, semester: e.target.value }))}
              required
            />

            <label htmlFor="signup-password">Password</label>
            <div className="password-wrap">
              <input
                id="signup-password"
                type={showSignupPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={signupForm.password}
                onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                type="button"
                className="text-btn"
                onClick={() => setShowSignupPassword((prev) => !prev)}
              >
                {showSignupPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type={showSignupPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={signupForm.confirmPassword}
              onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />

            {error ? <p className="error">{error}</p> : null}
            {status ? <p className="ok">{status}</p> : null}
            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {mode === "login" ? (
          <div className="demo-credentials">
            <p className="muted">One-click login</p>
            <div className="demo-actions">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  className="chip-btn"
                  onClick={() => loginWithDemoAccount(account.email, account.password)}
                  disabled={loading}
                >
                  {account.role}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default LoginPage;
