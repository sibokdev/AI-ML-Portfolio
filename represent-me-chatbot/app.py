from dotenv import load_dotenv
from openai import OpenAI
from PyPDF2 import PdfReader
import gradio as gr
from pydantic import BaseModel
import os

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

class Evaluation(BaseModel):
    is_acceptable: bool
    feedback: str


class ResponseEvaluator:
    def __init__(self, virtual_me_agent: VirtualMeAgent):
        self.virtual_me_agent = virtual_me_agent

        self.client = OpenAI(
            api_key=os.getenv("GOOGLE_API_KEY"),
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        # Prepare evaluation system prompt
        self.evaluator_system_prompt = self._build_evaluator_prompt()

    def _build_evaluator_prompt(self):
        return (
            f"You are an evaluator ensuring the agent correctly represents {self.virtual_me_agent.name}. "
            f"Evaluate whether the agent's latest answer is correct, professional, and aligned. "
            f"Provide JSON with is_acceptable and feedback.\n\n"
            f"## Summary:\n{self.virtual_me_agent.summary}\n\n"
            f"## LinkedIn:\n{self.virtual_me_agent.linkedin}\n\n"
        )

    def _build_user_prompt(self, reply, user_msg, history):
        return (
            f"Conversation:\n{history}\n\n"
            f"User message:\n{user_msg}\n\n"
            f"Agent response:\n{reply}\n\n"
            f"Evaluate the response."
        )

    def evaluate(self, reply, user_msg, history):
        messages = [
            {"role": "system", "content": self.evaluator_system_prompt},
            {"role": "user", "content": self._build_user_prompt(reply, user_msg, history)}
        ]

        response = self.client.beta.chat.completions.parse(
            model="gemini-2.0-flash",
            messages=messages,
            response_format=Evaluation
        )

        return response.choices[0].message.parsed

    def rerun(self, reply, user_msg, history, feedback):
        updated_system = (
            self.virtual_me_agent.system_prompt
            + "\n\n## Previous answer was rejected\n"
            f"Attempted answer:\n{reply}\n\n"
            f"Reason:\n{feedback}\n"
        )

        messages = [{"role": "system", "content": updated_system}] + history
        messages.append({"role": "user", "content": user_msg})

        openai = self.virtual_me_agent.openai
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )

        return response.choices[0].message.content

agent = VirtualMeAgent(
    name="Alfredo Suarez",
    pdf_path="me/linkedin.pdf",
    txt_path="me/summary.txt"
)


evaluator = ResponseEvaluator(virtual_me_agent=agent)


def chat(message, history):
    reply = agent.chat(message, history)
    eval_result = evaluator.evaluate(reply, message, history)

    if eval_result.is_acceptable:
        print("Passed evaluation")
        return reply

    print("Failed evaluation — retrying")
    print("Feedback:", eval_result.feedback)

    corrected = evaluator.rerun(reply, message, history, eval_result.feedback)
    return corrected

gr.ChatInterface(chat, type="messages").launch()