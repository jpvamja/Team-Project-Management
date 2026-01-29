## Team Project Management SaaS

A multi-tenant, role-based project management platform inspired by Asana, Jira, and ClickUp.

---

### 🚀 Tech Stack

- **Frontend:** React (JavaScript)
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Auth:** JWT (Access + Refresh)
- **Architecture:** Module-based (Domain-driven)

---

### 📦 Features

- Multi-workspace support
- Role-based access control (Admin, Team Lead, Member)
- Projects & task management
- Analytics & calendar
- Workspace invitations
- Audit logs
- Secure authentication

---

### 🏗️ Project Structure

```
backend/
frontend/

```

Each feature is implemented as an isolated module.

---

### ⚙️ Setup Instructions

### Backend

```
cd backend
npm install
npm run dev

```

### Frontend

```
cd frontend
npm install
npm run dev

```

---

### 🔐 Environment Variables

See `.env.example` files inside backend and frontend.

---

### 📜 API Standards

All APIs follow this response format:

```
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {}
}

```

---

### 🧠 Architecture Principles

- Workspace isolation
- RBAC enforced at middleware
- Soft deletes
- Audit logging
- Stateless backend

---

### 🧪 Development Rules

- Feature-based folders only
- No business logic in controllers
- RBAC checks mandatory
- No direct DB access across modules