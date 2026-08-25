# 📄 Native AI Projects — FOLIO

> Bilingual PDF desk: upload a document, chunk it, store embeddings in pgvector and stream cited answers, painted in the ividi.dev palette (black, burnt orange, amber).

[🐞 Report Bug](https://github.com/VidiPT89/NativeAIProjects/issues) · [✨ Request Feature](https://github.com/VidiPT89/NativeAIProjects/issues)

FOLIO is a Next.js desk for talking to your own PDFs. You drop a file, the text is split into overlapping chunks, each chunk becomes a vector, and PostgreSQL with pgvector returns the closest passages. The answer streams into the chat with page citations. The UI is European Portuguese / English, with the language toggle remembered in `localStorage`.

Without `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, embeddings and answers use a local lexical index so the desk still runs on a laptop. With a key, official embeddings (`text-embedding-3-small`) and the chosen chat model take over.

## ✨ Main Features

- 📤 **PDF upload** — drop a file or pick one from disk
- 🧩 **Chunking + embeddings** — overlapping blocks stored as 1536-dimension vectors
- 🗄️ **pgvector** — similarity search inside PostgreSQL
- 🔎 **Relevant context** — only the closest passages go into the prompt
- 🌊 **Streamed answers** — tokens arrive live, with cited pages
- 🌍 **PT / EN toggle** — remembered in `localStorage`
- 🎬 **Motion** — ember glow, sheet desk and chat reveal

## 🛠️ Technologies

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-0.8-4169E1?style=flat&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **App** | Next.js App Router | Pages and API routes |
| **Data** | Prisma + PostgreSQL + pgvector | Documents, chunks and cosine search |
| **Models** | OpenAI or Anthropic (optional) | Embeddings and streamed chat |
| **PDF** | unpdf | Text extraction |
| **Motion** | Framer Motion | Landing and chat reveal |

## 🧱 Project Structure

```text
NativeAIProjects/
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── i18n/
│   └── lib/
├── tests/
├── LICENSE
└── README.md
```

## ▶️ How to Run

### Prerequisites

- **Node.js** 18+
- **Docker** (PostgreSQL 16 + pgvector on port 55438)

### Installation

```bash
git clone https://github.com/VidiPT89/NativeAIProjects.git
cd NativeAIProjects
cp .env.example .env
docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To use a hosted model, set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env`. `AI_MODEL` defaults to `gpt-4o-mini`.

## 📖 Usage

1. Toggle **PT** or **EN** in the header.
2. Open the desk and upload a PDF (or use the seeded sample).
3. Pick one document or search across all of them.
4. Ask a question and read the streamed answer with page sources.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST | `/api/documents` | List documents or upload a PDF |
| DELETE | `/api/documents/:id` | Remove a document and its chunks |
| POST | `/api/chat` | Retrieve context and stream the answer |

## 🧪 Testing

```bash
npm test
```

`node:test` checks chunking across page breaks and that lexical embeddings rank a matching query above noise.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Developed by **David Arsénio Martins**  
🌐 [ividi.dev](https://ividi.dev/) · 💻 [github.com/VidiPT89](https://github.com/VidiPT89/)
