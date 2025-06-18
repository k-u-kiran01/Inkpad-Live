# ✨ Inkpad Live

Inkpad Live is a real-time collaborative markdown editor where multiple users can write, preview, and manage documents together. It features secure JWT-based authentication, live editing via WebSockets, export options, user profiles, and role-based permissions – all wrapped in a sleek, responsive UI built with modern technologies.

---

## 🔧 Tech Stack

- **Frontend**: React + TypeScript, Tailwind CSS, React Router, Axios, React-Markdown, remark-gfm, Socket.IO client
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT Authentication, Puppeteer (for PDF export), File system module (for markdown/pdf export)
- **Authentication**: JWT (stored in HTTP-only cookies), with backend validation and frontend Axios interceptors

---

## 💡 Features

- Real-time markdown editing with live preview
- GitHub-flavored markdown support
- Viewers and collaborators panel with dynamic socket updates
- Document creator can add/remove collaborators
- Export as `.md` or `.pdf` (styled HTML converted to PDF using Puppeteer)
- Auth system with login, signup, and JWT
- Profile editing with instant availability checks for username/email
- Organized boards and multiple document handling
- Clean, responsive UI with TailwindCSS

---

## 📁 Folder Structure

```

Inkpad-Live/
├── client/               # Frontend (React)
│   ├── src/
│   ├── public/
│   └── vite.config.ts
├── server/               # Backend (Node + Express)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── socket/
│   └── exports/          # Folder for temp PDF/Markdown files
├── README.md
└── .env

````

---

## 🧪 Usage

1. **Clone the repo**

```bash
git clone https://github.com/k-u-kiran01/Inkpad-Live.git
cd Inkpad-Live
````

2. **Setup backend**

```bash
cd server
npm install
cp .env.example .env  # add your environment variables
npm run dev            # or npm start for production
```

`.env` should include:

```
port=5000
db_url=<your-mongodb-uri>
jwt_secret_key=<your-secret>
jwt_expiry=3d
```

3. **Setup frontend**

```bash
cd ../client
npm install
npm run dev
```

Visit `http://localhost:5173` for the frontend.

---

## 🔌 WebSocket Events

* `join-doc` → Join a document room
* `markdown-change` → Send markdown content to others
* `receive-markdown` → Receive content updates
* `update-viewers` → Viewer panel refresh
* `update-collaborators` → Collaborator permission changes
* `leave-doc` → On tab close or route change

---

## ⚙️ Backend Routes

* `POST /api/auth/sign-up` – Register user
* `POST /api/auth/sign-in` – Login and receive token
* `GET /api/auth/me` – Get current user from token
* `POST /api/edit-details` – Edit user profile
* `GET /api/auth/check-username` – Check username availability
* `GET /api/auth/check-email` – Check email availability
* `GET /api/home/md/:userId` – Fetch user’s docs
* `GET /api/docs/md/:docId` – Fetch document content
* `POST /api/docs/md/:docId/contributors` – Add collaborator
* `DELETE /api/docs/md/:docId/contributors` – Remove collaborator
* `GET /api/docs/md/:docId/export/:format` – Export as PDF or Markdown

---

## 🧠 Future Improvements

* Document version history and restore
* Offline editing with sync
* Image/file upload support in markdown
* Theme customization (light/dark)
* GitHub/Google OAuth
* Real-time cursor tracking

---

## 🛡️ License

MIT License
Copyright © 2025
Developed by [@k-u-kiran01](https://github.com/k-u-kiran01)

---

**Deploy Status**
Frontend: Vercel
Backend: Render / VM or manual hosting
Database: MongoDB Atlas (free tier)
