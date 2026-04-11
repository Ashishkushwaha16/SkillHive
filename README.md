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
- bio
- skills
- rating
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

### Frontend
1. Open terminal in `client`
2. Run `npm install`
3. Run `npm start`

## Final Summary
Idea -> Build -> Auth -> UI -> Skills -> Connect -> Complete
