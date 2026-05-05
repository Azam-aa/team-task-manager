# 🚂 Deploying to Railway

Railway deploys each service separately. You'll create **3 services**: MySQL, Backend, Frontend.

---

## Step 1: Push Code to GitHub

```bash
cd E:\Company\team-task-manager
git init
git add .
git commit -m "Initial commit: Team Task Manager"
git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
git push -u origin main
```

---

## Step 2: Create a Railway Account
Go to [https://railway.app](https://railway.app) and sign in with GitHub.

---

## Step 3: Deploy MySQL Database

1. Click **New Project** → **Deploy a template** → Search "MySQL"
2. Deploy the MySQL plugin.
3. After it starts, click on the MySQL service → **Variables** tab.
4. Copy the `MYSQL_URL` (or note the `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`).

---

## Step 4: Deploy the Backend

1. In the same Railway project, click **+ New** → **GitHub Repo** → select your repo.
2. Set **Root Directory** to `backend`.
3. Railway will auto-detect the Dockerfile.
4. Click on the backend service → **Variables** tab and add:

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://${{MySQL.MYSQL_HOST}}:${{MySQL.MYSQL_PORT}}/${{MySQL.MYSQL_DATABASE}}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `SPRING_DATASOURCE_USERNAME` | `${{MySQL.MYSQL_USER}}` |
| `SPRING_DATASOURCE_PASSWORD` | `${{MySQL.MYSQL_PASSWORD}}` |
| `JWT_SECRET` | `YourSuperSecretKeyAt64HexCharactersMinimumForHS256Algorithm001` |
| `JWT_EXPIRATION` | `86400000` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.up.railway.app` |
| `PORT` | `8080` |

5. Railway will build from the Dockerfile and deploy.
6. Click **Settings** → **Networking** → **Generate Domain** to get the backend URL.

---

## Step 5: Deploy the Frontend

1. Click **+ New** → **GitHub Repo** → same repo.
2. Set **Root Directory** to `frontend`.
3. Add the following **Build Variable** (before build):

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.up.railway.app` |

4. Railway builds via the Dockerfile → nginx serves the SPA.
5. Generate a domain for the frontend too.

---

## Step 6: Update CORS

Go back to the **backend service** → **Variables** and update:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.up.railway.app
```

Then redeploy the backend (click **Deploy** or push a commit).

---

## ✅ Verification Checklist

- [ ] MySQL service is running (green) in Railway
- [ ] Backend `/api/auth/login` returns 200 (test with curl or Postman)
- [ ] Frontend loads the login page
- [ ] Sign up as Admin and create a project
- [ ] Sign up as Member and view the project

---

## 🔐 Required Environment Variables Summary

| Service | Variable | Description |
|---|---|---|
| Backend | `SPRING_DATASOURCE_URL` | Full JDBC MySQL connection string |
| Backend | `SPRING_DATASOURCE_USERNAME` | MySQL username |
| Backend | `SPRING_DATASOURCE_PASSWORD` | MySQL password |
| Backend | `JWT_SECRET` | 64-char hex secret for signing JWTs |
| Backend | `JWT_EXPIRATION` | Token expiry in ms (86400000 = 24h) |
| Backend | `CORS_ALLOWED_ORIGINS` | Frontend Railway domain(s) |
| Frontend | `VITE_API_URL` | Backend Railway URL (https://...) |
