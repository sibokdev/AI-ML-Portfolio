from dotenv import load_dotenv
from openai import OpenAI
from PyPDF2 import PdfReader
import gradio as gr
import os
import json
import requests

load_dotenv(override=True)

def push(text):
    requests.post(
        "https://api.pushover.net/1/messages.json",
        data={
            "token": os.getenv("PUSHOVER_TOKEN"),
            "user": os.getenv("PUSHOVER_USER"),
            "message": text,
        }
    )


def record_user_details(email, name="Name not provided", notes="not provided"):
    push(f"Recording {name} with email {email} and notes {notes}")
    return {"recorded": "ok"}

def record_unknown_question(question):
    push(f"Recording {question}")
    return {"recorded": "ok"}

record_user_details_json = {
    "name": "record_user_details",
    "description": "Use this tool to record that a user is interested in being in touch and provided an email address",
    "parameters": {
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "description": "The email address of this user"
            },
            "name": {
                "type": "string",
                "description": "The user's name, if they provided it"
            }
            ,
            "notes": {
                "type": "string",
                "description": "Any additional information about the conversation that's worth recording to give context"
            }
        },
        "required": ["email"],
        "additionalProperties": False
    }
}

record_unknown_question_json = {
    "name": "record_unknown_question",
    "description": "Always use this tool to record any question that couldn't be answered as you didn't know the answer",
    "parameters": {
        "type": "object",
        "properties": {
            "question": {
                "type": "string",
                "description": "The question that couldn't be answered"
            },
        },
        "required": ["question"],
        "additionalProperties": False
    }
}

tools = [{"type": "function", "function": record_user_details_json},
        {"type": "function", "function": record_unknown_question_json}]

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
    def handle_tool_calls(tool_calls):
        results = []
        for tool_call in tool_calls:
            tool_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)
            print(f"Tool called: {tool_name}", flush=True)
            tool = globals().get(tool_name)
            result = tool(**arguments) if tool else {}
            results.append({"role": "tool","content": json.dumps(result),"tool_call_id": tool_call.id})
        return results
    def build_messages(self, user_message, history):
        system = self.system_prompt
        messages = [{"role": "system", "content": system}] + history
        messages.append({"role": "user", "content": user_message})
        return messages 

    def chat(self, user_message, history):
        messages = self.build_messages(user_message, history)
        done = False
        while not done:
            response = self.openai.chat.completions.create(model="gpt-4o-mini", messages=messages, tools=tools)
            if response.choices[0].finish_reason=="tool_calls":
                message = response.choices[0].message
                tool_calls = message.tool_calls
                results = self.handle_tool_calls(tool_calls)
                messages.append(message)
                messages.extend(results)
            else:
                done = True
        return response.choices[0].message.content

if __name__ == "__main__":
    agent = VirtualMeAgent(
        name="Alfredo Suarez",
        pdf_path="me/linkedin.pdf",
        txt_path="me/summary.txt"
    )

    gr.ChatInterface(agent.chat, type="messages").launch()