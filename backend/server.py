"""
GlucoDrishti FastAPI Server Module Re-export
Ensures run_platform.py ("backend.server:app") loads seamlessly.
"""

from backend.sever import *
from backend.sever import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
