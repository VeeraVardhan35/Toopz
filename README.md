# Toopz

<div align="center">

**A Modern Full-Stack SaaS Platform for Social Collaboration**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://toopz-1.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Live Demo](https://toopz-1.onrender.com/) • [Features](#features) • [Installation](#installation) • [API Documentation](#api-documentation)

</div>

---

## 📖 Overview

Toopz is a production-ready full-stack SaaS platform built for social collaboration.  
It combines a modern frontend with a robust backend, real-time communication, and secure authentication.  

**Key Highlights:**
- Real-time updates via Socket.IO
- Redis caching for performance
- Cloudinary integration for media
- JWT-based authentication
- Modular and scalable architecture
- Developer-friendly codebase

---

## ✨ Features

### Authentication & User Management
- JWT authentication with refresh tokens
- User profile management
- Password hashing and secure sessions

### Content Management
- Posts CRUD with media support
- Groups & communities with role-based permissions
- Pagination and infinite scroll

### Real-Time Messaging
- One-on-one and group chats
- Typing indicators, read receipts, online/offline status
- Media attachments in messages

### Media Management
- Cloudinary integration for optimized image/video storage
- File validation and upload tracking

### Admin Features
- Admin dashboard for user & content moderation
- University verification workflow

### Performance & Optimization
- Redis caching
- Connection pooling & query optimization with Drizzle ORM
- SSL-enabled database connections

### UI & UX
- Mobile-first responsive design with Tailwind CSS
- Dark mode support
- Optimistic UI updates & error handling

### Notifications & Emails
- Real-time in-app notifications
- Transactional emails and verification flows

---

## 🏗️ Tech Stack

**Backend:** Node.js, Express, PostgreSQL (Neon/Supabase), Drizzle ORM, Redis, Socket.IO, Cloudinary, JWT  
**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client  

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v8+
- PostgreSQL v14+ (or cloud instance)
- Redis (local or Upstash)
- Cloudinary account

### Installation

1. Clone the repo
```bash
git clone https://github.com/yourusername/toopz.git
cd toopz
