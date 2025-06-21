# ✨ Inkpad Live

Inkpad Live is a real-time collaborative Markdown editor where multiple users can write, preview, and manage documents together. It features secure JWT-based authentication, live editing via WebSockets, export options, user profiles, and role-based permissions – all wrapped in a sleek, responsive UI built with modern technologies.

---

## 🔧 Tech Stack

* **Frontend**: React + TypeScript, Tailwind CSS, React Router, Axios, React-Markdown, remark-gfm, Socket.IO Client
* **Backend**: Node.js, Express (v5), TypeScript, MongoDB (Mongoose), Socket.IO, JWT Authentication, Puppeteer (for PDF export), File System
* **Authentication**: JWT in HTTP-only cookies, backend validation, and frontend Axios interceptors

---

## 💡 Features

* 📝 Real-time collaborative Markdown editing with preview
* 🧠 GitHub-flavored Markdown support (GFM)
* 👥 Viewers and collaborators panel with socket updates
* 🔐 JWT-based auth with secure cookies
* 📤 Export as `.md` or `.pdf` using Puppeteer
* 🧑‍💻 Creator-managed collaborators
* ✍️ Profile editing with live checks
* 🗂️ Organized boards and document panels
* 💅 Sleek and responsive UI

---

## 📁 Folder Structure

```
Inkpad-Live/
├── client/               # Frontend (React)
│   ├── src/
│   ├── public/
│   └── vite.config.ts
├── server/               # Backend (Node + Express + TS)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── socket/
│   └── exports/          # Temporary files for export
├── README.md
└── .env
```

---

## 🚀 Deployment

* **Frontend**: [Vercel](https://vercel.com)
* **Backend**: [Railway](https://railway.app)
* **Live Site**: 🌍 [https://inkpad-live.vercel.app](https://inkpad-live.vercel.app)

---

## ⚙️ Scripts (`server/package.json`)

```json
"scripts": {
  "start": "ts-node src/index.ts",
  "dev": "nodemon --exec ts-node src/index.ts"
}
```

---

## 🧪 Getting Started

1. **Clone the repo**

```bash
git clone https://github.com/k-u-kiran01/Inkpad-Live.git
cd Inkpad-Live
```

2. **Setup Backend**

```bash
cd server
npm install
cp .env.example .env  # or manually create .env
npm run dev
```

`.env` format:

```
port=5000
db_url=mongodb+srv://<username>:<password>@cluster.mongodb.net/inkpad
jwt_secret_key=your_jwt_secret
jwt_expiry=3d
```

3. **Setup Frontend**

```bash
cd ../client
npm install
npm run dev
```

Navigate to `http://localhost:5173`

---

## 🔌 WebSocket Events

| Event Name             | Description                          |
| ---------------------- | ------------------------------------ |
| `join-doc`             | Join document room                   |
| `markdown-change`      | Send markdown content                |
| `receive-markdown`     | Receive updated markdown             |
| `update-viewers`       | Update viewers panel                 |
| `update-collaborators` | Collaborator permission changes      |
| `leave-doc`            | Triggered on tab close or navigation |

---

## 📡 Backend API Routes

| Method | Route                                         | Description                 |
| ------ | --------------------------------------------- | --------------------------- |
| POST   | `/api/auth/sign-up`                           | Register a new user         |
| POST   | `/api/auth/sign-in`                           | Login and get JWT           |
| GET    | `/api/auth/me`                                | Get current user info       |
| POST   | `/api/edit-details`                           | Edit username or email      |
| GET    | `/api/auth/check-username?username=xyz`       | Check username availability |
| GET    | `/api/auth/check-email?email=xyz@example.com` | Check email availability    |
| GET    | `/api/home/md/:userId`                        | Fetch user documents        |
| GET    | `/api/docs/md/:docId`                         | Get document contents       |
| POST   | `/api/docs/md/:docId/contributors`            | Add a collaborator          |
| DELETE | `/api/docs/md/:docId/contributors`            | Remove a collaborator       |
| GET    | `/api/docs/md/:docId/export/:format`          | Export as Markdown or PDF   |

---

## 📦 Dependencies (Backend)

```
Runtime:
- express
- mongoose
- dotenv
- jsonwebtoken
- cookie-parser
- marked
- puppeteer
- socket.io
- socket.io-client

Dev:
- typescript
- ts-node
- nodemon
- @types/node
- @types/jsonwebtoken
- @types/cookie-parser
- @types/bcryptjs
```

---

## 🧠 Future Improvements

* Version control & document history
* Offline editing support
* Google Drive / Dropbox export
* User avatars & profile pictures
* Theme toggle: Light/Dark mode

---

## 🛡️ License

MIT License
© 2025 [@k-u-kiran01](https://github.com/k-u-kiran01)

---

## 📬 Support & Suggestions
If you have any questions, feedback, or suggestions, feel free to reach out at udaykiran00701@gmail.com
