#!/usr/bin/env python3
"""Quick check for Groq API setup"""
import os
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                v = v.strip().strip('"').strip("'")
                os.environ.setdefault(k.strip(), v)

api_key = os.environ.get("GROQ_API_KEY", "")

print("\n" + "="*60)
print("MediFlow - Groq API Check")
print("="*60 + "\n")

if not api_key or api_key == "YOUR_GROQ_API_KEY_HERE":
    print("❌ GROQ_API_KEY not configured\n")
    print("Please add your Groq API key to .env file:")
    print("1. Get key from: https://console.groq.com/keys")
    print("2. Edit .env and replace YOUR_GROQ_API_KEY_HERE with your key")
    print("3. Run this script again to verify\n")
    exit(1)

print("✓ GROQ_API_KEY is set")
print(f"  Key preview: {api_key[:10]}...{api_key[-4:]}\n")

# Try to import and initialize
try:
    from groq import Groq
    client = Groq(api_key=api_key)
    print("✓ Groq SDK imported successfully")
    
    # Try a simple test call
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Say 'API test successful' and nothing else."}],
            max_tokens=10
        )
        result = response.choices[0].message.content
        print(f"✓ API test successful: {result}")
        print("\n" + "="*60)
        print("✅ All checks passed! You're ready to test.")
        print("="*60)
        print("\nNext steps:")
        print("1. Start server: MOCK_MODE=false uvicorn main:app --reload")
        print("2. Run tests: python3 test_real_extraction.py\n")
    except Exception as e:
        print(f"✗ API call failed: {e}")
        print("\nPlease check:")
        print("- Is your API key valid?")
        print("- Do you have internet connection?")
        print("- Check rate limits at console.groq.com\n")
        exit(1)
        
except ImportError as e:
    print(f"✗ Failed to import Groq SDK: {e}")
    print("\nPlease run: pip install groq==0.13.0\n")
    exit(1)
