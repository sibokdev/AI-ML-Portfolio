from dotenv import load_dotenv
from openai import OpenAI
from PyPDF2 import PdfReader
import gradio as gr

load_dotenv(override=True)
openai = OpenAI()

reader = PdfReader('me/linkedin.pdf')
linkedin = ''
for page in reader.pages:
    text = page.extract_text()
    if text:
        linkedin += text


print(linkedin)