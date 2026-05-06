# ⚡ TaskForge — Team Task Manager

A production-ready, full-stack team task management application with role-based access control, JWT authentication, and a Kanban-style task board.

---

## 🚀 Live URL
> **[https://your-app.up.railway.app](https://your-app.up.railway.app)**  
> *(Replace with your Railway deployment URL after deploying)*

---

## 📸 Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-based Signup/Login with role selection |
| 👥 RBAC | Admin (create/edit/delete projects) & Member (view/update tasks) |
| 📁 Projects | Create, edit, delete projects with team members |
| ✅ Tasks | Kanban board (TO_DO → IN_PROGRESS → DONE), priorities, due dates, assignees |
| 📊 Dashboard | Real-time stats: total projects, tasks by status, overdue count |
| 🔔 My Tasks | Personal task view with status filter |

---

## 🛠 Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** with JWT (JJWT 0.11.5)
- **Spring Data JPA** + **Hibernate**
- **MySQL 8.0**
- **Lombok** + **Hibernate Validator**

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS v4**
- **Axios** (API client with JWT interceptor)
- **React Router DOM v6**
- **Lucide React** (icons)
- **React Hot Toast** (notifications)

### Infrastructure
- **Docker** + **Docker Compose** (local)
- **Railway** (deployment)

---

## 📂 Project Structure

```
team-task-manager/
├── backend/              # Spring Boot API
│   ├── src/main/java/com/teamtask/app/
│   │   ├── config/       # Security, CORS, exception handler
│   │   ├── controller/   # REST endpoints
│   │   ├── dto/          # Request/Response DTOs
│   │   ├── entity/       # JPA entities
│   │   ├── repository/   # Spring Data repositories
│   │   ├── security/     # JWT filter & utility
│   │   └── service/      # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend/             # React/Vite SPA
│   ├── src/
│   │   ├── components/   # Sidebar, ProtectedRoute
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Login, Signup, Dashboard, Projects, TaskBoard, MyTasks
│   │   └── api.js        # Axios API client
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── docker-compose.yml
├── README.md
├── RUN.md
└── DEPLOY.md
```

## 🏗️ PROJECT ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)           │
│  Port 5173                                          │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐          │
│  │ Login/   │ │ Dashboard │ │ Projects/  │          │
│  │ Signup   │ │   Page    │ │ TaskBoard  │          │
│  └────┬─────┘ └─────┬─────┘ └─────┬──────┘          │
│       │             │             │                  │
│       └──────┬──────┴─────────────┘                  │
│              │  Axios + JWT Token                    │
│              ▼                                       │
│     ┌──────────────────┐                             │
│     │   api.js (Axios) │  ← Attaches Bearer token   │
│     └────────┬─────────┘    to every request         │
└──────────────┼───────────────────────────────────────┘
               │  HTTP REST calls (/api/*)
               ▼
┌──────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot 3.2)               │
│  Port 8080                                           │
│                                                      │
│  ┌──────────────────┐   ┌──────────────────────┐     │
│  │  AuthController  │   │  SecurityConfig      │     │
│  │  POST /api/auth/ │   │  + JwtAuthFilter     │     │
│  │  login, signup   │   │  + BCrypt Passwords  │     │
│  └────────┬─────────┘   └──────────┬───────────┘     │
│           │                        │                 │
│  ┌────────▼─────────┐   ┌─────────▼────────────┐    │
│  │ ProjectController│   │   TaskController     │    │
│  │ CRUD /api/projects│   │ CRUD /api/tasks      │    │
│  │ (ADMIN only)     │   │ + dashboard stats    │    │
│  └────────┬─────────┘   └─────────┬────────────┘    │
│           │                        │                 │
│  ┌────────▼────────────────────────▼────────────┐    │
│  │          Service Layer (Business Logic)      │    │
│  │  ProjectService    TaskService    AuthService │    │
│  └────────────────────┬─────────────────────────┘    │
│                       │                              │
│  ┌────────────────────▼─────────────────────────┐    │
│  │          Repository Layer (Spring Data JPA)  │    │
│  │  UserRepository  ProjectRepository  TaskRepo │    │
│  └────────────────────┬─────────────────────────┘    │
│                       │                              │
│  ┌────────────────────▼─────────────────────────┐    │
│  │            Database (H2 / MySQL)             │    │
│  │  Tables: users, projects, tasks,             │    │
│  │          project_members (join table)         │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE DESIGN (Entity Relationships)

```
┌──────────────┐        ┌────────────────────┐        ┌──────────────┐
│    USERS     │        │  PROJECT_MEMBERS   │        │   PROJECTS   │
├──────────────┤        │   (Join Table)     │        ├──────────────┤
│ id (PK)      │◄──────┐├────────────────────┤┌──────►│ id (PK)      │
│ email (UQ)   │       ││ user_id (FK)       ││       │ name         │
│ full_name    │       ││ project_id (FK)    ││       │ description  │
│ password     │       │└────────────────────┘│       │ created_by   │──► users.id
│ role (ENUM)  │       │                      │       │ created_at   │
│  ADMIN/MEMBER│       │                      │       │ updated_at   │
└──────┬───────┘       │                      │       └──────┬───────┘
       │               │                      │              │
       │               │                      │              │
       │    ┌──────────┴──────────────────────┴──┐           │
       │    │            TASKS                    │           │
       │    ├─────────────────────────────────────┤           │
       └───►│ id (PK)                             │◄──────────┘
            │ title                               │
            │ description                         │
            │ status (TO_DO/IN_PROGRESS/DONE)     │
            │ priority (LOW/MEDIUM/HIGH)          │
            │ due_date                            │
            │ project_id (FK) ──────► projects.id │
            │ assignee_id (FK) ─────► users.id    │
            │ created_by (FK) ──────► users.id    │
            │ created_at                          │
            │ updated_at                          │
            └─────────────────────────────────────┘
```

---

---

## 📡 API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/projects` | Any | List accessible projects |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/{id}` | Admin | Update project |
| DELETE | `/api/projects/{id}` | Admin | Delete project |
| GET | `/api/tasks/project/{id}` | Any | Tasks for project |
| POST | `/api/tasks` | Any | Create task |
| PUT | `/api/tasks/{id}` | Any | Update task |
| PATCH | `/api/tasks/{id}/status` | Any | Update task status |
| GET | `/api/tasks/my` | Any | My assigned tasks |
| GET | `/api/tasks/dashboard` | Any | Dashboard stats |
| GET | `/api/users` | Any | List all users |

---

## 📝 License
Azam Pasha
