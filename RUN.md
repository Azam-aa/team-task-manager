# 🏃 Running Locally

## Prerequisites
- Java 17+ and Maven 3.8+
- Node.js 20+ and npm
- MySQL 8.0 running locally (or use Docker)

---

## Option A: Run with Docker Compose (Recommended)

```bash
# From the project root
docker compose up --build
```

- Frontend: http://localhost:80
- Backend: http://localhost:8080

---

## Option B: Manual Run

### 1. Start MySQL
Ensure MySQL is running on port 3306 with database `teamtaskdb`.

```sql
CREATE DATABASE IF NOT EXISTS teamtaskdb;
```

### 2. Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend will start on **http://localhost:8080**.  
The database schema is auto-created via `spring.jpa.hibernate.ddl-auto=update`.

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on **http://localhost:5173**.

---

## Default Credentials
There are no seeded users — register at `/signup`.  
Select **Admin** role to create and manage projects.

---

## Environment Variables (Override via `.env` or shell)

| Variable | Default |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/teamtaskdb...` |
| `SPRING_DATASOURCE_USERNAME` | `root` |
| `SPRING_DATASOURCE_PASSWORD` | `root` |
| `JWT_SECRET` | (hex string in application.properties) |
| `VITE_API_URL` | `http://localhost:8080` |
