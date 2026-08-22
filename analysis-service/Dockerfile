FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    WORKSPACE_ROOT=/app/workspaces \
    ANALYSIS_SERVICE_HOST=0.0.0.0 \
    ANALYSIS_SERVICE_PORT=8765 \
    CORS_ORIGINS=http://localhost:3000

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY contracts ./contracts
COPY scripts ./scripts
COPY tests ./tests

RUN mkdir -p /app/workspaces

EXPOSE 8765

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8765"]
