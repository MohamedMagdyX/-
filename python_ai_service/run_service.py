#!/usr/bin/env python3
# تشغيل خدمة تحليل الصور بالذكاء الاصطناعي
# Run AI Image Analysis Service

import uvicorn
import logging
import sys
from pathlib import Path
import argparse

# إضافة المجلد الحالي إلى المسار
sys.path.append(str(Path(__file__).parent))

from config import API_CONFIG, LOGGING_CONFIG
from api import app

# إعداد السجلات
logging.basicConfig(
    level=getattr(logging, LOGGING_CONFIG["level"]),
    format=LOGGING_CONFIG["format"],
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/service.log", encoding="utf-8")
    ]
)

logger = logging.getLogger(__name__)

def main():
    """الدالة الرئيسية لتشغيل الخدمة"""
    parser = argparse.ArgumentParser(description="تشغيل خدمة تحليل الصور بالذكاء الاصطناعي")
    
    parser.add_argument(
        "--host",
        type=str,
        default=API_CONFIG["host"],
        help="عنوان الخادم (افتراضي: 0.0.0.0)"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=API_CONFIG["port"],
        help="منفذ الخادم (افتراضي: 8000)"
    )
    
    parser.add_argument(
        "--reload",
        action="store_true",
        default=API_CONFIG["debug"],
        help="إعادة تحميل تلقائي عند تغيير الملفات"
    )
    
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="عدد العمال (افتراضي: 1)"
    )
    
    parser.add_argument(
        "--log-level",
        type=str,
        default=LOGGING_CONFIG["level"],
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="مستوى السجلات"
    )
    
    args = parser.parse_args()
    
    # إنشاء مجلد السجلات
    Path("logs").mkdir(exist_ok=True)
    
    logger.info("=" * 60)
    logger.info("بدء تشغيل خدمة تحليل الصور بالذكاء الاصطناعي")
    logger.info("Safe Egypt AI - Image Analysis Service")
    logger.info("=" * 60)
    logger.info(f"العنوان: {args.host}")
    logger.info(f"المنفذ: {args.port}")
    logger.info(f"إعادة التحميل: {'مفعل' if args.reload else 'معطل'}")
    logger.info(f"عدد العمال: {args.workers}")
    logger.info(f"مستوى السجلات: {args.log_level}")
    logger.info("=" * 60)
    
    try:
        # تشغيل الخادم
        uvicorn.run(
            "api:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            workers=args.workers,
            log_level=args.log_level.lower(),
            access_log=True,
            use_colors=True
        )
        
    except KeyboardInterrupt:
        logger.info("تم إيقاف الخدمة بواسطة المستخدم")
    except Exception as e:
        logger.error(f"خطأ في تشغيل الخدمة: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
