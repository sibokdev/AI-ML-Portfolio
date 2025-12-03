# RAG Chatbot – AI-Powered Local Business Assistant

This project is an **AI-enhanced WhatsApp chatbot** that uses **Retrieval-Augmented Generation (RAG)** to provide intelligent answers about local businesses in *San Martín Texmelucan*.  
It combines **LLMs, embeddings, vector search, NLP filters, and WhatsApp automation**.

---

## Features

### AI / ML & NLP Capabilities
- **RAG pipeline** using OpenAI embeddings + LangChain.
- **Memory Vector Store** for fast similarity search.
- **Custom NLP filters** for:
  - categories  
  - services  
  - keywords  
  - zone/area detection  
  - cost range extraction  
- **Priority scoring** for ranking business results.
- **Custom prompts** for factual responses.
- **Conversational flow management** with multi-step dialogs.
- **AI-powered business registration flow.**

### 📱 WhatsApp Automation
- Uses `whatsapp-web.js` to:
  - read messages  
  - reply automatically  
  - generate QR code login  
  - handle conversation state  

---

## Installation
### 1️ Install Dependencies
```bash
npm install
```
### 2️ Set Your OpenAI API Key
Create a `.env` file:

```
OPENAI_API_KEY=your_key_here
```

### 3 Run the Bot
```bash
node index.js
```

Scan the QR code that appears in the console with the phone that will be the chatbot.

---

## Technologies Used

### AI / ML Stack
- **OpenAI GPT-4**
- **OpenAIEmbeddings**
- **LangChain**
- **MemoryVectorStore**
- **RAG Pipeline**
- **Prompt Engineering**

### Backend & Automation
- **Node.js**
- **whatsapp-web.js**
- **dotenv**
- **File-based database (JSON)**

### Extra Functional Logic
- Business registry flow
- Filters by:
  - category  
  - zone  
  - cost  
  - keywords  
  - priority  
- Geolocation fields (lat/long)

---

## Project Structure
```
index.js            # Main bot logic
negocios.json       # Database of local businesses
.env                # API key config
README.md           # Documentation
```

---

## Notes
- Only the number matched in the code receives responses (safety filter).
- Modify the business database in `negocios.json`.
- Modify relevance scoring logic in the RAG filter section.

---

##  Ideal Use Cases
- Local business directories  
- Tourism assistants  
- Municipality information bots  
- Customer service automation  
- Yellow Pages AI  

---
