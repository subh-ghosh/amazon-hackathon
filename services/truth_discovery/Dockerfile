FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

EXPOSE 8001

ENV PYTHONPATH=/app
ENV MOCK_AWS=true
ENV MOCK_BEDROCK=true

CMD ["python", "app/main.py"]
