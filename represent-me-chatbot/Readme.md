#Virtual Representative Agent — Next Steps Guide

This project implements a **multi-agent architecture** using both **OpenAI** (for the Persona Agent) and **Gemini** (for the Evaluation Agent).  
You now have a working system where:

- **Agent 1 – VirtualMeAgent (OpenAI/gpt-4o-mini)**  
  Represents you professionally, using your summary + LinkedIn PDF.

- **Agent 2 – ResponseEvaluator (Gemini/2.0-flash)**  
  Validates the PersonaAgent’s answer and forces corrections when needed.

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

### Run project
uv run app.py
