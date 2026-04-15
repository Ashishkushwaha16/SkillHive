# SkillHive

SkillHive is a peer-to-peer learning platform where users can share skills, discover mentors, and build learning connections.

## 1. Project Overview
SkillHive focuses on community learning:
- Users add and manage their skills
- Users explore other profiles by skill
- Users send, accept, and reject connection requests

## 2. Problem Statement
Traditional learning platforms are mostly one-way:
- Limited personal guidance
- Limited direct interaction
- Less community-based collaboration

SkillHive addresses this by enabling profile-driven mentor connections.

## 3. Proposed Solution
SkillHive provides:
- Secure registration and login
- Skill management on profile
- Mentor discovery with skill filters
- Basic mentor connection workflow

## 4. Tech Stack (MERN)
### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Authentication
- JWT (JSON Web Token)
- bcrypt password hashing

## 5. Authentication Flow
Register -> Login -> JWT token -> Protected routes/API access

## 6. Core Modules
### User Module
- Register
- Login
- Profile

### Skills Module
- Add skill
- Remove skill
- Skill validation and duplicate prevention

### Explore Module
- Browse users
- Skill-based search (case-insensitive, partial match)

### Connect Module (Basic)
- Send request
- Accept request
- Reject request

### UI Module
- Login / Register
- Dashboard
- Profile
- Explore
- About
- FAQ
- Contact
- Help Centre

## 7. Database Design (User)
Current `User` model fields include:
- name
- email
- password (hashed)
- about
- skills
- rating
- role (`user` or `admin`)
- connections
- requestsSent
- requestsReceived

## 8. System Workflow
Register
-> Login
-> Dashboard
-> Profile update (about + skills)
-> Explore mentors
-> Send/accept/reject connection requests

## 9. Security
- Password hashing with bcrypt
- JWT-based authentication
- Protected middleware for private routes

## 10. Key Features
- Authentication system
- Skill management
- Profile system
- Protected UI and API routes
- Mentor connection system (basic)
- Clean routed frontend pages

## 11. Strengths
- Full-stack MERN implementation
- Real-world use case
- Clear modular structure
- Strong base for scaling features

## 12. Current Limitations
- No real-time chat yet
- No AI recommendation engine yet
- Connection workflow is basic (no notifications layer)

## 13. Future Enhancements
- Real-time chat (Socket.io)
- Session booking system
- AI mentor recommendations
- Mobile app
- Cloud deployment and monitoring

## 14. Run Locally
### Backend
1. Open terminal in `server`
2. Run `npm install`
3. Run `npm run dev`

Required backend env (`server/.env`):
- `MONGO_URI=<your_mongodb_connection_string>`
- `JWT_SECRET=<strong_secret_key>`
- `PORT=5000` (optional)
- `CLIENT_ORIGIN=http://localhost:3000` (optional)
- `SETUP_ADMIN_KEY=<one_time_setup_key_for_initial_admin>`

### Frontend
1. Open terminal in `client`
2. Run `npm install`
3. Run `npm start`

Recommended frontend env (`client/.env`):
- `REACT_APP_API_BASE_URL=http://localhost:5000`
- `REACT_APP_SUPPORT_EMAIL=hello@skillhive.app`

## 15. API Contract (Auth)
### Register
- Method: `POST`
- URL: `/api/auth/register`
- Body:
```json
{
	"name": "Ashish",
	"email": "ashish@example.com",
	"password": "123456"
}
```

### Login
- Method: `POST`
- URL: `/api/auth/login`
- Body:
```json
{
	"email": "ashish@example.com",
	"password": "123456"
}
```

## 16. Common Errors & Fixes
- `Cannot GET /api/auth/register`:
	- Cause: Browser sends `GET`, but this route only supports `POST`.
	- Fix: Use Postman/Thunder Client/cURL with `POST`.

- `400 User already exists`:
	- Cause: Email is already present in database.
	- Fix: Use a new email for register or call login.

- `400 Invalid JSON payload`:
	- Cause: Broken JSON syntax in request body.
	- Fix: Set body type to raw JSON and validate commas/quotes.

## 17. Professional Backend Hardening (Current)
- Security headers enabled with Helmet
- API rate limiting enabled globally and stricter on auth routes
- Structured request logging in non-production mode
- Input validation on auth routes (`name`, `email`, `password`)
- Centralized JSON error handler (no HTML stack leak)
- Health endpoint available at `/health`

## 18. RBAC (Role-Based Access Control)
- User model includes `role` (`user` or `admin`)
- Contact message listing endpoint is now admin-only:
	- `GET /api/messages` requires authenticated user with `role=admin`
- Public contact submit endpoint remains open:
	- `POST /api/messages`

To promote an existing user to admin in MongoDB:
- Set `role` field to `admin` for that user document.

## 19. Backend Tests
Run backend tests:
1. Open terminal in `server`
2. Run `npm test`

Current test coverage includes:
- Auth request validation middleware behavior
- RBAC authorization middleware behavior

## 20. Admin Bootstrap (Production-Friendly)
Create or promote admin from CLI:

1. Open terminal in `server`
2. Run:

```bash
npm run admin:bootstrap -- --email admin@example.com --name "Platform Admin" --password "123456"
```

Behavior:
- If user exists: role is updated to `admin` (and password is updated if provided)
- If user does not exist: new admin user is created

You can also use env-based values:
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`

## 21. One-Time Initial Admin Setup API
For first deployment, you can initialize admin through API (one-time):

- Method: `POST`
- URL: `/api/auth/setup-admin`
- Header: `x-setup-key: <SETUP_ADMIN_KEY>`
- Body:

```json
{
	"name": "Platform Admin",
	"email": "admin@example.com",
	"password": "123456"
}
```

Rules:
- Works only when no admin exists in database
- Returns `403` if initial admin is already configured
- Returns `401` when setup key is invalid

## 22. Admin Audit Logging
Admin actions are now audit-logged to MongoDB collection via `AdminActionLog`.

Currently tracked:
- `messages.read_all` when admin accesses `GET /api/messages`

Stored metadata includes:
- admin id/email
- action name
- request method + path
- ip + user agent

## 23. GitHub CI Workflow
Workflow file: `.github/workflows/ci.yml`

Runs automatically on push/PR:
- Backend tests (`server`)
- Frontend production build (`client`)

## Final Summary
Idea -> Build -> Auth -> UI -> Skills -> Connect -> Complete
