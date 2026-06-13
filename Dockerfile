FROM node:20-bookworm-slim AS frontend-build

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .

# Same-origin API when UI and backend share this Render URL
ARG VITE_API_URL=
ARG VITE_SITE_URL=https://malla-reddy-women-s-engineering-results.onrender.com
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

FROM mcr.microsoft.com/playwright/python:v1.60.0-jammy

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=10000

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /build/dist ./frontend/dist

EXPOSE 10000

CMD gunicorn server:app --bind 0.0.0.0:${PORT} --workers 1 --threads 4 --timeout 300
