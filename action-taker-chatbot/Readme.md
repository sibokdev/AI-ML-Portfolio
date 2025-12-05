# Action taker chatbot

1. Create a virtual environment (Python 3.11)
uv venv --python 3.11
2. Activate env
.venv\Scripts\activate


I will create an app that uses docling for more professional data ingestion, orchestration with langchain, it will include tools using, tracing with langfuse.
The app will be dockerized in order to can be tested locally with all the integrations.

Tha main goal of this project is to generate a ingestion of documnts pipeline, integrate the document provided in the knowledge base, have a vector db.
Implement telemetry to inspect the llm calls in detail.

This should be a production ready app, ready to be deployed in any cloud provider.

Im thinking to configure a localstack container to simulate deployment into aws infra. Lets see what happens.