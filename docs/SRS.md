# Software Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
This document describes the Student Academic Performance Intelligence System, which helps institutions monitor student performance using marks, attendance, and progress indicators.

### 1.2 Scope
A web-based platform for Students, Faculty, and Admin users to manage and view academic performance using basic formulas.

### 1.3 Definitions, Acronyms, Abbreviations
- SRS: Software Requirements Specification
- Admin: System administrator
- Faculty: Teaching staff
- Student: Learner enrolled in courses

### 1.4 Overview
Covers system description, requirements, workflow, technology stack, and enhancements.

## 2. Overall Description
### 2.1 Product Perspective
Standalone web app integrated with relational database.

### 2.2 Product Functions
- Student registration/login
- Faculty marks and attendance entry
- Automatic performance calculation
- Performance status display
- Admin user management

### 2.3 User Classes
- Admin: Manages users/subjects
- Faculty: Enters marks/attendance and views reports
- Student: Views personal performance

### 2.4 Operating Environment
- Browser: Chrome/Edge
- Server-side application
- PostgreSQL database

### 2.5 Constraints
- Web-based only
- Basic formula-driven analytics
- Simple UI

### 2.6 Assumptions
- Internet access
- Correct data maintained by Admin

## 3. System Requirements
### 3.1 Functional Requirements
Admin Module:
- Add/update/delete students
- Add/manage faculty
- Manage subjects

Faculty Module:
- Secure login
- Enter marks
- Enter attendance
- View reports

Student Module:
- Secure login
- View marks and attendance
- View performance status

Performance Calculation:
- Attendance Percentage = (Attended Classes / Total Classes) * 100
- Overall Score = (Average Marks + Attendance Percentage) / 2
- Levels: Good, Average, Needs Improvement

### 3.2 Non-Functional Requirements
- Usability
- Secure authentication
- Fast response
- Data consistency

## 4. System Workflow
1. User logs in
2. Admin configures users and subjects
3. Faculty enters marks and attendance
4. System calculates performance
5. Student views dashboard
6. Admin monitors usage

## 5. Technology Stack
Frontend:
- React.js
- HTML5/CSS3/JavaScript

Backend:
- Node.js
- Express.js
- REST APIs

Database:
- PostgreSQL

Tools:
- VS Code
- GitHub

## 6. Future Enhancements
- Graphical analytics
- Parent portal
- Email notifications
- Advanced analytics integration

## 7. Conclusion
SAPI is a simple and effective web application for academic performance monitoring, focused on clarity and ease of implementation.
