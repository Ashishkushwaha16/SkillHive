# SkillHive

SkillHive is a peer-to-peer skill exchange platform where users can share skills, discover mentors, and build learning connections.

## 1. Project Overview
SkillHive focuses on two-way community learning:
- Users add and manage their skills
- Users explore other profiles by skill
- Users send, accept, and reject connection requests

Core direction:
- Learn from others
- Teach what you know
- Build long-term collaborative learning relationships

## 2. Problem Statement
Traditional learning platforms are mostly one-way:
- Limited personal guidance
- Limited direct interaction
- Less community-based collaboration

Most platforms do not support structured skill exchange where two users can help each other grow.

SkillHive addresses this by enabling profile-driven mentor connections.

## 3. Proposed Solution
SkillHive provides a strong MVP foundation:
- Secure registration and login
- Skill management on profile
- Mentor discovery with skill filters
- Basic mentor connection workflow

And is evolving toward a startup-style skill exchange ecosystem.

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
- Google Sign-In / Sign-Up (OAuth)

## 5. Authentication Flow
Register/Login/Google auth -> JWT token -> Protected routes/API access

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
- Rating filters and sorting options
- Smart match mode with skill overlap score

### Connect Module (Basic)
- Send request
- Accept request
- Reject request

### Rating Module
- Rate connected users from Explore page cards
- 1 to 5 rating scale
- Average rating updates after each review

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
- Advanced explore filters and sorting
- Skill matching score endpoint

## 11. Strengths
- Full-stack MERN implementation
- Real-world use case with clear upgrade path
- Clear modular backend structure
- Security hardening and RBAC in place
- Strong base for scaling into real product features

## 12. Current Limitations
- No session-wise mentor feedback analytics yet
- No dedicated skill swap workflow yet (Teach X -> Learn Y)
- No booking/session scheduling system yet
- No notification layer yet
- No AI recommendation engine yet

## 13. Future Enhancements
Phase 1 (high impact):
- Real-time chat (Socket.io)
- Skill exchange matching workflow
- Smarter explore and recommendation layer

Phase 2:
- Session booking and tracking
- Notification system
- Dashboard analytics and activity insights

Phase 3:
- Advanced security flows (email verification, password reset)
- API docs (Swagger)
- Cloud deployment and monitoring
- Mobile app

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
- `GOOGLE_CLIENT_ID=<google_oauth_web_client_id>`
- `SMTP_HOST=<smtp_host>`
- `SMTP_PORT=<smtp_port>`
- `SMTP_SECURE=<true_or_false>`
- `SMTP_USER=<smtp_username>`
- `SMTP_PASS=<smtp_password>`
- `SMTP_FROM=<from_email>` (optional)
- `SETUP_ADMIN_KEY=<one_time_setup_key_for_initial_admin>`

### Frontend
1. Open terminal in `client`
2. Run `npm install`
3. Run `npm start`

Recommended frontend env (`client/.env`):
- `REACT_APP_API_BASE_URL=http://localhost:5000`
- `REACT_APP_SUPPORT_EMAIL=hello@skillhive.app`
- `REACT_APP_GOOGLE_CLIENT_ID=<google_oauth_web_client_id>`

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

### Google Auth (Sign-in / Sign-up)
- Method: `POST`
- URL: `/api/auth/google`
- Body:
```json
{
	"credential": "google_id_token"
}
```

### Forgot Password
- Method: `POST`
- URL: `/api/auth/forgot-password`
- Body:
```json
{
	"email": "ashish@example.com"
}
```

### Reset Password
- Method: `POST`
- URL: `/api/auth/reset-password`
- Body:
```json
{
	"token": "reset_token_from_email",
	"password": "new_password"
}
```

### Rate a Connected User
- Method: `POST`
- URL: `/api/users/rate/:ratedUserId`
- Header: `Authorization: Bearer <token>`
- Body:
```json
{
	"rating": 5,
	"comment": "Great mentor"
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

## 24. Product Vision
SkillHive aims to become a collaborative learning ecosystem where users can exchange skills, schedule practical sessions, and grow through structured peer learning.

## Developed By
Ashish Kushwaha

## Final Summary
Idea -> Build -> Auth -> UI -> Skills -> Connect -> Complete
