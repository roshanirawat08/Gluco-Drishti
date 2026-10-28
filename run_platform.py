"""
Launch Script for GlucoDrishti Full-Stack Platform
Starts FastAPI server on port 8000 serving both the frontend UI and the AI backend.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print("  GlucoDrishti AI - Full-Stack Diabetic Care Platform")
    print("  Specialized for Pune, Maharashtra, India")
    print("=" * 65)
    print("  -> Web Interface:   http://localhost:8000")
    print("  -> API Health:      http://localhost:8000/api/health")
    print("  -> API Docs:        http://localhost:8000/docs")
    print("=" * 65)
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)