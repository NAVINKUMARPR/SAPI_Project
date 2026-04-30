import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roles = [
  {
    value: "admin",
    label: "Admin Access",
    buttonLabel: "Login as Admin",
    description: "Manage system, users, and overall analytics.",
    statTone: "blue"
  },
  {
    value: "faculty",
    label: "Faculty Access",
    buttonLabel: "Login as Faculty",
    description: "Manage classes, marks, and student performance.",
    statTone: "green"
  },
  {
    value: "student",
    label: "Student Access",
    buttonLabel: "Login as Student",
    description: "View your performance, attendance and insights.",
    statTone: "violet"
  }
];

const performanceMetrics = [
  { key: "marks", label: "Marks", value: 86, detail: "Average internal score" },
  { key: "attendance", label: "Attendance", value: 63, detail: "Weekly attendance trend" },
  { key: "trend", label: "Trend", value: 78, detail: "Performance improvement rate" },
  { key: "engagement", label: "Engagement", value: 100, detail: "Classroom participation score" }
];

const statCards = [
  { tone: "blue", value: "500+", label: "Students Managed", detail: "Across all departments" },
  { tone: "green", value: "98%", label: "Data Accuracy", detail: "Reliable & verified data" },
  { tone: "violet", value: "24/7", label: "Secure Access", detail: "Role-based protection" },
  { tone: "amber", value: "Real-Time", label: "Performance Tracking", detail: "Live insights & reports" }
];

const featureCards = [
  {
    title: "Real-Time Performance Tracking",
    description: "Monitor marks, attendance, and classroom activity with live academic updates.",
    details: [
      "Track marks and attendance in one place.",
      "View recent academic updates instantly.",
      "Reduce delays in identifying performance issues."
    ]
  },
  {
    title: "Smart Performance Analysis",
    description: "Turn raw academic data into practical insights for quick academic decisions.",
    details: [
      "Convert raw records into simple summaries.",
      "Support faculty decisions with readable insights.",
      "Help students understand their current position quickly."
    ]
  },
  {
    title: "Trend Detection",
    description: "Identify whether student performance is improving, declining, or staying stable over time.",
    details: [
      "Spot improving and declining academic patterns.",
      "Measure consistency over time.",
      "Catch risks before results become serious."
    ]
  },
  {
    title: "Subject-Wise Insights",
    description: "Highlight subject strengths and weaknesses to support focused improvement.",
    details: [
      "Compare performance across subjects.",
      "Show strong and weak academic areas clearly.",
      "Guide focused preparation and support."
    ]
  },
  {
    title: "Secure Role-Based Access",
    description: "Provide controlled access for Admin, Faculty, and Student users with protected authentication.",
    details: [
      "Keep dashboards personalized by role.",
      "Protect academic data with login control.",
      "Limit actions based on user responsibilities."
    ]
  },
  {
    title: "Multi-User Dashboards",
    description: "Deliver personalized dashboards tailored to each role and academic responsibility.",
    details: [
      "Give admins, faculty, and students a relevant view.",
      "Reduce clutter by showing only useful information.",
      "Improve usability for every user type."
    ]
  },
  {
    title: "Alerts and Notifications",
    description: "Notify users about low attendance, poor performance, and other academic risks.",
    details: [
      "Send alerts for low attendance and weak performance.",
      "Help users act early instead of reacting late.",
      "Support regular academic follow-up."
    ]
  },
  {
    title: "Ranking System",
    description: "Compare student achievements with clear rankings and academic standing insights.",
    details: [
      "Compare academic performance fairly.",
      "Show progress and standing in context.",
      "Encourage healthy motivation and improvement."
    ]
  }
];

const averageClassPerformance = 86;

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4Zm2 9.75A1.75 1.75 0 1 1 13.75 15 1.75 1.75 0 0 1 12 16.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconEye({ off = false }) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="m3.27 2 18.73 18.73-1.27 1.27-3.08-3.08A12.9 12.9 0 0 1 12 20C6.8 20 2.55 16.89 1 12c.67-2.12 1.98-4.01 3.73-5.5L2 3.27Zm8.17 8.17 2.39 2.39A2.99 2.99 0 0 0 11.44 10.17ZM12 6c5.2 0 9.45 3.11 11 8a12.66 12.66 0 0 1-3.92 5.55l-1.43-1.43A10.74 10.74 0 0 0 20.88 14C19.53 10.41 16.05 8 12 8c-.92 0-1.81.12-2.66.35L7.68 6.69A13.06 13.06 0 0 1 12 6Zm-5.07 3.76 1.48 1.48a3.95 3.95 0 0 0 4.35 4.35l1.48 1.48c-.71.29-1.46.43-2.24.43a6 6 0 0 1-6-6c0-.78.14-1.53.43-2.24Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5c5.23 0 9.61 3.36 11 8-1.39 4.64-5.77 8-11 8S2.39 17.64 1 13c1.39-4.64 5.77-8 11-8Zm0 2C7.97 7 4.52 9.52 3.13 13 4.52 16.48 7.97 19 12 19s7.48-2.52 8.87-6C19.48 9.52 16.03 7 12 7Zm0 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCap() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4 2 9l10 5 8-4v6h2V9Zm-6 8.2V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-3.8l-6 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.31A8 8 0 0 1 8.69 4 8.02 8.02 0 1 0 20 15.31Z" fill="currentColor" />
    </svg>
  );
}

