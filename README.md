# 📚 Course Management System — Backend API

A complete **REST API backend** built with **Node.js, Express.js, MongoDB, and Mongoose**.  
Implements JWT authentication, role-based authorization, file uploads with Multer, and centralized error handling.

---

## 🛠️ Tech Stack

| Technology   | Purpose                      |
|--------------|------------------------------|
| Node.js      | Runtime environment          |
| Express.js   | Web framework                |
| MongoDB      | NoSQL database               |
| Mongoose     | ODM for MongoDB              |
| bcryptjs     | Password hashing             |
| jsonwebtoken | JWT authentication           |
| multer       | File uploads                 |
| dotenv       | Environment configuration    |
| cors         | Cross-Origin Resource Sharing|

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, Login, Logout
│   ├── courseController.js    # Course CRUD
│   ├── uploadController.js    # Standalone file uploads
│   └── userController.js      # User CRUD (Admin)
├── middleware/
│   ├── authMiddleware.js      # JWT protect + role authorize
│   ├── errorMiddleware.js     # Centralized error handler
│   └── uploadMiddleware.js    # Multer config (image + doc)
├── models/
│   ├── Course.js              # Course Mongoose schema
│   └── User.js                # User Mongoose schema
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── courseRoutes.js        # /api/courses
│   ├── uploadRoutes.js        # /api/upload
│   └── userRoutes.js          # /api/users
├── uploads/
│   ├── images/                # Uploaded thumbnails
│   └── documents/             # Uploaded notes/docs
├── utils/
│   ├── apiResponse.js         # Standardized responses
│   └── generateToken.js       # JWT token generator
├── app.js                     # Express app setup
├── server.js                  # Entry point
├── .env.example               # Environment variable template
├── .gitignore
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/course_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Run the Server

```bash
# Development (with nodemon auto-restart)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 👥 User Roles & Permissions

| Action                  | Admin | Instructor | Student |
|-------------------------|-------|------------|---------|
| Register / Login        | ✅    | ✅         | ✅      |
| View All Courses        | ✅    | ✅         | ✅      |
| View Course Details     | ✅    | ✅         | ✅      |
| Create Course           | ✅    | ✅         | ❌      |
| Edit Any Course         | ✅    | ❌         | ❌      |
| Edit Own Course         | ✅    | ✅         | ❌      |
| Delete Any Course       | ✅    | ❌         | ❌      |
| Delete Own Course       | ✅    | ✅         | ❌      |
| Manage Users (CRUD)     | ✅    | ❌         | ❌      |
| Upload Files            | ✅    | ✅         | ❌      |

---

## 🔐 Authentication

All protected routes require a **Bearer Token** in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📡 API Endpoints

### 🔑 Auth Routes — `/api/auth`

| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | `/api/auth/register`  | Public  | Register new user    |
| POST   | `/api/auth/login`     | Public  | Login & get token    |
| POST   | `/api/auth/logout`    | Private | Logout (invalidate)  |

#### Register — `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "password": "password123",
  "role": "instructor"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "_id": "64abc...",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "role": "instructor",
    "token": "eyJhbGci..."
  }
}
```

#### Login — `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "rajesh@example.com",
  "password": "password123"
}
```

---

### 👤 User Routes — `/api/users` _(Admin Only)_

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/api/users`      | Get all users        |
| GET    | `/api/users/:id`  | Get single user      |
| POST   | `/api/users`      | Create new user      |
| PUT    | `/api/users/:id`  | Update user          |
| DELETE | `/api/users/:id`  | Delete user          |

---

### 📘 Course Routes — `/api/courses`

| Method | Endpoint             | Access                    | Description          |
|--------|----------------------|---------------------------|----------------------|
| GET    | `/api/courses`       | Public                    | Get all courses      |
| GET    | `/api/courses/:id`   | Public                    | Get single course    |
| POST   | `/api/courses`       | Admin, Instructor         | Create course        |
| PUT    | `/api/courses/:id`   | Admin, Instructor (own)   | Update course        |
| DELETE | `/api/courses/:id`   | Admin, Instructor (own)   | Delete course        |

#### Create Course — `POST /api/courses`

Use `multipart/form-data` to send files:

| Field         | Type   | Required | Description            |
|---------------|--------|----------|------------------------|
| `title`       | text   | Yes      | Course title           |
| `description` | text   | Yes      | Course description     |
| `category`    | text   | Yes      | Course category        |
| `price`       | number | No       | Default: 0             |
| `thumbnail`   | file   | No       | jpg, jpeg, png, webp   |
| `notes`       | file   | No       | pdf, doc, docx         |

---

### 📤 Upload Routes — `/api/upload` _(Admin, Instructor)_

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/upload/image`    | Upload single image      |
| POST   | `/api/upload/document` | Upload single document   |

**Upload Image** — form-data field name: `image`  
Allowed: `jpg`, `jpeg`, `png`, `webp` — Max size: 5MB

**Upload Document** — form-data field name: `document`  
Allowed: `pdf`, `doc`, `docx` — Max size: 10MB

---

## 📦 Standard Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful.",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description here."
}
```

---

## 🔢 HTTP Status Codes

| Code | Meaning                        |
|------|--------------------------------|
| 200  | OK — Success                   |
| 201  | Created — Resource created     |
| 400  | Bad Request — Validation error |
| 401  | Unauthorized — No/bad token    |
| 403  | Forbidden — Insufficient role  |
| 404  | Not Found — Resource missing   |
| 500  | Internal Server Error          |

---

## 🧪 Testing with Postman

1. Import the API endpoints above
2. Register a user → copy the `token` from the response
3. In Postman → Authorization tab → Bearer Token → paste the token
4. Test protected routes

---

## 🔒 Security Features

- ✅ Passwords hashed with **bcryptjs** (salt rounds: 10)
- ✅ JWT tokens with configurable expiry
- ✅ Bearer token authentication on all protected routes
- ✅ Role-based authorization middleware
- ✅ Environment variables with **dotenv** (no hardcoded secrets)
- ✅ CORS configured with allowed origins whitelist
- ✅ Multer file type filtering (no executable uploads)
- ✅ MongoDB injection-safe with Mongoose validation

---

## 👨‍💻 Author

Built by **Rajesh** — Full Stack MERN Developer  
Portfolio: [rajeshdesigner.netlify.app](https://rajeshdesigner.netlify.app)
