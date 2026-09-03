# DULU 🗣️

### Practice English. Naturally.

**DULU** is an AI-powered English speaking practice platform designed for college students who understand English but lack confidence when speaking it.

Instead of practicing alone or worrying about making mistakes in front of others, users can have short, natural conversations with **Ava**, an AI speaking partner, and receive personalized feedback after each session.

🔗 **Live Demo:** https://DULU-blush.vercel.app/

---

## 🎯 Problem

Many students can understand and write English reasonably well but struggle when they have to speak.

The main problem isn't always a lack of English knowledge — it is often a lack of **regular, low-pressure speaking practice**.

Traditional options can have limitations:

* Practicing alone can feel unnatural.
* Friends may not always be available to practice.
* Speaking in front of others can create anxiety about making mistakes.
* Professional language tutors may be expensive or inconvenient.

DULU explores whether an AI conversation partner can make speaking practice easier, more accessible, and less intimidating.

---

## 💡 Solution

DULU provides a simple environment where users can practice English through a conversation with **Ava**, an AI speaking partner.

The user:

1. Starts a speaking session.
2. Speaks naturally using their microphone.
3. Ava responds conversationally.
4. The conversation continues for as long as the user wants.
5. The user finishes the session.
6. Ava generates a personalized speaking report.
7. The user can practice again.

The goal is not to make users speak perfect English immediately. The goal is to help them **speak more comfortably and consistently**.

---

## 🤖 Why an AI Avatar?

The avatar is a central part of the experience rather than just a visual element.

Ava provides:

* A visible conversation partner
* Voice-based interaction
* Real-time conversational responses
* A consistent, judgment-free practice environment
* A more natural experience than interacting with a text-only chatbot

The avatar helps make the interaction feel more like a conversation with a speaking partner.

---

## ✨ Features

### 🎙️ Voice Conversation

Users can speak naturally using their browser microphone instead of typing their responses.

### 🤖 AI Conversation Partner

Ava responds to the user's messages using Google's Gemini model and maintains the context of the conversation.

### 🔊 Text-to-Speech

Ava speaks her responses aloud using the browser's built-in speech synthesis.

### 📊 Personalized Feedback

After a session, DULU generates feedback covering areas such as:

* Overall performance
* Strengths
* Grammar improvements
* Better vocabulary and phrases
* Suggested next steps

### ⭐ Session Rating

Users can rate their practice session and indicate whether they would practice with Ava again.

### ⏱️ Session Information

The application displays basic session information such as:

* Number of conversation turns
* Practice duration
* Session completion

---

## 🏗️ How It Works

```text
              ┌──────────────────┐
              │      User        │
              │  Speaks English  │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  DULU Web App │
              │   React + Vite   │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │      Render      │
              │  Express Backend │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   Gemini API     │
              │  AI Conversation │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │       Ava        │
              │ AI Response + TTS│
              └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **Vite**
* **JavaScript**
* **CSS**
* Browser Web Speech API

  * Speech Recognition
  * Speech Synthesis

### Backend

* **Node.js**
* **Express.js**
* **CORS**
* **dotenv**

### AI

* **Google Gemini API**
* Gemini `2.5 Flash`

### Deployment

* **Vercel** — Frontend
* **Render** — Backend

### Development

* **VS Code**
* **Git**
* **GitHub**

---

## 📁 Project Structure

```text
AI-English_Tutor-DULU-
│
├── public/
│
├── server/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── ...
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/23053799-prog/AI-English_Tutor-DULU-.git
```

### 2. Move into the project

```bash
cd AI-English_Tutor-DULU-
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never commit the `.env` file or expose your API key publicly.

### 5. Start the backend

Inside the `server` directory:

```bash
node server.js
```

### 6. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

The backend requires:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The API key is kept on the backend and is **not exposed in the React frontend**.

The `.env` file should never be uploaded to GitHub.

---

## 🌐 Deployment

DULU is deployed using a separate frontend and backend architecture.

### Frontend

The React/Vite application is deployed on **Vercel**.

**Live application:**

https://DULU-blush.vercel.app/

### Backend

The Express backend is deployed on **Render**.

The frontend communicates with the deployed backend through API endpoints.

```text
Vercel
  │
  │ API requests
  ▼
Render
  │
  │ Gemini API requests
  ▼
Google Gemini
```

---

## 🧪 Product Validation

DULU was built as a focused MVP with an emphasis on testing the product idea rather than building a large feature set.

The initial product hypothesis is:

> Students who understand English but lack speaking confidence will practice more consistently if they have access to a short, low-pressure conversation with an AI speaking partner.

The MVP is intentionally narrow so that the core experience can be tested quickly:

**Start → Speak → Converse → Get Feedback → Practice Again**

User feedback and observed usage can be used to determine which parts of the experience should be improved or expanded.

---

## 🔮 Future Improvements

Possible next steps include:

* More conversation scenarios
* Difficulty levels
* Personalized practice goals
* Improved pronunciation analysis
* Progress tracking
* More natural avatar animation
* Additional speaking exercises
* Conversation history
* User accounts
* Mobile-friendly improvements
* More detailed learning recommendations

These features would be considered after validating that users actually find the core conversation experience useful.

---

## ⚠️ Current Limitations

DULU is currently an MVP and has some limitations.

* Speech recognition depends on browser support.
* The current experience is optimized for modern browsers such as Google Chrome.
* The avatar is a lightweight visual avatar rather than a photorealistic talking character.
* Pronunciation accuracy is not currently measured.
* The product currently focuses on a single core conversation experience.

These limitations are intentional to keep the MVP focused on validating the primary user problem.

---

## 🔒 Privacy & Security

DULU does not require users to create an account for the current MVP.

The Gemini API key is stored on the backend and is not included in the frontend application.

The project does not intentionally collect sensitive personal information.

---

## 📌 Project Status

**Status: Live MVP 🚀**

The core product flow is functional and publicly accessible.

**Current flow:**

```text
Landing Page
     ↓
Start Practice
     ↓
AI Conversation with Ava
     ↓
Voice Interaction
     ↓
Finish Practice
     ↓
AI Speaking Report
     ↓
User Rating
     ↓
Practice Again
```

---

## 👨‍💻 Author

**Aakash Shah**

B.Tech — Computer Science & Engineering


---

## 📄 License

This project was created as an original MVP/product prototype.

© 2026 DULU
