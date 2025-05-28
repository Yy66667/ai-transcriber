# 🧠 AI Transcriber

AI Transcriber is a tool that helps transcribe audio files using a Node.js backend and a React frontend.

---

## 🚀 Setup Guide

### 🖥️ Frontend

```bash
cd ai-transcriber/frontend
npm install
npm run dev
```

---

### 🛠️ Backend

```bash
cd ai-transcriber/backend
npm install
cp .env.example .env
# Edit the .env file with valid API keys
```

Start the backend in development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🧹 Auto-Cleanup of Transcripts

Deletes transcript files older than 3 hours.

### 🔁 Set Up Cron

1. **Build the backend**:

```bash
npm run build
```

2. **Edit your crontab**:

```bash
crontab -e
```

3. **Add this line** (edit path as needed):

```cron
0 * * * * cd /home/username/Projects/ai-transcriber/backend/dist && /usr/bin/node cleanup.js >> /home/username/cleanup.log 2>&1
```

- Replace `/home/username/Projects/ai-transcriber/` with your actual path
- Replace `/usr/bin/node` with output of `which node`

---

## 🧪 Test Cleanup Script

```bash
cd backend/dist
node cleanup.js
```

Check logs:

```bash
cat /home/username/cleanup.log
```

---

## 📁 Structure

```
ai-transcriber/
├── frontend/
├── backend/
│   ├── transcripts/
│   ├── dist/
│   └── cleanup.js
```

---

## 📜 License

MIT

```

---

Let me know if you want it customized with your actual directory or Node path.
```
