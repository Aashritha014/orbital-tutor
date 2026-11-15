# Orbital Tutor

3D and AI-based chemistry tutor for electronic configuration. The AI tutor uses Google Gemini (free tier) or OpenAI through a small Express server, so your API key is never exposed in the browser.

## Run in VS Code
Requires Node.js 18 or newer (check with `node -v`).

1. Open this folder in VS Code (File > Open Folder).
2. Copy `.env.example` to a new file named `.env` and paste a key. For the free option, get a Gemini key at https://aistudio.google.com (Get API key) and set:
   ```
   GEMINI_API_KEY=your-key
   ```
   Or use OpenAI (paid) with `OPENAI_API_KEY=sk-...`. If both are set, Gemini is used.
3. Open the terminal (Ctrl+`) and run:
   ```
   npm install
   npm start
   ```
4. Open http://localhost:3000 in your browser.

Never commit `.env` (it is already in `.gitignore`).

## Structure
- `server.js`: Express server and the `/api/chat` AI proxy (Gemini or OpenAI)
- `public/index.html`: the whole front end (3D orbitals, practice, quiz, periodic table, chat)
# orbital-tutor
