FROM python:3.10

WORKDIR /app

# Install system deps for building
RUN apt-get update && apt-get install -y \
    espeak-ng \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Install torch CPU first
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install llama-cpp with minimal features (faster build)
ENV CMAKE_ARGS="-DLLAMA_BLAS=OFF -DLLAMA_CUBLAS=OFF -DLLAMA_AVX=OFF -DLLAMA_AVX2=OFF -DLLAMA_F16C=OFF -DLLAMA_FMA=OFF"
RUN pip install --no-cache-dir llama-cpp-python==0.2.79

# Install gradio FIRST (separately)
RUN pip install --no-cache-dir gradio>=4.44.0

# Install vieneu AFTER gradio
RUN pip install --no-cache-dir vieneu

COPY app.py .
EXPOSE 7860
CMD ["python", "app.py"]
