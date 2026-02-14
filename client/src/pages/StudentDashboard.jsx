import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, m, a] = await Promise.all([
          api.get("/student/me/performance"),
          api.get("/student/me/marks"),
          api.get("/student/me/attendance")
        ]);
        setPerformance(p.data);
        setMarks(m.data);
        setAttendance(a.data);
      } catch {
        setPerformance(null);
        setMarks([]);
        setAttendance([]);
      }
    }

    loadData();
  }, []);

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Student Dashboard</h1>
          <p className="muted">{user ? `${user.name} (${user.email})` : "Guest Student"}</p>
        </div>
        {user ? <button onClick={logout}>Logout</button> : null}
      </header>

      {performance ? (
        <section className="stats-grid">
          <article className="card"><h3>Average Marks</h3><p>{performance.averageMarks}%</p></article>
          <article className="card"><h3>Attendance</h3><p>{performance.attendancePercentage}%</p></article>
          <article className="card"><h3>Score</h3><p>{performance.performanceScore}</p></article>
          <article className="card"><h3>Status</h3><p>{performance.performanceLevel}</p></article>
        </section>
      ) : null}

      <section className="two-col">
        <article className="card">
          <h2>Marks</h2>
          <table>
            <thead><tr><th>Subject</th><th>Marks</th><th>%</th></tr></thead>
            <tbody>
              {marks.map((m) => (
                <tr key={m.id}><td>{m.subject_name}</td><td>{m.marks_obtained}/{m.max_marks}</td><td>{m.marks_percentage}</td></tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Attendance</h2>
          <table>
            <thead><tr><th>Subject</th><th>Classes</th><th>%</th></tr></thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}><td>{a.subject_name}</td><td>{a.attended_classes}/{a.total_classes}</td><td>{a.attendance_percentage}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </main>
  );
}

export default StudentDashboard;
