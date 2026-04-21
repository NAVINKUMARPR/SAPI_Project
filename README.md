# Student Academic Performance Intelligence System (SAPI)

Full-stack web application for tracking student marks, attendance, and performance status.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt

## Project Structure
- `client` React frontend
- `server` Express API
- `render.yaml` Render backend service config
- `client/vercel.json` Vercel SPA routing config

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

## Local Setup

### Quick Start
Run both the backend and frontend together from the project root:
```bash
npm run dev
```

For mobile testing on the same Wi-Fi network, open the frontend using your computer's local IP address, for example:
```text
http://192.168.1.5:5173
```
The frontend will automatically call the backend on the same host using port `5000`.

### 1. Database
Create a MongoDB database locally or use a hosted MongoDB connection string.

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
For deployment, use `client/.env.production.example` and set `VITE_API_BASE_URL` to your deployed backend URL.

## Deployment

### Railway MongoDB
1. Create a Railway project.
2. Add a MongoDB service or MongoDB template.
3. Copy the connection string and use it as `MONGO_URI`.

### Render Backend
1. Create a Render Web Service from this repo.
2. Set the root directory to `server`.
3. Build command:
```bash
npm install
```
4. Start command:
```bash
npm run start
```
5. Add environment variables:
```env
MONGO_URI=your_railway_mongodb_connection_string
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=1d
```
6. Seed the demo data once:
```bash
cd server
npm install
npm run seed
```

Backend health check:
```text
https://your-render-service.onrender.com/api/health
```

### Vercel Frontend
1. Import this repo into Vercel.
2. Set the root directory to `client`.
3. Build command:
```bash
npm run build
```
4. Output directory:
```text
dist
```
5. Add environment variable:
```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

`client/vercel.json` is included so React Router routes keep working after refresh.

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
- Ensure MongoDB is running before backend startup.
- Role and route protection is enforced using JWT middleware.
