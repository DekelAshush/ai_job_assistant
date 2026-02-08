# Official Playwright image includes Chromium + system deps (no root needed at build).
# Match this tag to the playwright version in requirements.txt.
FROM mcr.microsoft.com/playwright/python:v1.49.0-noble

WORKDIR /app

# Install Python deps (playwright package is installed here; browsers come from base image).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Render sets PORT at runtime.
ENV PORT=8000
EXPOSE $PORT

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
