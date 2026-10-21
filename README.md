# DevFlow — Developer Collaboration Platform

DevFlow is a full-stack developer collaboration platform designed to help teams organize projects, manage issues, assign responsibilities, and track project activity in one place.

## Features

- **Authentication** — User signup, login, and protected routes.
- **Project Management** — Create and manage projects.
- **Team Management** — Organize team members and manage membership.
- **Project Membership & Roles** — Add eligible team members to projects and manage their roles.
- **Issue Tracking** — Create, view, and manage issues and assignments.
- **Comments** — Discuss issues and collaborate with team members.
- **Activity Tracking** — View activity related to project work.
- **Dashboard** — Access an overview of your work.

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT authentication

## Project Structure

```text
DevFlow/
├── devflow-api/
│   ├── Controllers/
│   ├── Routes/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── server.js
│   └── package.json
├── devflow-client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/manaspatil1234/DevFlow.git
cd DevFlow
```

### 2. Set up the backend

```bash
cd devflow-api
npm install
```

Configure your environment variables in a local `.env` file using the variable names expected by the backend. Set your PostgreSQL connection details and JWT secret. Never commit real credentials or tokens.

Start the backend using the start command defined in `devflow-api/package.json`.

### 3. Set up the frontend

Open a separate terminal:

```bash
cd devflow-client
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Security

- Keep secrets and credentials in environment variables.
- Do not commit `.env` files.
- Use placeholder values in any example environment configuration.

## Future Improvements

- Automated API tests
- Production deployment
- Additional collaboration and reporting capabilities

## Author

**Manas Patil**

GitHub: [@manaspatil1234](https://github.com/manaspatil1234)
