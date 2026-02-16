# GameBuzz – A Cognitive Sports Event Orchestration Framework

GameBuzz is a full-stack AI-powered sports event discovery, management, and orchestration platform. The system is designed to help users discover sports events, organizers manage events efficiently, and leverage AI for intelligent recommendations and automation.

This project demonstrates real-world backend, frontend, database, and AI integration practices with proper security and Git hygiene.

---

## 🚀 Features

* 🏟️ Sports event discovery and registration
* 👤 Role-based access (organizer / player)
* 🤖 AI-powered assistance using Gemini API
* 📊 Intelligent event orchestration logic
* 🔐 Secure authentication with JWT
* ☁️ Cloud database using MongoDB

---

## 🧠 Tech Stack

### Frontend

* React.js
* HTML, CSS, JavaScript

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

### AI Integration

* Google Gemini API

---

## 📁 Project Structure

```
sports-ai-platform-final/
│
├── sports-ai-platform-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── sports-ai-platform-frontend/
│   ├── src/
│   ├── components/
│   └── public/
│
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

This project uses environment variables for security.

Create a `.env` file inside `sports-ai-platform-backend/` with the following:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

⚠️ **Never commit `.env` files to GitHub**

---

## 🛠️ Setup Instructions

### Backend Setup

```bash
cd sports-ai-platform-backend
npm install
npm start
```

### Frontend Setup

```bash
cd sports-ai-platform-frontend
npm install
npm start
```

---

## 📌 Git Best Practices Followed

* `node_modules` excluded using `.gitignore`
* API keys and secrets managed via `.env`
* Clean commit history
* Lightweight, recruiter-friendly repository

---

## 🎯 Learning Outcomes

* Practical experience with full-stack development
* Secure handling of environment variables
* Real-world Git and GitHub workflows
* AI API integration in production-style apps

---

## 👩‍💻 Author

**AKSHAYA V**
AI & Data Science Engineering Student

---

## 🌱 Future Improvements

* Deployment using Render / Vercel
* Advanced recommendation engine
* Admin analytics dashboard
* Notification system

---

⭐ If you find this project interesting, feel free to star the repository!
