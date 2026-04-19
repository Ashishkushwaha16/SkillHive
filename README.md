# SkillHive

SkillHive is a **real-time skill exchange and collaborative learning platform** where users can connect, share knowledge, and grow together.

It combines **secure authentication, smart skill matching, real-time communication, and AI-powered assistance** to create a modern learning ecosystem.

---

## ✨ Key Features

* 🔐 Secure authentication with JWT
* 👤 Profile management with skills and user details
* 🔍 Smart skill-based user discovery
* 💬 Real-time chat with Socket.io
* 🔔 Notifications system
* 🤖 AI-powered assistant using RAG (Retrieval-Augmented Generation)
* 🌐 Multilingual AI responses (English/Hindi)
* 📄 Help, support, and legal pages

---

## 🧑‍💻 User Capabilities

* Register and manage profile
* Add and update skills
* Discover and connect with other users
* Chat in real time
* Receive notifications
* Ask AI assistant for contextual help

---

## 🏗️ Tech Stack

### Frontend

* React
* React Router
* Tailwind CSS
* Socket.io Client

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication + RBAC
* Socket.io

### AI Assistant

* Python (Flask API)
* RAG-based retrieval system
* LLM-powered responses

---

## 📂 Project Structure

```text
SkillHive/
├── client/        # React frontend
├── server/        # Node.js backend
├── app.py         # AI core logic
├── server.py      # Flask AI server
├── knowledge_base/
├── requirements.txt
└── .env.example
```

---

## ⚙️ Local Setup

### 1️⃣ Install Dependencies

```bash
npm --prefix server install
npm --prefix client install
```

### 2️⃣ Setup Environment

Copy one of the environment templates to `.env`:

```powershell
Copy-Item .env.example .env
```

For production-style setup, you can also use:

```powershell
Copy-Item .env.production.example .env
```

Fill required values:

* `MONGO_URI`
* `JWT_SECRET`
* `CLIENT_ORIGIN`
* `REACT_APP_API_BASE_URL`
* `AI_PROVIDER`
* `AI_ASSISTANT_PORT`
* API keys for the selected AI providers

### 3️⃣ Run Application

```bash
# Backend
npm --prefix server run dev
```

```bash
# Frontend
npm --prefix client start
```

```bash
# AI Assistant
python server.py
```

---

## 🔌 API Endpoints

### Backend

* `GET /health`
* `GET /`
* `/api/auth`
* `/api/users`
* `/api/chat`
* `/api/messages`
* `/api/notifications`
* `/api/posts`
* `/api/feedback`
* `/api/calls`

### AI Assistant

* `POST /chat`
* `GET /health`

---

## 🧪 Testing

```bash
npm --prefix server test
npm --prefix client run build
python -m py_compile app.py server.py
```

---

## 🔐 Security Practices

* Environment variables for secrets
* JWT-based authentication
* Input validation
* No hardcoded sensitive data
* Production-only `CLIENT_ORIGIN` for password reset links

---

## 🚀 Future Enhancements

* Session booking system
* Advanced AI recommendations
* Mobile application
* Deployment on cloud platforms

---

## 👨‍💻 Author

Ashish Kushwaha

---

## ⭐ Vision

To build a **global skill exchange ecosystem** where learning is collaborative, accessible, and powered by intelligent systems.
