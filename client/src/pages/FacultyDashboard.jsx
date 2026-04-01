import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function FacultyDashboard() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [report, setReport] = useState(null);
  const [reportStudentId, setReportStudentId] = useState("");
  const [status, setStatus] = useState("");

  const [markForm, setMarkForm] = useState({ studentId: "", subjectId: "", marksObtained: "", maxMarks: "100", examType: "Internal" });
  const [attendanceForm, setAttendanceForm] = useState({ studentId: "", subjectId: "", attendedClasses: "", totalClasses: "" });

  useEffect(() => {
    async function load() {
      const [studentRes, subjectRes] = await Promise.all([
        api.get("/faculty/students"),
        api.get("/faculty/subjects")
      ]);
      setStudents(studentRes.data);
      setSubjects(subjectRes.data);
    }
    load();
  }, []);

  async function submitMarks(e) {
    e.preventDefault();
    await api.post("/faculty/marks", {
      ...markForm,
      studentId: markForm.studentId,
      subjectId: markForm.subjectId,
      marksObtained: Number(markForm.marksObtained),
      maxMarks: Number(markForm.maxMarks)
    });
    setStatus("Marks saved");
  }

  async function submitAttendance(e) {
    e.preventDefault();
    await api.post("/faculty/attendance", {
      ...attendanceForm,
      studentId: attendanceForm.studentId,
      subjectId: attendanceForm.subjectId,
      attendedClasses: Number(attendanceForm.attendedClasses),
      totalClasses: Number(attendanceForm.totalClasses)
    });
    setStatus("Attendance saved");
  }

  async function loadReport() {
    if (!reportStudentId) return;
    const response = await api.get(`/faculty/reports/${reportStudentId}`);
    setReport(response.data);
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="muted">{user.name} ({user.email})</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      {status ? <p className="ok">{status}</p> : null}

      <section className="two-col">
        <article className="card">
          <h2>Enter Marks</h2>
          <form className="form-grid" onSubmit={submitMarks}>
            <select value={markForm.studentId} onChange={(e) => setMarkForm((p) => ({ ...p, studentId: e.target.value }))} required>
              <option value="">Select Student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={markForm.subjectId} onChange={(e) => setMarkForm((p) => ({ ...p, subjectId: e.target.value }))} required>
              <option value="">Select Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="Marks Obtained" value={markForm.marksObtained} onChange={(e) => setMarkForm((p) => ({ ...p, marksObtained: e.target.value }))} required />
            <input type="number" placeholder="Max Marks" value={markForm.maxMarks} onChange={(e) => setMarkForm((p) => ({ ...p, maxMarks: e.target.value }))} required />
            <input placeholder="Exam Type" value={markForm.examType} onChange={(e) => setMarkForm((p) => ({ ...p, examType: e.target.value }))} />
            <button type="submit">Save Marks</button>
          </form>
        </article>

        <article className="card">
          <h2>Enter Attendance</h2>
          <form className="form-grid" onSubmit={submitAttendance}>
            <select value={attendanceForm.studentId} onChange={(e) => setAttendanceForm((p) => ({ ...p, studentId: e.target.value }))} required>
              <option value="">Select Student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={attendanceForm.subjectId} onChange={(e) => setAttendanceForm((p) => ({ ...p, subjectId: e.target.value }))} required>
              <option value="">Select Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="Attended Classes" value={attendanceForm.attendedClasses} onChange={(e) => setAttendanceForm((p) => ({ ...p, attendedClasses: e.target.value }))} required />
            <input type="number" placeholder="Total Classes" value={attendanceForm.totalClasses} onChange={(e) => setAttendanceForm((p) => ({ ...p, totalClasses: e.target.value }))} required />
            <button type="submit">Save Attendance</button>
          </form>
        </article>
      </section>

      <section className="card">
        <h2>Student Performance Report</h2>
        <div className="row">
          <select value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)}>
            <option value="">Select Student</option>
            {students.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}
          </select>
          <button onClick={loadReport}>Load Report</button>
        </div>

        {report ? (
          <div>
            <p><strong>Student:</strong> {report.student.name}</p>
            <p><strong>Average Marks:</strong> {report.metrics.averageMarks}%</p>
            <p><strong>Attendance:</strong> {report.metrics.attendancePercentage}%</p>
            <p><strong>Performance Score:</strong> {report.metrics.performanceScore}</p>
            <p><strong>Status:</strong> {report.metrics.performanceLevel}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default FacultyDashboard;
