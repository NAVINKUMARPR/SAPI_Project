# Student Academic Performance Intelligence System (SAPI)

Full-stack web application for tracking student marks, attendance, and performance status.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: JWT + bcrypt

## Project Structure
- `client` React frontend
- `server` Express API
- `docs/schema.sql` PostgreSQL schema

## Features
- Role-based login: Admin, Faculty, Student
- Admin module:
  - Add/delete students
  - Add/delete faculty
  - Add/delete subjects
  - View dashboard counts
- Faculty module:
  - Enter marks
  - Enter attendance
  - View student performance report
- Student module:
  - View marks
  - View attendance
  - View computed performance status

## Performance Formula
- Attendance Percentage = `(Attended Classes / Total Classes) * 100`
- Overall Performance Score = `(Average Marks + Attendance Percentage) / 2`
- Levels:
  - `Good` >= 75
  - `Average` >= 50 and < 75
  - `Needs Improvement` < 50

## Setup

### 1. Database
1. Create database:
```sql
CREATE DATABASE sapi_db;
```
2. Run schema from `docs/schema.sql`.

### 2. Backend
1. Open `server/.env.example`, copy to `.env`, and update values.
2. Install dependencies:
```bash
cd server
npm install
```
3. Seed sample users and data:
```bash
npm run seed
```
4. Start API:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend
1. Open `client/.env.example`, copy to `.env`.
2. Install dependencies and run:
```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Demo Credentials
- Admin: `admin@sapi.com` / `admin123`
- Faculty: `faculty@sapi.com` / `faculty123`
- Student: `student@sapi.com` / `student123`

## API Endpoints
- `POST /api/auth/login`
- `GET /api/admin/dashboard`
- `GET|POST|PUT|DELETE /api/admin/students`
- `GET|POST|PUT|DELETE /api/admin/faculty`
- `GET|POST|PUT|DELETE /api/admin/subjects`
- `GET /api/faculty/subjects`
- `POST /api/faculty/marks`
- `POST /api/faculty/attendance`
- `GET /api/faculty/students`
- `GET /api/faculty/reports/:studentId`
- `GET /api/student/me/marks`
- `GET /api/student/me/attendance`
- `GET /api/student/me/performance`

## Notes
- Ensure PostgreSQL is running before backend startup.
- Role and route protection is enforced using JWT middleware.
