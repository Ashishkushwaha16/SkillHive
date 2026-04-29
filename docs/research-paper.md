# SkillHive: A Full-Stack Skill Exchange Platform with Real-Time Collaboration and AI-Assisted Support

## Abstract

SkillHive is a full-stack web platform designed to support skill-based collaboration, peer discovery, real-time communication, and guided user support in a single application. The system combines a React-based client, a Node.js and Express backend, a MongoDB persistence layer, and a Python-based AI service. In contrast to traditional collaboration tools that separate messaging, feedback, and support workflows, SkillHive unifies these interactions into one modular architecture. The platform provides JWT-secured authentication, role-based authorization, Socket.io-based messaging, feedback submission and review, and an AI support layer with provider-based responses and knowledge-base retrieval. The AI subsystem includes ChatGPT, Gemini, and a retrieval-only AI Search mode designed to operate even when external model APIs are unavailable. This paper presents the motivation, architecture, implementation approach, and validation of the system as a practical case study in building an integrated major-project-scale application.

## Keywords

Skill exchange, collaboration platform, real-time messaging, JWT authentication, role-based access control, knowledge-base retrieval, AI assistant, FAISS, Flask, React, Node.js.

## 1. Introduction

Digital learning communities often rely on multiple disconnected tools for discovering peers, exchanging messages, collecting feedback, and answering support questions. This fragmentation creates friction for users and increases the overhead of platform administration. SkillHive addresses this problem by offering a unified environment where users can create profiles, manage skills, discover others, communicate in real time, and access AI-assisted help.

The platform was developed as a major project with emphasis on practical usability, modularity, and safe handling of AI interactions. The system is intentionally separated into three major execution layers: a frontend for user interaction, a backend for business logic and data access, and an AI service for support-oriented responses. This separation improves maintainability and allows the AI layer to evolve independently from the core application.

## 2. Problem Statement

Most learning and community platforms handle the following requirements in a fragmented way:

- Profile management is isolated from discovery.
- Messaging is often treated as a separate subsystem.
- Support requests and feedback are collected through manual channels.
- AI assistance, when present, depends heavily on external providers and fails ungracefully when quotas or keys are missing.

SkillHive was built to address these issues through one integrated workflow. The goal is to provide a platform where collaboration, support, and AI guidance are all accessible from a single interface.

## 3. Research Motivation and Contribution

This project explores a practical design pattern for modern web applications that must combine traditional CRUD operations, real-time communication, and AI-based support. The core contribution is not a new machine learning model, but a robust architectural integration pattern that enables:

1. Secure authentication and authorization for human users.
2. Real-time communication through Socket.io.
3. Feedback and support workflows with admin review.
4. AI support with safe fallback behavior.
5. Retrieval-only local AI Search that remains usable when external APIs are unavailable.

The project demonstrates how a full-stack system can be structured so that AI is assistive rather than brittle.

## 4. System Overview

SkillHive uses a layered architecture:

1. **React Client**: Handles rendering, routing, form interactions, and socket-based UI updates.
2. **Node.js Backend**: Exposes REST APIs for authentication, user management, chat, notifications, posts, feedback, and AI search configuration.
3. **Python AI Service**: Hosts the AI Assistant endpoints and retrieval-based AI Search.
4. **MongoDB**: Stores users, messages, feedback, notifications, chats, posts, and other application records.

The AI layer is deployed as a separate Flask service to keep natural-language support logic isolated from the main application server. This design also simplifies testing and allows retrieval logic to run independently.

## 5. Technology Stack

### 5.1 Frontend

- React
- React Router
- Tailwind CSS
- Socket.io Client

### 5.2 Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.io

### 5.3 AI Layer

- Python
- Flask and Flask-CORS
- SentenceTransformers
- FAISS
- OpenAI API integration
- Google Gemini API integration

## 6. Methodology

The development approach followed an incremental implementation strategy.

### 6.1 Requirements Analysis

The first step was identifying the major user journeys required for the platform: registration, login, profile management, search, messaging, support, and feedback. These were mapped to system modules and database entities.

### 6.2 Modular Implementation

Each subsystem was implemented in a dedicated code path:

- Frontend pages and components for user interaction.
- REST controllers and route modules for backend logic.
- Mongoose models for persistence.
- Flask service for knowledge-base retrieval and AI assistant behavior.

### 6.3 Validation and Hardening

The system was verified with runtime checks, production build checks, and API-level validation. AI provider errors were sanitized to avoid exposing technical details to end users.

## 7. Core Functional Modules

### 7.1 Authentication and Authorization

SkillHive uses JWT-based authentication for secure login sessions. The system supports both local email-password authentication and Google OAuth login. Role-based access controls separate normal users from admin operations.

