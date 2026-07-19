import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
if not os.environ.get("GEMINI_API_KEY") and os.environ.get("GOOGLE_API_KEY"):
    os.environ["GEMINI_API_KEY"] = os.environ["GOOGLE_API_KEY"]

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
