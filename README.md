# Odoo_X_GV_PLM

A **Product Lifecycle Management (PLM)** system with Odoo integration for managing products, BOMs, ECOs, and approval workflows.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB/Mongoose
- **Frontend**: React, Vite, Tailwind CSS

## Project Structure

```
Odoo_X_GV_PLM/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/   # Database config
│   │   ├── models/   # Mongoose schemas
│   │   ├── routes/   # API routes
│   │   ├── middleware/ # Auth, validation
│   │   └── utils/    # Helpers
│   ├── server.js     # Entry point
│   └── seed.js       # Database seeder
├── Frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── ...
└── logs/             # Application logs
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Configure environment variables
npm run dev           # Start with nodemon
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev            # Start Vite dev server (http://localhost:5173)
```

## Features

- **Products**: Manage product catalog
- **BOMs**: Bill of Materials management
- **ECOs**: Engineering Change Orders with image review workflow
- **Approvals**: Configurable approval rules
- **Notifications**: Real-time notification system
- **Dashboard**: Statistics and overview
- **Settings**: ECO stages and rule configuration

## API Endpoints

| Resource | Methods |
|----------|---------|
| `/api/auth` | POST login |
| `/api/products` | GET, POST |
| `/api/boms` | GET, POST |
| `/api/ecos` | GET, POST, PATCH |
| `/api/notifications` | GET, PATCH |
| `/api/users` | GET, POST, PUT |
| `/api/approval-rules` | GET, POST, PUT, DELETE |
| `/api/activities` | GET, POST |
| `/api/dashboard` | GET stats |
| `/api/settings` | GET, PUT |
| `/api/health` | GET |

## License

MIT
