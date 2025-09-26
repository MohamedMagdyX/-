# إعدادات خدمة تحليل الصور بالذكاء الاصطناعي
# Configuration for AI Image Analysis Service

import os
from pathlib import Path
from typing import Dict, List, Any

# مسارات الملفات
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR = BASE_DIR / "logs"

# إنشاء المجلدات المطلوبة
for directory in [UPLOAD_DIR, OUTPUT_DIR, MODELS_DIR, LOGS_DIR]:
    directory.mkdir(exist_ok=True)

# إعدادات API
API_CONFIG = {
    "title": "Safe Egypt AI - خدمة تحليل الصور",
    "description": "نظام تحليل الصور الهندسية بالذكاء الاصطناعي للكود المصري للحريق",
    "version": "1.0.0",
    "host": "0.0.0.0",
    "port": 8000,
    "debug": True
}

# إعدادات قاعدة البيانات
DATABASE_CONFIG = {
    "url": os.getenv("DATABASE_URL", "sqlite:///./safe_egypt_ai.db"),
    "echo": False
}

# إعدادات Redis للتخزين المؤقت
REDIS_CONFIG = {
    "host": os.getenv("REDIS_HOST", "localhost"),
    "port": int(os.getenv("REDIS_PORT", 6379)),
    "db": 0,
    "decode_responses": True
}

# إعدادات نماذج الذكاء الاصطناعي
AI_MODELS = {
    "object_detection": {
        "model_name": "yolov8n.pt",
        "confidence_threshold": 0.5,
        "iou_threshold": 0.45
    },
    "ocr": {
        "primary": "paddleocr",  # paddleocr, tesseract, easyocr
        "languages": ["ar", "en"],
        "confidence_threshold": 0.6
    },
    "segmentation": {
        "model_name": "sam_vit_h_4b8939.pth",
        "device": "cuda" if os.getenv("CUDA_AVAILABLE") == "true" else "cpu"
    }
}

# إعدادات معالجة الصور
IMAGE_PROCESSING = {
    "max_file_size": 50 * 1024 * 1024,  # 50MB
    "allowed_formats": [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".pdf"],
    "max_dimensions": (4096, 4096),
    "dpi": 300,
    "quality": 95
}

# قواعد الكود المصري للحريق
EGYPTIAN_FIRE_CODE_RULES = {
    "smoke_detector_coverage": {
        "rule_id": "rule-001",
        "title": "تغطية أجهزة كشف الدخان",
        "requirement": "جهاز كشف دخان لكل 100 متر مربع",
        "severity": "critical"
    },
    "fire_exit_width": {
        "rule_id": "rule-002", 
        "title": "عرض مخارج الطوارئ",
        "requirement": "عرض المخرج لا يقل عن 90 سم",
        "severity": "critical"
    },
    "fire_extinguisher_coverage": {
        "rule_id": "rule-003",
        "title": "تغطية طفايات الحريق", 
        "requirement": "طفاية حريق لكل 200 متر مربع",
        "severity": "major"
    },
    "emergency_exit_distance": {
        "rule_id": "rule-004",
        "title": "مسافة مخارج الطوارئ",
        "requirement": "أقصى مسافة 30 متر لأقرب مخرج طارئ",
        "severity": "critical"
    },
    "fire_alarm_system": {
        "rule_id": "rule-005",
        "title": "نظام الإنذار من الحريق",
        "requirement": "نظام إنذار صوتي وضوئي في جميع المناطق",
        "severity": "major"
    }
}

# رموز العناصر في الرسومات
DRAWING_SYMBOLS = {
    "fire_alarm_panel": ["FACP", "Fire Panel", "لوحة إنذار"],
    "smoke_detector": ["SD", "Smoke Detector", "كاشف دخان", "🔺"],
    "heat_detector": ["HD", "Heat Detector", "كاشف حرارة", "🔥"],
    "fire_extinguisher": ["FE", "Fire Extinguisher", "طفاية حريق", "🧯"],
    "emergency_exit": ["EXIT", "Emergency Exit", "مخرج طارئ", "🚪"],
    "fire_hose": ["FH", "Fire Hose", "خرطوم حريق"],
    "sprinkler": ["SP", "Sprinkler", "رشاش ماء", "💧"],
    "staircase": ["STAIRS", "Stairs", "سلم", "🪜"],
    "elevator": ["ELEV", "Elevator", "مصعد", "🛗"]
}

# تصنيف أنواع المباني
BUILDING_TYPES = {
    "residential": "سكني",
    "commercial": "تجاري", 
    "industrial": "صناعي",
    "educational": "تعليمي",
    "healthcare": "صحي",
    "governmental": "حكومي",
    "religious": "ديني"
}

# إعدادات التقرير
REPORT_CONFIG = {
    "output_format": "pdf",  # pdf, html, json
    "language": "ar",  # ar, en
    "include_images": True,
    "include_recommendations": True,
    "include_compliance_matrix": True
}

# إعدادات الأداء
PERFORMANCE_CONFIG = {
    "max_concurrent_analyses": 5,
    "analysis_timeout": 300,  # 5 minutes
    "cache_results": True,
    "cache_duration": 3600  # 1 hour
}

# إعدادات السجلات
LOGGING_CONFIG = {
    "level": "INFO",
    "format": "%(asctime)s | %(levelname)s | %(name)s:%(funcName)s:%(lineno)d | %(message)s",
    "rotation": "10 MB",
    "retention": "7 days",
    "compression": "zip"
}
