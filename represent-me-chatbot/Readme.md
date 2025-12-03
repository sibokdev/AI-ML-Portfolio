#Virtual Representative Agent — Next Steps Guide

This project implements a **multi-agent architecture** using both **OpenAI** (for the Persona Agent) and **Gemini** (for the Evaluation Agent).  
You now have a working system where:

- **Agent 1 – VirtualMeAgent (OpenAI/gpt-4o-mini)**  
  Represents you professionally, using your summary + LinkedIn PDF.

- **Agent 2 – ResponseEvaluator (Gemini/2.0-flash)**  
  Validates the PersonaAgent’s answer and forces corrections when needed.

---

## Development Commands (UV Package Manager)
I decided to usee UV packagee manager because is a lot faster than pip. Give it a try.
### Install UV  
Documentation:  
https://docs.astral.sh/uv/getting-started/installation/

### Create environment + install dependencies
```bash
uv venv
uv pip install dotenv
uv pip install openai
uv pip install gradio
