# Library Management System — Setup Guide

This guide explains how to set up and run the Library Management System on your device using the project files and the SQL database dump provided to you.

## Project overview

- **Backend:** Spring Boot (Java) REST API (`backend/`)
- **Frontend:** React + Vite web app (`frontend/`)
- **Database:** MariaDB/MySQL (`library_management_system`)

The frontend runs at `http://localhost:5173` and talks to the backend at `http://localhost:8080/api/v1`.

## 1. Prerequisites

Install the following before you start:

| Software | Recommended version | Notes |
|---|---|---|
| Java JDK | **21** | Required by the backend (`java.version=21`). Verify with `java -version`. |
| MariaDB or MySQL | MariaDB 10.6+ recommended | XAMPP/MySQL also works. The app validates the schema on startup. |
| Node.js | 24.x (or a recent LTS) | Used to run/build the frontend. |
| npm | 11.x (bundled with Node) | On Windows PowerShell, `npm.ps1` may be blocked; use `npm.cmd` or `cmd /c npm ...`. |

The backend includes the Maven Wrapper (`mvnw` / `mvnw.cmd`), so you do **not** need a separate Maven installation.

## 2. Database setup

The backend expects a database named **`library_management_system`** and validates the schema on startup (`spring.jpa.hibernate.ddl-auto=validate`), so the database schema/data must be in place before running the backend.

### 2.1 Create the database

Create an empty database (if your dump does not create it):

```sql
CREATE DATABASE IF NOT EXISTS library_management_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

### 2.2 Import the provided SQL dump

Import the `.sql` dump file provided with this project into the `library_management_system` database.

**phpMyAdmin (XAMPP):**
1. Start Apache and MySQL in XAMPP.
2. Open phpMyAdmin, select/create `library_management_system`.
3. Go to **Import**, choose the provided `.sql` file, and run the import.

**MySQL/MariaDB command line:**

```bash
mysql -u root -p library_management_system < path/to/provided-dump.sql
```

(Adjust the username/host/port as needed for your setup.)

> **Note:** If you receive a full database dump, it should already contain all required tables and data (including `borrow_requests`). The repository also includes an additive migration at `backend/src/main/resources/db/borrow_requests.sql` for environments where that table is missing.

### 2.3 Backend database connection

Default connection settings are in `backend/src/main/resources/application.properties`:

- URL: `jdbc:mariadb://localhost:3306/library_management_system`
- Username: `root`
- Password: *(empty)*

If your local database credentials differ, update those values in `application.properties` before starting the backend.

## 3. Backend setup

1. Open a terminal in the `backend` folder:

   ```bash
   cd backend
   ```

2. Set a persistent `JWT_SECRET` environment variable (recommended).  
   The app can generate a random key if unset, but tokens will become invalid every time the backend restarts. Use a Base64-encoded key of at least 32 bytes.

   **Windows PowerShell (current session):**
   ```powershell
   $env:JWT_SECRET = "<your-base64-secret>"
   ```

   **Windows (persist for your user):**
   ```powershell
   [Environment]::SetEnvironmentVariable("JWT_SECRET", "<your-base64-secret>", "User")
   ```
   (Open a new terminal after setting a user environment variable.)

   **macOS/Linux:**
   ```bash
   export JWT_SECRET="<your-base64-secret>"
   ```

3. Start the backend:

   **Windows:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   **macOS/Linux:**
   ```bash
   ./mvnw spring-boot:run
   ```

4. When started successfully, the API is available at `http://localhost:8080/api/v1`.

> The first run may take a while while Maven downloads dependencies.

## 4. Frontend setup

1. Open a new terminal in the `frontend` folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```
   (On Windows PowerShell use `npm.cmd install` if `npm` is blocked.)

3. (Optional) Configure the API URL. Copy `.env.example` to `.env` if you need to change it:

   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```
   (Windows PowerShell: `npm.cmd run dev`)

5. Open the app at `http://localhost:5173`.

### Production build (optional)

```bash
npm run build
npm run preview
```

## 5. Signing in

If you imported the provided database dump, use the accounts included in that data to sign in. (Change passwords after first login if these are shared/test credentials.)

Common QA/test accounts that may be present in the provided dump:

| Role | Username | Password |
|---|---|---|
| Admin | `qa_admin` | `QaAdmin!2026` |
| Librarian | `qa_librarian` | `QaLib!2026` |
| Member | `qa_member` | `QaMember!2026` |

> There is no public registration. Member/staff accounts are created by authorized users in the application (or via the database where appropriate).

## 6. Useful notes

- **Schema validation:** The backend uses `ddl-auto=validate` and will fail to start if the database schema does not match the application entities. Importing the provided dump is the easiest way to ensure compatibility.
- **Borrow requests & fines:** Members can request books by title; librarians approve/reject requests and set a return (due) date. Overdue fines accrue automatically once per day (total-to-date, after the configured grace period) while a loan is borrowed and are finalized on return.
- **CORS:** By default the backend allows `http://localhost:5173`. Override with the `CORS_ORIGIN` environment variable if needed.
- **Ports:** Backend uses `8080`, frontend dev server uses `5173`. Stop other services using these ports or adjust the configuration.

## 7. Troubleshooting

- **Backend fails on startup with schema/validation errors:** Ensure you imported the correct SQL dump into `library_management_system` and that your MariaDB/MySQL version is compatible.
- **Database connection refused/auth errors:** Verify MariaDB/MySQL is running and that the URL/username/password in `backend/src/main/resources/application.properties` match your local setup.
- **Logged out after every backend restart:** `JWT_SECRET` is not set; set a persistent `JWT_SECRET` as shown above.
- **Frontend cannot reach the API / CORS issues:** Confirm the backend is running on port 8080 and `VITE_API_BASE_URL` in `frontend/.env` matches it.
- **PowerShell blocks `npm`:** Use `npm.cmd` or run commands via `cmd /c npm ...`.

## 8. Running tests (optional)

**Backend** (from `backend/`, requires the database):

```powershell
.\mvnw.cmd clean test
```

**Frontend** (from `frontend/`):

```powershell
npm.cmd test
```
