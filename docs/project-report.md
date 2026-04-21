# SkillHive Major Project Report

## Project Overview

SkillHive is a major full-stack learning and collaboration platform built to help users discover skills, connect with others, exchange messages, and access AI-assisted support. The project combines a React frontend, a Node.js and Express backend, a MongoDB database, and a Python-based AI service.

## Project Objective

The goal of SkillHive is to deliver a major project implementation of a practical platform where users can:

- Build and manage profiles
- Discover people by skills and interests
- Send real-time messages
- Receive notifications and support
- Ask questions through an AI Assistant
- Search knowledge-base content through AI Search mode
- Submit feedback and contact requests through a unified support flow

## Key Features

- Secure authentication with JWT
- Role-based access control for admin and regular users
- User profile management and skill-based discovery
- Real-time chat using Socket.io
- Notification handling
- Contact Us support form
- Product feedback submission and admin inbox review
- AI Assistant with provider support and safe fallback behavior
- AI Search Engine mode for knowledge-base-only support
- Admin-managed quick issue prompts for AI Search

## Technology Stack

### Frontend

- React
- React Router
- Tailwind CSS
- Socket.io Client

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.io

### AI Service

- Python
- Flask
- Flask-CORS
- SentenceTransformers
- FAISS
- OpenAI and Google Gemini integration

## Architecture Summary

SkillHive uses a separated service architecture:

1. The React client handles user interaction and UI rendering.
2. The Node.js backend manages authentication, messaging, feedback, notifications, and admin APIs.
3. The Python AI service serves chatbot and retrieval-based responses.
4. MongoDB stores user data, messages, feedback, posts, and platform records.

This structure keeps the application modular and easier to maintain.

## Why This Is a Major Project

SkillHive qualifies as a major project because it includes:

- Multi-service architecture (frontend, backend, AI service, database)
- Real-time communication with Socket.io
- Secure authentication and role-based access control
- AI-powered workflows with provider fallback and safety handling
- Admin operations and configuration flows
- End-to-end validation across runtime, APIs, and production build steps

## Completed Modules

### 1. Authentication and Profiles

Users can register, log in, update profiles, and manage skills. Admin access is protected separately from user access.

### 2. Messaging and Notifications

The platform supports real-time communication and notification workflows for connected users.

### 3. Contact Us and Feedback

The Contact Us page supports direct messages and product feedback submission. Feedback entries are stored in the database and can be reviewed from the admin side.

### 4. AI Assistant

The assistant supports ChatGPT, Gemini, and AI Search mode. The response flow includes safer fallback handling so users receive clearer, non-technical messages when provider errors occur.

### 5. Admin Support Tools

Admin users can review feedback entries and manage quick issue prompts used by the AI Search experience.

## Validation Performed

The project was checked using live and build-time validation steps:

- Backend API health checks passed
- AI service health checks passed
- Database connectivity was verified with real collection counts
- Feedback submission API was tested end-to-end
- AI chat request flow was verified
- Frontend production build completed successfully
- Python syntax validation completed successfully

## Observed Outcome

The platform is functional across the main user journeys:

- Authentication works correctly
- Messaging and feedback flows are operational
- AI support responses are handled safely
- The Contact Us feedback flow now gives clearer user-facing messages

## Challenges Resolved

- Removed confusing provider behavior and restricted the AI stack to supported modes
- Improved fallback handling for AI errors
- Cleaned up mixed or unclear user-facing copy
- Made feedback submission responses easier to understand
- Verified real data and real runtime behavior instead of relying only on static code review

## Future Enhancements

Possible next improvements include:

- Email notifications for feedback submissions
- Feedback status tracking for users
- More granular admin analytics
- Expanded AI knowledge-base content
- Stronger monitoring and audit reporting

## Conclusion

SkillHive has been completed as a major working full-stack platform with core collaboration, support, and AI-assisted features. The project is now in a presentable state for demonstration, evaluation, and further enhancement.