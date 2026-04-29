# SkillHive: A Full-Stack Skill Exchange Platform with Real-Time Collaboration and AI-Assisted Support

## Abstract

SkillHive is a full-stack collaboration platform designed to unify skill discovery, user communication, and support workflows in a single system. The platform integrates a React frontend, Node.js and Express backend, MongoDB database, and a Python-based AI service. Unlike fragmented community tools where messaging, support, and feedback are handled independently, SkillHive provides an integrated architecture with role-based authentication, real-time chat, feedback management, and AI-enabled assistance. The AI layer supports both provider-based conversational responses and retrieval-based knowledge support. A key design goal is graceful degradation, where retrieval-only AI support remains operational even during external model quota failures. This paper presents the system motivation, architecture, implementation methodology, and validation results as a practical case study in building an extensible full-stack academic project.

## Index Terms

Collaboration platform, full-stack system, JWT authentication, role-based access control, real-time messaging, AI assistant, retrieval-augmented support, FAISS, Flask.

## I. Introduction

Digital learning and internship communities frequently use disconnected applications for profile management, peer communication, and support operations. Such fragmentation reduces user efficiency and increases administrative overhead. SkillHive addresses this by offering a unified web platform for profile-based discovery, real-time communication, structured feedback, and AI-assisted guidance.

The system is implemented as a multi-service architecture to separate concerns and improve maintainability. The frontend manages interaction and navigation, the backend handles business rules and APIs, and the AI layer handles support-oriented query processing. This architecture supports incremental improvement while preserving service independence.

## II. Problem Statement

Existing collaboration workflows commonly face four practical issues:

1. Profile and discovery features are not tightly integrated.
2. Messaging lacks reliable real-time interaction in lightweight academic systems.
3. Feedback and support channels are often unstructured.
4. AI support modules may fail abruptly when provider access is limited.

SkillHive is designed to mitigate these constraints through a combined full-stack and AI-assisted design.

## III. Objectives and Contributions

The primary project objectives are:

1. Build a secure, role-based collaboration platform.
2. Enable real-time user messaging and notifications.
3. Provide structured support and product feedback workflows.
4. Integrate AI assistance with robust fallback behavior.

The principal contributions of this work are:

1. A modular end-to-end architecture combining web, database, real-time, and AI services.
2. A retrieval-first AI Search mode that operates independently of external LLM quotas.
3. A practical failure-handling strategy for provider errors using safe user-facing fallback responses.

## IV. System Architecture

SkillHive follows a four-layer architecture:

1. **Client Layer (React):** UI rendering, route management, form interactions, and socket event handling.
2. **Application Layer (Node.js/Express):** REST APIs for authentication, users, messages, notifications, posts, and feedback.
3. **AI Service Layer (Python/Flask):** Conversational and retrieval-based support endpoints.
4. **Data Layer (MongoDB):** Persistence of user, message, feedback, notification, post, and related entities.

This separation improves fault isolation and supports independent iteration of the AI service.

## V. Implementation Details

### A. Authentication and Authorization

JWT-based authentication is used for secure sessions. Role-aware access control supports normal users and administrative actions. The system supports both local credentials and Google-based authentication flow.

### B. Real-Time Communication

Socket.io enables real-time message delivery and interactive communication without full-page refresh cycles.

### C. Feedback Workflow

A dedicated feedback flow allows users to submit product feedback and enables admin-side review. Input validation enforces minimum quality and consistent response behavior.

### D. AI Assistant and AI Search

The AI module supports:

1. Provider-backed assistant responses (ChatGPT/Gemini mode).
2. Retrieval-based AI Search over project knowledge documents.

The retrieval mode is particularly useful when external provider quotas are unavailable.

## VI. AI Support Design

The AI Search pipeline uses sentence embeddings with FAISS similarity retrieval. User queries are embedded, matched to the most relevant document chunks, and transformed into grounded responses. This retrieval-first approach reduces hallucination risk and improves support consistency.

The assistant mode includes provider abstraction, model selection, and safe error sanitization. In case of quota or access failures, end users receive non-technical fallback messages rather than raw API errors.

## VII. Experimental Validation and Results

System validation was performed using runtime and build-level checks:

1. Backend health endpoint returned successful responses.
2. AI service endpoints responded successfully.
3. AI configuration endpoint returned valid mode metadata.
4. Retrieval-based AI Search returned knowledge-backed responses.
5. Feedback submission persisted records successfully.
6. Frontend production build completed without blocking issues.
7. Python syntax validation completed successfully.

These results confirm that the core user journeys are functional in the integrated deployment.

## VIII. Discussion

The implementation demonstrates that AI in collaboration platforms should be integrated as a resilient support layer rather than a single external dependency. The retrieval-only path provides a practical continuity mechanism and improves reliability in constrained environments such as student project demos.

The architecture also highlights the importance of service separation in full-stack systems where real-time communication and AI workloads coexist.

## IX. Limitations

The current system has the following limitations:

1. Provider-backed AI behavior depends on external quota and billing conditions.
2. Knowledge-base scope is currently limited and can be expanded.
3. Advanced analytics for user-support interaction patterns are minimal.

## X. Future Work

Future enhancements may include:

1. Expanded retrieval corpus and hybrid ranking improvements.
2. Feedback lifecycle tracking and richer admin analytics.
3. Enhanced monitoring, observability, and deployment automation.
4. Improved AI evaluation metrics for response quality.

## XI. Conclusion

SkillHive presents a practical full-stack architecture for integrated collaboration, communication, and AI-assisted support. By combining secure web application design, real-time interaction, structured feedback handling, and retrieval-first AI support, the project demonstrates a robust blueprint suitable for academic major projects and future product-scale evolution.

## References

[1] React Documentation. [Online]. Available: https://react.dev

[2] Node.js Documentation. [Online]. Available: https://nodejs.org/docs/latest/api

[3] Express.js Documentation. [Online]. Available: https://expressjs.com

[4] MongoDB Documentation. [Online]. Available: https://www.mongodb.com/docs

[5] Mongoose Documentation. [Online]. Available: https://mongoosejs.com/docs

[6] Socket.io Documentation. [Online]. Available: https://socket.io/docs/v4

[7] Flask Documentation. [Online]. Available: https://flask.palletsprojects.com

[8] SentenceTransformers Documentation. [Online]. Available: https://www.sbert.net

[9] FAISS Documentation. [Online]. Available: https://faiss.ai

[10] OpenAI API Documentation. [Online]. Available: https://platform.openai.com/docs

[11] Google Gemini API Documentation. [Online]. Available: https://ai.google.dev/gemini-api/docs
