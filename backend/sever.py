"""
GlucoDrishti FastAPI Server
Primary Full-Stack API service powering AI Diabetic Retinopathy Triage in Pune, Maharashtra.
Serves frontend UI, AI analysis endpoints, and SQLite database persistence.
"""

import os
import sys
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Any

# Add current dir to sys.path
sys.path.insert(0, os.path.dirname(__file__))

import database
import ai_engine

# Initialize database on launch
database.init_db()

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app = FastAPI(
    title="GlucoDrishti AI Platform",
    description="Full-Stack AI Diabetic Health & Retinopathy Triage Platform (Pune, Maharashtra)",
    version="1.1.0"
)

# Enable CORS for cross-origin frontend testing & mobile tunnels
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class PersonalProfile(BaseModel):
    fullName: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    bmiCategory: Optional[str] = None
    bloodGroup: Optional[str] = None
    location: Optional[str] = "Pune, Maharashtra"
    diabetesType: Optional[str] = "Type 2 Diabetes"
    diabetesDuration: Optional[str] = "5 to 10 years"
    sugarLevel: Optional[str] = None
    diseases: Optional[List[str]] = []
    otherDiseaseText: Optional[str] = None


class ExaminationData(BaseModel):
    retinaImage: Optional[str] = None
    retinaFileName: Optional[str] = None
    nailsImage: Optional[str] = None
    nailsFileName: Optional[str] = None
    symptoms: Optional[List[str]] = []
    customSymptomsText: Optional[str] = None


class AssessmentRequest(BaseModel):
    personal: PersonalProfile
    examinations: ExaminationData


class AppointmentRequest(BaseModel):
    patientName: str
    doctorId: Optional[int] = 1
    doctorName: str
    clinicName: str
    date: str
    timeSlot: str
    consultationType: Optional[str] = "In-Clinic Visit (Pune)"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    patientContext: Optional[dict] = None


# --------------------------------------------------------------------------
# Frontend Static File Serving (Unified Full-Stack App)
# --------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
def serve_frontend_index():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "GlucoDrishti API is running. index.html not found."}


@app.get("/styles.css", include_in_schema=False)
def serve_styles_css():
    css_path = os.path.join(FRONTEND_DIR, "styles.css")
    return FileResponse(css_path, media_type="text/css")


@app.get("/app.js", include_in_schema=False)
def serve_app_js():
    js_path = os.path.join(FRONTEND_DIR, "app.js")
    return FileResponse(js_path, media_type="application/javascript")


# --------------------------------------------------------------------------
# API Endpoints
# --------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    ai_status = "Gemini Vision Active" if ai_engine.GEMINI_API_KEY else "Clinical Computer Vision Engine Active"
    return {
        "status": "healthy",
        "platform": "GlucoDrishti AI",
        "database": "connected (SQLite)",
        "ai_engine": ai_status,
        "region": "Pune, Maharashtra, India"
    }


@app.post("/api/analyze")
def analyze_assessment(payload: AssessmentRequest):
    try:
        patient_dict = payload.personal.model_dump()
        exam_dict = payload.examinations.model_dump()

        # Run AI multimodal diagnosis
        analysis_result = ai_engine.run_diabetic_analysis(patient_dict, exam_dict)

        # Save to SQLite
        patient_id = database.save_patient(patient_dict)
        assessment_id = database.save_assessment(
            patient_id,
            analysis_result,
            {"examinations": exam_dict}
        )

        analysis_result["assessment_id"] = assessment_id
        analysis_result["patient_id"] = patient_id
        return analysis_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(e)}")


@app.post("/api/book-appointment")
def book_appointment(booking: AppointmentRequest):
    try:
        booking_id = database.save_appointment(booking.model_dump())
        return {
            "status": "success",
            "message": f"Appointment booked successfully with {booking.doctorName} in Pune!",
            "booking_id": booking_id,
            "details": booking.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking error: {str(e)}")


@app.post("/api/chat")
def chat_with_specialist(payload: ChatRequest):
    """
    Direct endpoint for GlucoDrishti AI Assistant (Diabetic Specialist).
    Provides clinical education, diabetic diet recommendations, retinopathy guidance,
    and emergency hypoglycemia protocols for Pune patients.
    """
    try:
        history_list = [h.model_dump() for h in (payload.history or [])]
        reply_data = ai_engine.chat_with_diabetic_specialist(
            user_message=payload.message,
            history=history_list,
            patient_context=payload.patientContext or {}
        )
        return reply_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.get("/api/assessments")
def get_assessments(limit: int = 10):
    return {
        "count": limit,
        "assessments": database.get_recent_assessments(limit)
    }


@app.get("/api/assessment/{assessment_id}")
def get_assessment(assessment_id: int):
    data = database.get_assessment_by_id(assessment_id)
    if not data:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return data


@app.get("/api/appointments")
def get_appointments(limit: int = 10):
    return {
        "count": limit,
        "appointments": database.get_recent_appointments(limit)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)