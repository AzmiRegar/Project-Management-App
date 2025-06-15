# 📁 Project Management App

A collaborative and modern project management application built with **Next.js**, **Prisma**, **PostgreSQL**, and **Tailwind CSS**.

Dengan aplikasi ini, kamu bisa membuat project, mengatur task secara visual dengan kanban board (TODO, IN_PROGRESS, DONE), mengundang member ke project, serta melihat analisis tugas dalam bentuk chart.

---

## ✨ Fitur Utama

- ✅ Autentikasi JWT (login & register)
- ✅ Role-based Access (Owner & Member)
- ✅ Tambah, edit, dan hapus project
- ✅ Undang user lain ke dalam project
- ✅ Tambah task ke dalam project
- ✅ Kanban-style board (drag & drop antar status)
- ✅ Statistik tugas (Chart per status)
- ✅ UI bersih dan responsif
- ✅ Dashboard ringkasan project dan task
- ✅ Realtime support siap pakai (Socket-ready)

---

## 🚀 Teknologi Digunakan

Frontend: **Next.js 15**, **React 19**, **Tailwind CSS**  
Backend: **Next.js API Routes**, **Prisma ORM**  
Database: **PostgreSQL**  
Authentication: **JWT (JSON Web Token)**  
UI: **ShadCN UI**, **Lucide Icons**  
Analytics: **Chart.js**

---

## ⚙️ Cara Instalasi dan Menjalankan Project

### 1. Clone Repository

git clone https://github.com/AzmiRegar/Project-Management-App.git
cd project-management-app

### 2. Install Dependencies
bash
npm install
### 3. Setup File Environment
Buat file .env di root project, atau salin dari .env.example:
Isi dengan variabel yang sesuai, misalnya:

DATABASE_URL="postgresql://postgres:<password>@localhost:5432/management_app"
JWT_SECRET="your-secret-key"
Ganti <password> dan your-secret-key sesuai konfigurasi lokal kamu.

### 4. Setup Database Prisma
# Generate Prisma Client
npx prisma generate

# Inisialisasi dan migrasi schema ke database
npx prisma migrate dev --name init

### 5. Jalankan Aplikasi
npm run dev
Buka di browser: http://localhost:3000

📂 Struktur Folder
src/app/ – App Router & API

src/components/ – Komponen UI (Sidebar, Modal, dll)

src/lib/ – Helper seperti JWT & Prisma

prisma/schema.prisma – Definisi Database

public/ – Aset statis seperti gambar

.env.example – Contoh konfigurasi environment
