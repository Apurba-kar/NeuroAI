<div align="center">

<img src="https://img.shields.io/badge/NeuroAI-Medical%20Imaging%20Platform-6C63FF?style=for-the-badge&logo=brain&logoColor=white" alt="NeuroAI Banner"/>

# 🧠 NeuroAI

### AI-Powered Medical Imaging Analysis Platform

*Upload. Analyze. Diagnose. — Powered by Gemini AI & Cornerstone.js*

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)

---

## 🔍 Overview

**NeuroAI** is a full-stack clinical medical imaging platform that enables radiologists and clinicians to upload DICOM/medical images and receive AI-generated diagnostic analysis powered by **Google Gemini AI**. The platform supports full patient workflow management, including DICOM rendering, AI-assisted analysis, PDF report generation, and case archiving.

> ⚕️ *Intended for research and clinical decision support. Not a substitute for professional medical judgment.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖼️ **DICOM Viewer** | Interactive 3D/2D DICOM rendering powered by Cornerstone.js & VTK.js |
| 🤖 **AI Analysis** | Google Gemini AI analyzes medical images and generates structured clinical findings |
| 📄 **PDF Reports** | Auto-generated diagnostic reports via Puppeteer & Handlebars templates |
| 🔐 **Secure Auth** | JWT-based authentication with HTTP-only cookies and bcrypt password hashing |
| 📦 **Cloud Storage** | Medical image storage via Cloudinary with OCR via Tesseract.js |
| 🗂️ **Case Management** | Archive, retrieve, and manage patient analysis cases |
| 📬 **Email Notifications** | Password reset and account emails via Nodemailer |
| 💳 **Payments** | Subscription management powered by Stripe |
| 🛡️ **Security Hardened** | Helmet, rate limiting, XSS protection, HPP, and Mongo sanitization |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** + **TypeScript** | UI framework |
| **Vite 7** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **TanStack Query v5** | Server state management & caching |
| **Cornerstone.js v4** | DICOM image rendering |
| **VTK.js** | 3D volumetric visualization |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **Express 4** | REST API server |
| **MongoDB** + **Mongoose** | Database & ODM |
| **Google Gemini AI** | AI image analysis |
| **Puppeteer** | Headless PDF generation |
| **Cloudinary** | Image/file cloud storage |
| **Multer** + **Sharp** | File upload & image processing |
| **Tesseract.js** | OCR text extraction |
| **Stripe** | Payment processing |
| **JWT** + **bcryptjs** | Authentication & authorization |
| **Nodemailer** | Transactional emails |

---

## 🏗️ Architecture

```
NeuroAI/
├── frontend/          ← React + TypeScript SPA (Vite)
│   └── src/
│       ├── pages/     ← Route-level page components
│       ├── components/← Reusable UI components
│       ├── hooks/     ← Custom React hooks
│       └── utils/     ← Utility functions
│
└── backend/           ← Node.js + Express REST API
    └── src/
        ├── controllers/  ← Route handlers & business logic
        ├── models/        ← Mongoose data models
        ├── routes/        ← API route definitions
        ├── services/      ← External integrations (AI, email, etc.)
        ├── utils/         ← Shared utilities & error handling
        └── templates/     ← Handlebars email/PDF templates
```

### Data Flow

```
Client → React SPA → Axios → Express API → MongoDB
                                   ↓
                           Google Gemini AI
                                   ↓
                           Cloudinary / Puppeteer
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (or local MongoDB instance)
- **Google Gemini API** key
- **Cloudinary** account
- **Stripe** account (optional, for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/NeuroAI.git
   cd NeuroAI
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

**Start the backend server:**
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

**Start the frontend dev server** (in a separate terminal):
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Reference

All API routes are prefixed with `/api/v1`.

### Authentication — `/api/v1/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/signup` | Register a new user | Public |
| `POST` | `/login` | Login and receive JWT cookie | Public |
| `GET` | `/logout` | Clear auth cookie | Public |
| `POST` | `/forgotPassword` | Send password reset email | Public |
| `PATCH` | `/resetPassword/:token` | Reset password with token | Public |
| `PATCH` | `/updateMyPassword` | Change password | 🔒 Protected |

### Users — `/api/v1/user`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/me` | Get current user profile | 🔒 Protected |
| `PATCH` | `/updateMe` | Update profile info/photo | 🔒 Protected |
| `DELETE` | `/deleteMe` | Soft-delete account | 🔒 Protected |

### Analysis — `/api/v1/analysis`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/upload` | Upload & process a medical image | 🔒 Protected |
| `GET` | `/` | Get all analyses for current user | 🔒 Protected |
| `GET` | `/:id` | Get a specific analysis result | 🔒 Protected |
| `DELETE` | `/:id` | Delete an analysis case | 🔒 Protected |
| `PATCH` | `/:id/archive` | Archive an analysis case | 🔒 Protected |
| `PATCH` | `/:id/unarchive` | Unarchive an analysis case | 🔒 Protected |

### Reports — `/api/v1/results` & `/api/v1/analysis/:analysisId/results`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/:analysisId/results` | Download PDF report for an analysis | 🔒 Protected |

---



<div align="center">

**Built with ❤️ for the medical community**

*NeuroAI — Bringing AI to the clinic, one scan at a time.*

</div>
