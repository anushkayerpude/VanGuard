# VANGUARD Deployment Guide: Vercel & Render

VANGUARD can be deployed in minutes on **Vercel** (frontend static site with client-side mock fallback) and **Render** (fullstack frontend + Node fusion backend).

---

## Option 1: Deploy on Vercel (Frontend & C2 Console)

VANGUARD includes native Vercel configuration (`vercel.json`) with SPA history rewrites, immutable asset caching, and autonomous client-side scenario simulation.

### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import Git Repository** and select `VanGuard`.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. (Optional) Set Environment Variables:
   - `VITE_API_URL`: URL to your live backend (e.g. `https://vanguard-api.onrender.com`).
   - `VITE_WS_URL`: WebSocket URL to your live backend (e.g. `wss://vanguard-api.onrender.com/stream`).
   *Note: If these variables are not provided, VANGUARD seamlessly operates in its high-fidelity mock engine mode — all 8 operational scenarios, map interactions, FAISS spatial queries, and threat posture updates run autonomously with zero network lag.*
5. Click **Deploy**.

---

## Option 2: Deploy on Render (Fullstack Frontend + Backend)

VANGUARD includes a ready-to-use Render Blueprint (`render.yaml`) that provisions both services automatically.

### Automated Blueprint Deployment:
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\to$ **Blueprint**.
3. Select this repository (`anushkayerpude/VanGuard`).
4. Render will automatically detect `render.yaml` and configure:
   - **`vanguard-ui`**: Static Site building from `./dist` with SPA routing rewrites.
   - **`vanguard-api`**: Node Web Service building from `server/` with TypeScript compilation.
5. Click **Apply**.

### Manual Render Deployment (Alternative):

#### A. Backend Web Service (`vanguard-api`):
- **Environment**: Node
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: `10000` (Render default)
  - `NODE_ENV`: `production`
  - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key.
  - `OLLAMA_HOST`: *(Optional)* Local Ollama endpoint if running an edge sidecar.

#### B. Frontend Static Site (`vanguard-ui`):
- **Environment**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite Rules**:
  - `/*` $\to$ `/index.html` (Status: `Rewrite`)
- **Environment Variables**:
  - `VITE_API_URL`: `https://vanguard-api.onrender.com`

---

## Local Verification Commands

Before pushing or deploying, verify locally:

```bash
# 1. Build both client and server
npm run build:all

# 2. Run all frontend & backend tests
npm test
npm --prefix server test

# 3. Preview client production bundle
npm run preview
```
