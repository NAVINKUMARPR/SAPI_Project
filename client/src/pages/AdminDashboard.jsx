import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState({ totalStudents: 0, totalFaculty: 0, totalSubjects: 0 });
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentForm, setStudentForm] = useState({ rollNo: "", name: "", email: "", department: "", semester: 1, password: "" });
  const [facultyForm, setFacultyForm] = useState({ name: "", email: "", department: "", password: "" });
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", semester: 1, facultyId: "" });

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [d, s, f, sub] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/students"),
        api.get("/admin/faculty"),
        api.get("/admin/subjects")
      ]);
      setDashboard(d.data);
      setStudents(s.data);
      setFaculty(f.data);
      setSubjects(sub.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createStudent(e) {
    e.preventDefault();
    await api.post("/admin/students", studentForm);
    setStudentForm({ rollNo: "", name: "", email: "", department: "", semester: 1, password: "" });
    await loadAll();
  }

  async function createFaculty(e) {
    e.preventDefault();
    await api.post("/admin/faculty", facultyForm);
    setFacultyForm({ name: "", email: "", department: "", password: "" });
    await loadAll();
  }

  async function createSubject(e) {
    e.preventDefault();
    await api.post("/admin/subjects", {
      ...subjectForm,
      facultyId: subjectForm.facultyId ? subjectForm.facultyId : null
    });
    setSubjectForm({ code: "", name: "", semester: 1, facultyId: "" });
    await loadAll();
  }

  async function removeStudent(id) {
    await api.delete(`/admin/students/${id}`);
    await loadAll();
  }

  async function removeFaculty(id) {
    await api.delete(`/admin/faculty/${id}`);
    await loadAll();
  }

  async function removeSubject(id) {
    await api.delete(`/admin/subjects/${id}`);
    await loadAll();
  }

  if (loading) {
    return <main className="page"><p>Loading...</p></main>;
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">{user.name} ({user.email})</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="stats-grid">
        <article className="card"><h3>Total Students</h3><p>{dashboard.totalStudents}</p></article>
        <article className="card"><h3>Total Faculty</h3><p>{dashboard.totalFaculty}</p></article>
        <article className="card"><h3>Total Subjects</h3><p>{dashboard.totalSubjects}</p></article>
      </section>

      <section className="three-col">
        <article className="card">
          <h2>Add Student</h2>
          <form className="form-grid" onSubmit={createStudent}>
            <input placeholder="Roll No" value={studentForm.rollNo} onChange={(e) => setStudentForm((p) => ({ ...p, rollNo: e.target.value }))} required />
            <input placeholder="Name" value={studentForm.name} onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))} required />
            <input placeholder="Email" type="email" value={studentForm.email} onChange={(e) => setStudentForm((p) => ({ ...p, email: e.target.value }))} required />
            <input placeholder="Department" value={studentForm.department} onChange={(e) => setStudentForm((p) => ({ ...p, department: e.target.value }))} required />
            <input placeholder="Semester" type="number" min="1" value={studentForm.semester} onChange={(e) => setStudentForm((p) => ({ ...p, semester: Number(e.target.value) }))} required />
            <input placeholder="Password" type="password" value={studentForm.password} onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))} required />
            <button type="submit">Add Student</button>
          </form>
          <table>
            <thead><tr><th>Roll</th><th>Name</th><th>Action</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}><td>{s.roll_no}</td><td>{s.name}</td><td><button onClick={() => removeStudent(s.id)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Add Faculty</h2>
          <form className="form-grid" onSubmit={createFaculty}>
            <input placeholder="Name" value={facultyForm.name} onChange={(e) => setFacultyForm((p) => ({ ...p, name: e.target.value }))} required />
            <input placeholder="Email" type="email" value={facultyForm.email} onChange={(e) => setFacultyForm((p) => ({ ...p, email: e.target.value }))} required />
            <input placeholder="Department" value={facultyForm.department} onChange={(e) => setFacultyForm((p) => ({ ...p, department: e.target.value }))} required />
            <input placeholder="Password" type="password" value={facultyForm.password} onChange={(e) => setFacultyForm((p) => ({ ...p, password: e.target.value }))} required />
            <button type="submit">Add Faculty</button>
          </form>
          <table>
            <thead><tr><th>Name</th><th>Department</th><th>Action</th></tr></thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f.id}><td>{f.name}</td><td>{f.department}</td><td><button onClick={() => removeFaculty(f.id)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Add Subject</h2>
          <form className="form-grid" onSubmit={createSubject}>
            <input placeholder="Code" value={subjectForm.code} onChange={(e) => setSubjectForm((p) => ({ ...p, code: e.target.value }))} required />
            <input placeholder="Name" value={subjectForm.name} onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))} required />
            <input placeholder="Semester" type="number" min="1" value={subjectForm.semester} onChange={(e) => setSubjectForm((p) => ({ ...p, semester: Number(e.target.value) }))} required />
            <select value={subjectForm.facultyId} onChange={(e) => setSubjectForm((p) => ({ ...p, facultyId: e.target.value }))}>
              <option value="">Assign Faculty (Optional)</option>
              {faculty.map((f) => <option value={f.id} key={f.id}>{f.name}</option>)}
            </select>
            <button type="submit">Add Subject</button>
          </form>
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Action</th></tr></thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}><td>{s.code}</td><td>{s.name}</td><td><button onClick={() => removeSubject(s.id)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </main>
  );
}

export default AdminDashboard;
