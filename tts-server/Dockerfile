FROM python:3.12-slim

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y \
    espeak-ng \
    libespeak-ng1 \
    ffmpeg \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create user for HF Spaces
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /app

# Copy requirements first for caching
COPY --chown=user requirements.txt .

# Install Python dependencies with increased timeout
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --timeout 600

# Pre-download VieNeu model during build
RUN python -c "from vieneu import Vieneu; print('Pre-loading model...'); Vieneu(); print('Model cached!')" || true

# Copy application code
COPY --chown=user . .

# Expose port
EXPOSE 7860

# Run the server
CMD ["python", "main.py"]
