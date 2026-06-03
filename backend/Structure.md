```
src/
├── main.py
├── config.py
├── database.py
├── core/
│   ├── security.py
│   ├── exceptions.py
│   └── logging.py
├── auth/
│   ├── router.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   ├── repository.py
│   └── deps.py
├── users/
│   ├── router.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── repository.py
├── chat/
│   ├── router.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── sse.py
├── rag/
│   ├── router.py
│   ├── schemas.py
│   ├── service.py
│   └── orchestrator.py
├── ingestion/
│   ├── pipeline.py
│   ├── loaders/
│   ├── splitters/
│   └── jobs.py
├── knowledge_base/
│   ├── router.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── repository.py
├── api_keys/
│   ├── router.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── repository.py
├── providers/
│   ├── base.py
│   ├── factory.py
│   ├── openai.py
│   ├── anthropic.py
│   └── ollama.py
├── vectorstore/
│   ├── base.py
│   ├── pinecone.py
│   └── repository.py
└── prompts/
    ├── loader.py
    ├── chat_system.txt
    └── rag_answer.txt
```