function IconLogin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 17v-2h6V9h-6V7h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2Zm-5-1v-2h6v2Zm0-6V8h6v2Zm0 3v-2h10v2Z"
        fill="currentColor"
      />
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

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 11a3 3 0 1 0-2.99-3A3 3 0 0 0 16 11Zm-8 0A3 3 0 1 0 5 8a3 3 0 0 0 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05A5.58 5.58 0 0 1 18 16.5V19h5v-2.5c0-2.33-4.67-3.5-7-3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconGraph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 3h2v18H5Zm6 8h2v10h-2Zm6-5h2v15h-2Zm-9 9 4-4 3 3 5-7 1.6 1.2L15.2 17l-3-3-2.8 2.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5Zm-1 14-4-4 1.41-1.41L11 13.17l4.59-4.58L17 10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm1 11.41 3.29 3.3-1.41 1.41L11 13V6h2ZM12 4a8 8 0 1 1-8 8 8 8 0 0 1 8-8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function StatIcon({ tone }) {
  if (tone === "green") return <IconGraph />;
  if (tone === "violet") return <IconShield />;
  if (tone === "amber") return <IconClock />;
  return <IconUsers />;
}

function RoleIcon({ role }) {
  if (role === "faculty") return <IconUsers />;
  if (role === "student") return <IconCap />;
  return <IconShield />;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const identifierInputRef = useRef(null);
  const featuresSectionRef = useRef(null);
  const workspaceSectionRef = useRef(null);
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const [activeNav, setActiveNav] = useState("home");

  const selectedFeature = featureCards[selectedFeatureIndex];

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
      if (!emailPattern.test(identifier)) return "Enter a valid institutional email address.";
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

  function openLoginModal(role) {
    if (role) {
      setForm((prev) => ({ ...prev, role }));
    }
    setError("");
    setNotice("");
    setIsLoginModalOpen(true);
    window.setTimeout(() => {
      identifierInputRef.current?.focus();
    }, 180);
  }

  function closeLoginModal() {
    if (loading) return;
    setIsLoginModalOpen(false);
  }

  function scrollToSection(section) {
    if (section === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveNav("home");
      return;
    }

    if (section === "features") {
      featuresSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveNav("features");
      return;
    }

    if (section === "about" || section === "contact") {
      workspaceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveNav(section);
    }
  }

  return (
    <main className="landing-shell">
      <div className="landing-frame">
        <header className="landing-nav">
          <div className="brand-lockup">
            <span className="brand-mark">
              <IconCap />
            </span>
            <span className="brand-name">SAPI</span>
          </div>

          <nav className="nav-links" aria-label="Primary navigation">
            <button
              type="button"
              className={activeNav === "home" ? "nav-link active" : "nav-link"}
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>
            <button
              type="button"
              className={activeNav === "features" ? "nav-link active" : "nav-link"}
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>
            <button
              type="button"
              className={activeNav === "about" ? "nav-link active" : "nav-link"}
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
            <button
              type="button"
              className={activeNav === "contact" ? "nav-link active" : "nav-link"}
              onClick={() => scrollToSection("contact")}
            >
              Contact
            </button>
          </nav>

          <div className="nav-actions">
            <button type="button" className="icon-button" aria-label="Theme">
              <IconMoon />
            </button>
            <button type="button" className="ghost-button" onClick={() => openLoginModal()}>
              <IconLogin />
              <span>Login</span>
            </button>
            <button type="button" className="primary-button" onClick={() => openLoginModal()}>
              Get Started
            </button>
          </div>
        </header>

        <section className="hero-grid-layout">
          <section className="hero-copy">
            <p className="section-kicker">Academic Intelligence</p>
            <h1>SAPI</h1>
            <h2>
              Student Academic Performance <span>Intelligence</span> System
            </h2>
            <p className="hero-description">
              Analyze, track and improve student performance with real-time insights and smart analytics.
            </p>

            <div className="hero-actions">
              <button type="button" className="cta-button" onClick={() => openLoginModal()}>
                <span>Access Dashboard</span>
                <IconArrow />
              </button>
              <button type="button" className="secondary-button" onClick={() => openLoginModal(form.role)}>
                <span>Learn More</span>
                <IconLogin />
              </button>
            </div>

            <div className="hero-trust-row">
              <span>Secure</span>
              <span>Reliable</span>
              <span>Smart</span>
            </div>
          </section>

          <section className="hero-chart-card">
            <div className="hero-chart-top">
              <article className="performance-card">
                <div className="performance-copy">
                  <p>Average Class Performance</p>
                  <strong>{averageClassPerformance}%</strong>
                <span>↑ 8% this month</span>
                </div>
                <div className="performance-ring" aria-hidden="true">
                  <div className="performance-ring-center">
                    <IconGraph />
                  </div>
                </div>
              </article>

              <button type="button" className="period-button">
                <span>This Month</span>
                <span className="period-caret">⌄</span>
              </button>
            </div>

            <div className="chart-zone">
              <div className="chart-axis">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <div className="chart-plot">
                <div className="chart-bars">
                  {performanceMetrics.map((metric) => (
                    <button
                      key={metric.key}
                      type="button"
                      className="metric-column"
                      onMouseEnter={() => setActiveMetric(metric.key)}
                      onMouseLeave={() => setActiveMetric(null)}
                      onFocus={() => setActiveMetric(metric.key)}
                      onBlur={() => setActiveMetric(null)}
                    >
                      <span className="metric-tooltip">
                        <strong>{metric.label}</strong>
                        <span>{metric.value}%</span>
                        <span>{metric.detail}</span>
                      </span>
                      <span className="metric-bar" style={{ height: `${metric.value}%` }} />
                      <span className="metric-label">{metric.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-footer">
              <span className="live-dot" />
              <span>Real-time data updated just now</span>
            </div>
          </section>
        </section>

        <section className="stat-strip">
          {statCards.map((card) => (
            <article key={card.label} className="stat-tile">
              <span className={`stat-icon ${card.tone}`}>
                <StatIcon tone={card.tone} />
              </span>
              <div className="stat-copy">
                <strong>{card.value}</strong>
                <p>{card.label}</p>
                <span>{card.detail}</span>
              </div>
            </article>
          ))}
        </section>

        <section ref={featuresSectionRef} className="features-panel">
          <div className="features-head">
            <p className="section-kicker">Core Features</p>
            <h3>Built for Practical Academic Monitoring</h3>
            <p>
              The Student Academic Performance Intelligence System combines tracking, analysis,
              alerts, and secure access into one academic workflow.
            </p>
          </div>

          <div className="features-slide">
            <div className="feature-grid">
              {featureCards.map((feature, index) => (
              <button
                key={feature.title}
                type="button"
                className={selectedFeatureIndex === index ? "feature-card active" : "feature-card"}
                onClick={() => setSelectedFeatureIndex(index)}
              >
                <span className="feature-accent" aria-hidden="true" />
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </button>
            ))}
            </div>

            <aside className="feature-detail-card">
              <p className="feature-detail-kicker">Feature Detail</p>
              <h4>{selectedFeature.title}</h4>
              <p>{selectedFeature.description}</p>
              <div className="feature-detail-points">
                {selectedFeature.details.map((detail) => (
                  <span key={detail}>{detail}</span>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section ref={workspaceSectionRef} className="workspace-panel">
          <div className="workspace-head">
            <h3>Access Your Workspace</h3>
            <p>Choose your role to continue</p>
          </div>

          <div className="role-card-grid">
            {roles.map((role) => (
              <article key={role.value} className={`role-access-card ${role.statTone}`}>
                <span className={`role-access-icon ${role.statTone}`}>
                  <RoleIcon role={role.value} />
                </span>
                <h4>{role.label}</h4>
                <p>{role.description}</p>
                <button type="button" className={`role-access-button ${role.statTone}`} onClick={() => openLoginModal(role.value)}>
                  <span>{role.buttonLabel}</span>
                  <IconArrow />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      {isLoginModalOpen ? (
        <div className="login-modal-backdrop" onClick={closeLoginModal}>
          <section
            className="login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="login-modal-head">
              <div className="signin-copy">
                <p className="section-kicker">Secure Access</p>
                <h3 id="login-modal-title">Login to Dashboard</h3>
                <p>Role-based authentication with protected access for admin, faculty, and student portals.</p>
              </div>
              <button type="button" className="modal-close" onClick={closeLoginModal} aria-label="Close login">
                ×
              </button>
            </div>

            <div className="signin-role-pills" aria-label="Choose role">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={form.role === role.value ? "signin-role-pill active" : "signin-role-pill"}
                  onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                >
                  {role.value === "admin" ? "Admin" : role.value === "faculty" ? "Faculty" : "Student"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="signin-form">
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
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>Remember Me</span>
                </label>
                <a href="/" className="forgot-link" onClick={handleForgotPassword}>
                  Forgot Password?
                </a>
              </div>

              {error ? <p className="message-box error-box" role="alert">{error}</p> : null}
              {notice ? <p className="message-box info-box">{notice}</p> : null}

              <button type="submit" className="signin-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <IconArrow />
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default LoginPage;
