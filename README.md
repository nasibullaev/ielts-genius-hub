# IELTS Genius Hub API

A NestJS backend API for IELTS preparation with AI-powered writing assessment and course management.

## ✨ Key Features

- **🔐 Authentication**: JWT-based auth with role-based access (Student/Admin)
- **📚 Courses**: Hierarchical structure (Courses → Units → Sections → Lessons)
- **✍️ AI Writing**: Google Gemini-powered essay evaluation with IELTS criteria
- **📊 Admin Dashboard**: User analytics, course management, essay monitoring
- **💳 Payments**: Mock payment system with subscription management

## 🛠️ Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: MongoDB + Mongoose
- **AI**: Google Gemini API
- **Auth**: JWT + Passport
- **Docs**: Swagger

## 🚀 Quick Start

1. **Clone & Install**

```bash
git clone https://github.com/nasibullaev/ielts-genius-hub.git
cd ielts-genius-hub
npm install
```

2. **Environment Setup**
   Create `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/ielts-genius-hub
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES=24h
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

3. **Create Directories**

```bash
mkdir -p uploads/courses
```

4. **Start Development**

```bash
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`

## 📖 Main Endpoints

| Endpoint            | Method   | Description                 |
| ------------------- | -------- | --------------------------- |
| `/auth/register`    | POST     | User registration           |
| `/auth/login`       | POST     | User login                  |
| `/courses`          | GET      | Get all courses             |
| `/courses/:id`      | GET      | Course details              |
| `/lessons/:id`      | GET      | Lesson content (paid)       |
| `/level-checker`    | GET/POST | Writing topics & evaluation |
| `/payments/process` | POST     | Process payment             |
| `/admin/dashboard`  | GET      | Admin analytics             |

## 🔑 Authentication

Include JWT token in headers:

```
Authorization: Bearer <your-jwt-token>
```

**Roles:**

- **Student**: Access courses, lessons, writing checker (with payment)
- **Admin**: Full access + admin dashboard

## 🎯 Writing Assessment Flow

1. `GET /level-checker` → Get AI-generated IELTS topic
2. User writes essay (min 150 words)
3. `POST /level-checker` → Submit for evaluation
4. Receive IELTS band scores + detailed feedback

## 🚀 Production

```bash
npm run build
npm run start:prod
```

---

**Built with ❤️ using NestJS and MongoDB**
