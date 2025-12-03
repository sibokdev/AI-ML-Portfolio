from dotenv import load_dotenv
from openai import OpenAI
from PyPDF2 import PdfReader
import gradio as gr

load_dotenv(override=True)

class VirtualMeAgent:
    def __init__(self, name: str, pdf_path: str, txt_path: str):
        self.name = name
        self.openai = OpenAI()

        # Read PDF
        reader = PdfReader(pdf_path)
        self.linkedin = "".join([p.extract_text() or "" for p in reader.pages])

        # Read summary
        with open(txt_path, "r", encoding="utf-8") as f:
            self.summary = f.read()

        # Build system prompt
        self.system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        sp = (
            f"You are acting as {self.name}. You answer questions on behalf of {self.name}, "
            f"focused on career, background, skills, and experience. Your responses must be "
            f"professional and engaging, as if speaking to a potential employer. "
            f"If you don't know something, say so.\n\n"
            f"## Summary:\n{self.summary}\n\n"
            f"## LinkedIn Profile:\n{self.linkedin}\n\n"
            f"Stay fully in character during the conversation."
        )
        return sp

    def build_messages(self, user_message, history, force_pig_latin=False):
        system = self.system_prompt

        if force_pig_latin:
            system += "\n\nIMPORTANT: You MUST answer entirely in pig latin."

        messages = [{"role": "system", "content": system}] + history
        messages.append({"role": "user", "content": user_message})

        return messages

    def chat(self, user_message, history):
        pig_latin = "patent" in user_message.lower()
        messages = self.build_messages(user_message, history, pig_latin)

        response = self.openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return response.choices[0].message.content

agent = VirtualMeAgent(
    name="Alfredo Suarez",
    pdf_path="me/linkedin.pdf",
    txt_path="me/summary.txt"
)

def chat(message, history):
    reply = agent.chat(message, history)
    return reply


gr.ChatInterface(chat, type="messages").launch()