# ProjectFlow

A full-stack project management application built with React, Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Live Demo

👉 https://projectflow-u0kj.onrender.com

## 💻 GitHub Repository

👉 https://github.com/shreyaskharat15-git/project-management-app

# ProjectFlow

ProjectFlow is a full-stack project management application for organizing projects and tracking tasks through a simple Kanban-style workflow.

## Features

* User registration and login
* JWT-based authentication
* Secure password hashing with bcrypt
* Protected REST API endpoints
* Create and delete projects
* Create, update, and delete tasks
* Todo, In Progress, and Done workflow
* Persistent PostgreSQL database
* Prisma ORM for database access
* Responsive dashboard
* Project-specific task board

## Screens

### Dashboard

The dashboard provides an overview of the workspace, project statistics, and project creation.

### Project Board

Each project has a Kanban-style task board with three workflow stages:

* Todo
* In Progress
* Done

### Authentication

Users can create an account and securely sign in to access their projects.

## Technology Stack

### Frontend

* React
* JavaScript
* React Router
* ProjectFlow
* CSS

### Backend

* Node.js
* Express.js
* REST API
* JWT
* bcrypt

### Database

* PostgreSQL
* Prisma ORM

## Architecture

```text
React
   |
   | REST API
   v
Express.js
   |
   | Prisma ORM
   v
PostgreSQL
```

## Project Structure

```text
ProjectFlow/
│
├── prisma/
│   └── schema.prisma
│
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── db.js
│   └── server.js
│
└── src/
    ├── pages/
    │   ├── login.jsx
    │   ├── register.jsx
    │   ├── dashboard.jsx
    │   └── project.jsx
    ├── api.js
    ├── App.jsx
    ├── App.css
    └── main.jsx
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shreyaskharat15-git/ProjectFlow.git
cd ProjectFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_manager"
JWT_SECRET="your_secret_key"
PORT=5000
```

### 4. Run Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the backend

```bash
npm run server
```

### 6. Start the frontend

Open another terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## API

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Projects

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```text
GET    /api/tasks/:projectId
POST   /api/tasks/:projectId
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

## What I Learned

This project gave me practical experience with:

* Building a React frontend
* Designing REST APIs
* Connecting React to an Express backend
* Working with PostgreSQL
* Using Prisma ORM
* Implementing JWT authentication
* Protecting API routes
* Managing application state
* Structuring a full-stack application

## Future Improvements

* Team members and project collaboration
* Task due dates and priorities
* Drag-and-drop Kanban cards
* Search and filtering
* Project analytics
* Deployment with a production database

## Author

Shreyas Kharat

GitHub: https://github.com/shreyaskharat15-git
