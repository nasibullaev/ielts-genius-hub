# IELTS Genius Hub API

A comprehensive NestJS backend API for an IELTS preparation platform with AI-powered writing assessment, course management, and admin dashboard.

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Student/Admin)
- User registration and login with email/phone
- Profile management with progress tracking
- Password change with token refresh

### 📚 Course Management

- Hierarchical course structure (Courses → Units → Sections → Lessons)
- Multiple lesson types: Video, Text, Quiz, File
- Course ratings and reviews
- Progress tracking for each user
- Image upload for course pictures

### 🧪 Interactive Learning

- **Video Lessons**: YouTube video integration
- **Text Lessons**: Rich content delivery
- **Quiz System**: Multiple choice questions with instant feedback
- **File Lessons**: Document and resource sharing
- Real-time progress calculation

### ✍️ AI-Powered Writing Assessment

- Topic generation using Google Gemini AI
- Comprehensive essay evaluation based on IELTS criteria:
  - Task Achievement
  - Coherence & Cohesion
  - Lexical Resource
  - Grammatical Range & Accuracy
- Detailed feedback and improvement suggestions
- Word count and time tracking

### 📊 Admin Dashboard

- User analytics (total, monthly active, daily active users)
- Course performance metrics
- Recent user activities monitoring
- Essay submission tracking and detailed reviews
- Complete course management (CRUD operations)

### 💳 Payment System

- Mock payment processing
- Subscription management
- Payment history tracking
- Access control based on payment status

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **AI Integration**: Google Gemini AI
- **File Upload**: Multer
- **Documentation**: Swagger
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Google Gemini AI API Key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/ielts-genius-hub.git
cd ielts-genius-hub
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**
   Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/ielts-genius-hub

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES=24h

# AI Integration
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=3000
```

4. **Create upload directories**

```bash
mkdir uploads
mkdir uploads/courses
```

5. **Start the development server**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api`

## 📖 API Documentation

### Authentication Endpoints

```
POST /auth/register        # User registration
POST /auth/login          # User login
```

### User Management

```
GET    /users/profile             # Get current user profile
PUT    /users/profile             # Update user profile
PUT    /users/change-password     # Change password
```

### Course Management

```
GET    /courses                   # Get all courses (public)
GET    /courses/:id               # Get course details
POST   /courses                   # Create course (Admin)
PUT    /courses/:id               # Update course (Admin)
DELETE /courses/:id               # Delete course (Admin)
POST   /courses/:id/rate          # Rate a course
```

### Lesson Management

```
GET    /lessons/:id               # Get lesson content (Paid users)
POST   /lessons/:id/complete      # Mark lesson as completed
POST   /lessons/:id/quiz          # Submit quiz answers
```

### Writing Assessment

```
GET    /level-checker             # Get writing topic
POST   /level-checker             # Submit essay for evaluation
```

### Payment System

```
POST   /payments/process          # Process payment (Mock)
GET    /payments/history          # Get payment history
```

### Admin Dashboard

```
GET    /admin/dashboard                    # Dashboard statistics
GET    /admin/essay-submissions           # Recent essay submissions
GET    /admin/essay-submissions/:id       # Detailed essay review
```

## 🔑 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **Student**: Access to courses, lessons, writing checker (with payment)
- **Admin**: Full access to all endpoints plus admin dashboard

## 💳 Payment Flow

1. **User Registration/Login**: Get access token
2. **Browse Courses**: View course catalog (free)
3. **Payment**: Use mock payment with any card details
4. **Access Content**: Unlock lessons, quizzes, and writing checker
5. **Progress Tracking**: Automatic progress and streak tracking

## 🎯 Writing Assessment Flow

1. **Get Topic**: `GET /level-checker` returns AI-generated IELTS topic
2. **Write Essay**: User writes essay (minimum 150 words)
3. **Submit for Evaluation**: `POST /level-checker` with topic, essay, and time spent
4. **Get Results**: Receive IELTS band scores with detailed feedback
5. **Admin Review**: Admins can see all submissions and detailed evaluations

## 📊 Admin Features

### Dashboard Analytics

- Total registered users
- Monthly and daily active users
- Recent user activities
- Course performance metrics
- Essay submission analytics

### Course Management

- Create/edit/delete courses with image upload
- Manage course structure (units, sections, lessons)
- View course ratings and reviews

### User Monitoring

- Track user progress across courses
- Monitor essay submissions and scores
- View detailed user activity logs

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

## 📝 Database Schema

### Key Collections

- **Users**: User profiles, payment status, streaks
- **Courses**: Course information and metadata
- **Units/Sections/Lessons**: Hierarchical course structure
- **UserProgress**: Individual progress tracking
- **UserActivity**: Activity logging for analytics
- **LevelCheck**: Essay submissions and evaluations
- **Payments**: Payment transaction records
- **CourseRatings**: User ratings and reviews

---

**Built with ❤️ using NestJS and MongoDB**