### 7.2 Profile and Skill Management

Each user can create and update a profile containing skills, interests, and related personal information. This forms the basis for skill discovery and peer matching.

### 7.3 Real-Time Messaging

Socket.io is used to support immediate messaging between users. This enables collaborative interaction without requiring full-page refreshes.

### 7.4 Feedback and Support Workflow

Users can submit product feedback and contact requests. Feedback is stored in MongoDB and can be reviewed through admin workflows. Validation is applied to avoid empty or low-quality submissions.

### 7.5 AI Assistant and AI Search

SkillHive includes two distinct AI experiences:

- **AI Assistant**: Uses provider-based responses from ChatGPT or Gemini.
- **AI Search**: Uses local knowledge-base retrieval to answer app-related questions without depending on external model APIs.

This dual design is important because it preserves usability even when external API quotas are exhausted.

## 8. AI Search Design

The AI Search engine was implemented as a retrieval system over a local knowledge base. The pipeline uses sentence embeddings and FAISS similarity search to retrieve relevant chunks from internal documents. The response generator then formats the extracted content into a user-friendly answer.

The design was deliberately kept retrieval-first rather than generative-first. This reduces hallucination risk and ensures that support answers remain grounded in the project’s own knowledge base.

### 8.1 Knowledge Base

The knowledge base contains project-specific documents such as:

- App support guide
- Attendance policy
- Evaluation guidance
- Platform guidelines
- Meeting scheduling rules
- Task validation details

### 8.2 AI Search Response Strategy

When a user asks a question, the system performs semantic retrieval against the knowledge base and returns the most relevant content. If a user query is unrelated or too vague, the system responds safely and guides the user toward a more specific question or support contact.

## 9. AI Assistant Design

The AI Assistant supports ChatGPT and Gemini as provider-backed modes. A provider abstraction layer handles model selection, API key loading, and error sanitization. If a provider fails due to quota or authorization errors, the system falls back to a safe user-facing message rather than showing raw technical output.

This approach is important for production readiness because AI features often fail due to external service constraints rather than application bugs.

## 10. Data Model Overview

The backend uses MongoDB models for the major platform entities. The key entities include:

- **User**: Profile, authentication, role, and social metadata.
- **Message**: Real-time and stored communication records.
- **Feedback**: Product feedback submissions and review status.
- **Notification**: User-facing system notifications.
- **Post**: Community or content-related entries.
- **Chat/Conversation**: Chat interaction records where applicable.

The model design is centered around role-based access and relational references through ObjectId fields.

## 11. Validation and Observed Outcomes

The project was validated using real runtime checks, not only static code review. The observed outcomes were:

- Backend health endpoint responded successfully.
- AI service health endpoint responded successfully.
- AI configuration endpoint returned supported AI modes and quick issues.
- AI Search returned knowledge-base-backed answers.
- Feedback submission flow stored records successfully.
- Frontend production build completed successfully.
- Python syntax checks completed successfully.

These checks indicate that the main user journeys are operational.

## 12. Discussion

SkillHive demonstrates a practical pattern for integrating AI into a real application. The project shows that AI does not need to replace the core system; instead, it can act as a support layer. The retrieval-based AI Search mode is especially valuable because it remains functional without external model keys or paid quota, which improves reliability for development and presentation environments.

The project also highlights the importance of graceful degradation. A system that handles external AI failures safely is more usable than one that simply breaks when providers are unavailable.

## 13. Limitations

The current implementation has a few limitations:

- External AI providers still depend on valid API access and quota.
- The knowledge base is intentionally small and can be expanded.
- Analytics can be deepened for support and search behavior.
- Production deployment hardening can be extended further.

## 14. Future Work

Future enhancements may include:

- Expanded knowledge-base content with more support topics.
- Advanced analytics for frequently searched queries and unresolved issues.
- Feedback lifecycle tracking with status updates.
- Notification improvements for support and collaboration events.
- Stronger deployment automation and observability.
- More advanced hybrid ranking for AI Search.

## 15. Conclusion

SkillHive is a complete major-project-scale platform that integrates authentication, profile management, real-time messaging, feedback handling, and AI-assisted support into one coherent system. The project demonstrates a practical architecture for combining standard web application features with safe retrieval-based AI support. Its modular design, successful validation, and fallback behavior make it suitable as both a functional product prototype and an academic research-style case study.

## References

1. React Documentation
2. Node.js Documentation
3. Express.js Documentation
4. MongoDB and Mongoose Documentation
5. Socket.io Documentation
6. Flask Documentation
7. SentenceTransformers Documentation
8. FAISS Documentation
9. OpenAI API Documentation
10. Google Gemini API Documentation
