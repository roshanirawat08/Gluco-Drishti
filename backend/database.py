"""
GlucoDrishti Database Module
SQLite persistence for patients, assessments, and Pune doctor bookings.
"""

import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "glucodrishti.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Patients table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            height REAL,
            weight REAL,
            bmi REAL,
            bmi_category TEXT,
            blood_group TEXT,
            location TEXT,
            diabetes_type TEXT,
            diabetes_duration TEXT,
            sugar_level TEXT,
            diseases TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Assessments table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            has_retina_scan BOOLEAN,
            has_nails_scan BOOLEAN,
            symptoms TEXT,
            clinical_notes TEXT,
            overall_risk INTEGER,
            risk_level TEXT,
            retinopathy_chance INTEGER,
            neuropathy_chance INTEGER,
            glycemic_chance INTEGER,
            nephro_chance INTEGER,
            ai_model TEXT,
            diagnosis_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        )
        """)

        # Appointments table (Pune Clinics)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT,
            doctor_id INTEGER,
            doctor_name TEXT,
            clinic_name TEXT,
            appointment_date TEXT,
            time_slot TEXT,
            consultation_type TEXT,
            status TEXT DEFAULT 'Confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()


def save_patient(data: dict) -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO patients (
            full_name, age, gender, height, weight, bmi, bmi_category,
            blood_group, location, diabetes_type, diabetes_duration,
            sugar_level, diseases
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get("fullName", "Anonymous Patient"),
            data.get("age"),
            data.get("gender"),
            data.get("height"),
            data.get("weight"),
            data.get("bmi"),
            data.get("bmiCategory"),
            data.get("bloodGroup"),
            data.get("location", "Pune, Maharashtra"),
            data.get("diabetesType"),
            data.get("diabetesDuration"),
            data.get("sugarLevel"),
            json.dumps(data.get("diseases", []))
        ))
        conn.commit()
        return cursor.lastrowid


def save_assessment(patient_id: int, result: dict, exam_data: dict) -> int:
    chances = result.get("chances", {})
    exams = exam_data.get("examinations", {})
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO assessments (
            patient_id, has_retina_scan, has_nails_scan, symptoms, clinical_notes,
            overall_risk, risk_level, retinopathy_chance, neuropathy_chance,
            glycemic_chance, nephro_chance, ai_model, diagnosis_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            patient_id,
            bool(exams.get("retinaImage")),
            bool(exams.get("nailsImage")),
            json.dumps(exams.get("symptoms", [])),
            exams.get("customSymptomsText", ""),
            chances.get("overall_risk", 70),
            chances.get("risk_level", "Moderate Risk"),
            chances.get("retinopathy_odds", 75),
            chances.get("neuropathy_odds", 60),
            chances.get("glycemic_odds", 70),
            chances.get("nephropathy_odds", 35),
            result.get("ai_model", "GlucoDrishti Clinical CV Engine"),
            json.dumps(result.get("clinical_diagnosis", {}))
        ))
        conn.commit()
        return cursor.lastrowid


def save_appointment(booking: dict) -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO appointments (
            patient_name, doctor_id, doctor_name, clinic_name,
            appointment_date, time_slot, consultation_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            booking.get("patientName", "Patient"),
            booking.get("doctorId", 1),
            booking.get("doctorName", "Pune Specialist"),
            booking.get("clinicName", "Pune Clinic"),
            booking.get("date", datetime.now().strftime("%Y-%m-%d")),
            booking.get("timeSlot", "10:00 AM"),
            booking.get("consultationType", "In-Clinic Visit (Pune)")
        ))
        conn.commit()
        return cursor.lastrowid


def get_recent_assessments(limit: int = 10):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT a.*, p.full_name, p.age, p.location, p.diabetes_type
        FROM assessments a
        JOIN patients p ON a.patient_id = p.id
        ORDER BY a.created_at DESC
        LIMIT ?
        """, (limit,))
        return [dict(row) for row in cursor.fetchall()]


def get_assessment_by_id(assessment_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT a.*, p.full_name, p.age, p.gender, p.bmi, p.location, p.diabetes_type, p.sugar_level
        FROM assessments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.id = ?
        """, (assessment_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def get_recent_appointments(limit: int = 10):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM appointments ORDER BY created_at DESC LIMIT ?
        """, (limit,))
        return [dict(row) for row in cursor.fetchall()]