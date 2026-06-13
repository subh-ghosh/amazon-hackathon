# Amazon Circular Intelligence OS: AI Intelligence Layer
## Truth Discovery Engine & Fraud & Trust Engine

This repository contains the production-grade codebase skeletons, API routes, AWS SDK integrations, and EventBridge contract files for the AI Intelligence Layer of the **Amazon Circular Intelligence OS**.

Developed to be fully operational within a 48-hour hackathon, this codebase features a dual-mode adapter architecture. By default, it operates in **Mock Mode** (`MOCK_AWS=true` and `MOCK_BEDROCK=true`), allowing developers to run, test, and demo all APIs locally without any cloud overhead. Setting them to `false` activates the live AWS connections to Bedrock, OpenSearch Serverless, Neptune, and DynamoDB.

---

## 🛠 Tech Stack
* **Web Framework**: Python 3.9+ & FastAPI
* **Visual/Semantic Reasoning**: AWS Bedrock (Claude 3.5 Sonnet)
* **Semantic Search**: Amazon OpenSearch Serverless (Vector Engine) & Titan Text Embeddings V2
* **Graph Network**: Amazon Neptune (Gremlin WebSockets client)
* **Databases**: AWS DynamoDB (Single-Table Design)
* **Event Routing**: AWS EventBridge (Boto3 payload emitter)
* **Containerization**: Docker

---

## 📂 Repository Folder Structure
```
amazon-circular-intelligence-os/
├── services/
│   ├── truth_discovery/          # Truth Discovery Engine Service (Port 8001)
│   │   ├── app/
│   │   │   ├── config.py         # AWS client initialization & settings
│   │   │   ├── schemas.py        # Pydantic Request/Response models
│   │   │   ├── routes.py         # API Endpoints (Bedrock + OpenSearch orchestrations)
│   │   │   └── services/
│   │   │       ├── bedrock_service.py      # LLM reasoning and Titan embeddings
│   │   │       └── opensearch_service.py   # Vector k-NN retrieval logic
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── fraud_trust/              # Fraud & Trust Engine Service (Port 8002)
│       ├── app/
│       │   ├── config.py         # AWS client initialization & settings
│       │   ├── schemas.py        # Pydantic Request/Response models
│       │   ├── routes.py         # Scoring endpoints (Graph + Vision + History logic)
│       │   └── services/
│       │       ├── bedrock_vision.py       # Claude 3.5 Multimodal inspection
│       │       ├── neptune_service.py      # Gremlin graph traversal check
│       │       └── dynamodb_service.py     # low-latency profile CRUD
│       ├── Dockerfile
│       └── requirements.txt
├── events/                       # EventBridge JSON Schema Event Contracts
│   ├── return_requested_event.json
│   ├── analysis_completed_event.json
│   └── fraud_scored_event.json
├── verification/                 # Integration test suite
│   └── test_integration.py
└── README.md                     # Setup and Developer Guide (This file)
```

---

## 🚀 Getting Started (Local Run)

### 1. Set Up Virtual Environment & Dependencies
```bash
# Clone the repository and navigate to the directory
cd "amazon hackathon ai ml"

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install requirements for both services
pip install -r services/truth_discovery/requirements.txt
pip install -r services/fraud_trust/requirements.txt
```

### 2. Run the Services Locally

#### Run Truth Discovery Engine
Exposes API documentation at: `http://localhost:8001/docs`
```bash
python services/truth_discovery/app/main.py
```

#### Run Fraud & Trust Engine
Exposes API documentation at: `http://localhost:8002/docs`
```bash
python services/fraud_trust/app/main.py
```

---

## 🧪 Running Automated Tests
We have built an integration test suite under `verification/` to ensure routing, parameter validations, and scoring heuristics work flawlessly out-of-the-box.
Run the tests using standard `unittest`:
```bash
python verification/test_integration.py
```

---

## 🐳 Docker Deployment
You can build and deploy these services as containers.

```bash
# Build & Run Truth Discovery Engine
docker build -t truth-discovery-service ./services/truth_discovery
docker run -p 8001:8001 truth-discovery-service

# Build & Run Fraud & Trust Engine
docker build -t fraud-trust-service ./services/fraud_trust
docker run -p 8002:8002 fraud-trust-service
```

---

## ⚡ Transitioning from Hackathon (Mock) to Production

To deploy these services live in your AWS environment, configure the following settings:

1. **Disable Mocks**: Set `MOCK_AWS=false` and `MOCK_BEDROCK=false` in your environment or ECS task definitions.
2. **Assign IAM Roles**: Ensure your Lambda or ECS Task execution role has the following AWS Permissions:
   - `bedrock:InvokeModel` (for Claude 3.5 and Titan Embeddings)
   - `aoss:APIAccessAll` (for OpenSearch Serverless queries)
   - `neptune-db:connect` & `neptune-db:ReadWrite` (for Neptune graph queries)
   - `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem` (for table writes)
   - `events:PutEvents` (to publish EventBridge events)
3. **Set Environment Variables**:
   ```env
   MOCK_AWS=false
   MOCK_BEDROCK=false
   AWS_DEFAULT_REGION=us-east-1
   DYNAMODB_TABLE=CircularIntelOSStore
   OPENSEARCH_ENDPOINT=YOUR_OPENSEARCH_COLLECTION_URL
   NEPTUNE_ENDPOINT=YOUR_NEPTUNE_CLUSTER_ENDPOINT
   EVENT_BUS_NAME=YOUR_EVENTBRIDGE_BUS_NAME
   ```
