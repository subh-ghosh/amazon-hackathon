FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++ libgomp1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Generate dataset and train the model during the build phase
RUN python training/generate_dataset.py
RUN python training/train_model.py

EXPOSE 8021

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8021"]
