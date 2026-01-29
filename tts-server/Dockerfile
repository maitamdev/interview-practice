FROM python:3.10-slim

WORKDIR /app

RUN pip install --no-cache-dir edge-tts gradio>=4.44.0

COPY app.py .

EXPOSE 7860

CMD ["python", "app.py"]
