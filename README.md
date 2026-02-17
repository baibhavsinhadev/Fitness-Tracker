# AI-Powered Fitness Tracker (React + Strapi + Gemini AI)

A real-world **AI-powered fitness tracking application** built using **React JS**, **Strapi**, and **Tailwind CSS**.

This project helps users set fitness goals, track daily calories, log workouts, and even analyze food images using **Google Gemini AI** to automatically estimate calorie intake.

A perfect full stack AI portfolio project for developers who want to build something modern and real.

---

## 🚀 Features

### 🧑‍💻 User & Profile

- User authentication (**Sign up / Sign in**)
- Update user profile details
- Personalized fitness goal system

### 🎯 Fitness Tracking

- Set daily fitness goals
- Track daily food intake (**calories consumed**)
- Track fitness activities (**calories burned**)
- View progress summary

### 🤖 AI Food Tracking (Gemini AI)

- Upload a food image
- Food image analysis using **Google Gemini AI**
- Automatically calculates estimated calorie intake
- Saves food entry into the tracker

### 🌍 Deployment

- Free deployment for both frontend and backend:
  - **Frontend**: Vercel
  - **Backend**: Strapi Cloud

---

## 🛠️ Tech Stack

| Technology       | Usage               |
| ---------------- | ------------------- |
| React JS         | Frontend            |
| Tailwind CSS     | UI Styling          |
| Strapi           | Backend + CMS + API |
| Google Gemini AI | Food image analysis |
| Vercel           | Frontend Deployment |
| Strapi Cloud     | Backend Deployment  |

---

## 📂 Project Structure

```
fitness-tracker/
│
├── client/        # React frontend
└── server/        # Strapi backend
```

---

## ⚙️ Setup Instructions (Local Development)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

## 🔥 Frontend Setup (React)

```bash
cd client
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## 🧠 Backend Setup (Strapi)

```bash
cd server
npm install
npm run develop
```

Strapi Admin Panel will run on:

```
http://localhost:1337/admin
```

---

## 🔑 Environment Variables

### 📌 Frontend `.env`

Create a `.env` file inside the `client/` folder:

```env
VITE_API_URL=http://localhost:1337
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

---

### 📌 Backend `.env`

Create a `.env` file inside the `server/` folder:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
JWT_SECRET=your_jwt_secret
```

> Strapi generates most secrets automatically when you create the project.
> If not, you can generate them manually.

---

## 🤖 Google Gemini AI Setup

1. Go to **Google AI Studio**
2. Create a Gemini API key
3. Paste the key inside:

```env
VITE_GEMINI_API_KEY=your_key_here
```

---

## 🌍 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel:
   - `VITE_API_URL`
   - `VITE_GEMINI_API_KEY`

4. Deploy 🎉

---

### Backend (Strapi Cloud)

1. Push backend to GitHub
2. Deploy using Strapi Cloud
3. Add required `.env` variables inside Strapi Cloud settings
4. Deploy 🎉

---

## 📌 Future Improvements

- Meal macros tracking (Protein / Carbs / Fats)
- Weekly + Monthly analytics charts
- AI-based meal suggestions
- Workout plan generator
- Dark mode UI

---

## 👨‍💻 Author

**Baibhav Sinha**
16 y/o! Full Stack Web Developer

If you liked this project, consider giving it a ⭐ on GitHub.

---

## 📜 License

This project is created for portfolio purposes.  
You may view the code, but copying or reusing it without permission is not allowed.
