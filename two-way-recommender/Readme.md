# 2-Way Recommender System  
A lightweight AI-powered recommendation engine that matches **profiles ↔ jobs** using embeddings, semantic search, and feedback loops.  
Backend built with **Python + Flask + FAISS + UV**.  
Frontend powered by **Node + Vite**.

---

## Development Setup

This project uses **UV** — a modern, extremely fast alternative to pip + venv.  
Highly recommended for Python development.

UV Documentation:  
https://docs.astral.sh/uv/getting-started/installation/

---

## Backend Setup (Python + UV)

### 1. Create a virtual environment (Python 3.11)
```bash
uv venv --python 3.11

### 2. Activate env
```bash
.venv\Scripts\activate

### 3. Install dependecies 
uv sync

### 4. Run project 
uv run flask run

### The API will start in:
http://127.0.0.1:5000

## Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev

### Front end runs at
http://localhost:5173