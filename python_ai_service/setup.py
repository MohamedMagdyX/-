#!/usr/bin/env python3
# إعداد وتثبيت خدمة تحليل الصور بالذكاء الاصطناعي
# Setup and Installation for AI Image Analysis Service

import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_python_version():
    """التحقق من إصدار Python"""
    if sys.version_info < (3, 8):
        print("❌ يتطلب Python 3.8 أو أحدث")
        print(f"الإصدار الحالي: {sys.version}")
        return False
    
    print(f"✅ Python {sys.version.split()[0]} - متوافق")
    return True

def check_system_requirements():
    """التحقق من متطلبات النظام"""
    print("\n🔍 فحص متطلبات النظام...")
    
    # فحص CUDA
    try:
        result = subprocess.run(['nvidia-smi'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ NVIDIA GPU متوفر - يمكن استخدام التعلم العميق المتسارع")
        else:
            print("⚠️ NVIDIA GPU غير متوفر - سيتم استخدام CPU")
    except FileNotFoundError:
        print("⚠️ NVIDIA GPU غير متوفر - سيتم استخدام CPU")
    
    # فحص الذاكرة المتاحة
    try:
        import psutil
        memory = psutil.virtual_memory()
        if memory.total > 4 * 1024**3:  # 4GB
            print(f"✅ الذاكرة المتاحة: {memory.total // 1024**3} GB")
        else:
            print(f"⚠️ الذاكرة المتاحة: {memory.total // 1024**3} GB - قد تكون محدودة")
    except ImportError:
        print("⚠️ لا يمكن فحص الذاكرة - تأكد من وجود ذاكرة كافية")
    
    return True

def create_directories():
    """إنشاء المجلدات المطلوبة"""
    print("\n📁 إنشاء المجلدات المطلوبة...")
    
    directories = [
        "uploads",
        "outputs", 
        "models",
        "logs",
        "temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ تم إنشاء مجلد: {directory}")

def install_requirements():
    """تثبيت المتطلبات"""
    print("\n📦 تثبيت المتطلبات...")
    
    requirements_file = Path("requirements.txt")
    if not requirements_file.exists():
        print("❌ ملف requirements.txt غير موجود")
        return False
    
    try:
        # تحديث pip
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True, capture_output=True)
        print("✅ تم تحديث pip")
        
        # تثبيت المتطلبات
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True)
        print("✅ تم تثبيت جميع المتطلبات")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ خطأ في تثبيت المتطلبات: {e}")
        return False

def download_models():
    """تحميل نماذج الذكاء الاصطناعي"""
    print("\n🤖 تحميل نماذج الذكاء الاصطناعي...")
    
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    try:
        # تحميل YOLO
        print("📥 تحميل نموذج YOLO...")
        from ultralytics import YOLO
        model = YOLO('yolov8n.pt')
        print("✅ تم تحميل YOLO")
        
        # تحميل PaddleOCR (يتم تلقائياً عند الاستخدام الأول)
        print("📥 تحميل PaddleOCR...")
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='ar', show_log=False)
        print("✅ تم تحميل PaddleOCR")
        
        return True
        
    except Exception as e:
        print(f"⚠️ تحذير في تحميل النماذج: {e}")
        print("سيتم تحميل النماذج عند الاستخدام الأول")
        return True

def setup_environment():
    """إعداد البيئة"""
    print("\n⚙️ إعداد البيئة...")
    
    # إنشاء ملف .env إذا لم يكن موجوداً
    env_file = Path(".env")
    if not env_file.exists():
        env_content = """# إعدادات خدمة تحليل الصور بالذكاء الاصطناعي
# Safe Egypt AI Service Configuration

# قاعدة البيانات
DATABASE_URL=sqlite:///./safe_egypt_ai.db

# Redis (اختياري)
REDIS_HOST=localhost
REDIS_PORT=6379

# CUDA (اختياري)
CUDA_AVAILABLE=false

# إعدادات API
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=true

# إعدادات الأمان
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# إعدادات الأداء
MAX_CONCURRENT_ANALYSES=5
ANALYSIS_TIMEOUT=300
CACHE_DURATION=3600

# إعدادات الملفات
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.bmp,.tiff,.pdf

# إعدادات السجلات
LOG_LEVEL=INFO
LOG_ROTATION=10MB
LOG_RETENTION=7days
"""
        
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("✅ تم إنشاء ملف .env")
    
    # إنشاء ملف config.py إذا لم يكن موجوداً
    config_file = Path("config.py")
    if not config_file.exists():
        print("⚠️ ملف config.py غير موجود - سيتم استخدام الإعدادات الافتراضية")
    
    return True

def test_installation():
    """اختبار التثبيت"""
    print("\n🧪 اختبار التثبيت...")
    
    try:
        # اختبار الاستيراد
        import torch
        import cv2
        import numpy as np
        from PIL import Image
        import fastapi
        import pydantic
        
        print("✅ جميع المكتبات الأساسية متوفرة")
        
        # اختبار CUDA
        if torch.cuda.is_available():
            print(f"✅ CUDA متوفر - {torch.cuda.get_device_name(0)}")
        else:
            print("⚠️ CUDA غير متوفر - سيتم استخدام CPU")
        
        # اختبار OpenCV
        test_image = np.zeros((100, 100, 3), dtype=np.uint8)
        processed = cv2.cvtColor(test_image, cv2.COLOR_RGB2GRAY)
        print("✅ OpenCV يعمل بشكل صحيح")
        
        return True
        
    except ImportError as e:
        print(f"❌ خطأ في الاستيراد: {e}")
        return False
    except Exception as e:
        print(f"❌ خطأ في الاختبار: {e}")
        return False

def create_startup_script():
    """إنشاء سكريبت البدء"""
    print("\n📝 إنشاء سكريبت البدء...")
    
    # سكريبت Linux/Mac
    linux_script = """#!/bin/bash
# Safe Egypt AI Service Startup Script

echo "🚀 بدء تشغيل خدمة Safe Egypt AI..."

# التحقق من Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 غير مثبت"
    exit 1
fi

# التحقق من المتطلبات
if [ ! -f "requirements.txt" ]; then
    echo "❌ ملف requirements.txt غير موجود"
    exit 1
fi

# تشغيل الخدمة
echo "✅ بدء تشغيل الخدمة على المنفذ 8000..."
python3 run_service.py --host 0.0.0.0 --port 8000
"""
    
    with open("start_service.sh", 'w') as f:
        f.write(linux_script)
    
    # جعل السكريبت قابلاً للتنفيذ
    os.chmod("start_service.sh", 0o755)
    
    # سكريبت Windows
    windows_script = """@echo off
REM Safe Egypt AI Service Startup Script

echo 🚀 بدء تشغيل خدمة Safe Egypt AI...

REM التحقق من Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python غير مثبت
    pause
    exit /b 1
)

REM تشغيل الخدمة
echo ✅ بدء تشغيل الخدمة على المنفذ 8000...
python run_service.py --host 0.0.0.0 --port 8000

pause
"""
    
    with open("start_service.bat", 'w', encoding='utf-8') as f:
        f.write(windows_script)
    
    print("✅ تم إنشاء سكريبت البدء")

def main():
    """الدالة الرئيسية للإعداد"""
    print("🏗️ إعداد خدمة تحليل الصور بالذكاء الاصطناعي")
    print("Safe Egypt AI - Image Analysis Service Setup")
    print("=" * 60)
    
    # التحقق من Python
    if not check_python_version():
        sys.exit(1)
    
    # التحقق من متطلبات النظام
    if not check_system_requirements():
        sys.exit(1)
    
    # إنشاء المجلدات
    create_directories()
    
    # تثبيت المتطلبات
    if not install_requirements():
        print("\n❌ فشل في تثبيت المتطلبات")
        print("يرجى تثبيت المتطلبات يدوياً:")
        print("pip install -r requirements.txt")
        sys.exit(1)
    
    # تحميل النماذج
    download_models()
    
    # إعداد البيئة
    setup_environment()
    
    # اختبار التثبيت
    if not test_installation():
        print("\n❌ فشل في اختبار التثبيت")
        sys.exit(1)
    
    # إنشاء سكريبت البدء
    create_startup_script()
    
    print("\n" + "=" * 60)
    print("🎉 تم إعداد الخدمة بنجاح!")
    print("=" * 60)
    print("\n📋 خطوات التشغيل:")
    print("1. تشغيل الخدمة:")
    print("   Linux/Mac: ./start_service.sh")
    print("   Windows: start_service.bat")
    print("   أو مباشرة: python run_service.py")
    print("\n2. الوصول للخدمة:")
    print("   http://localhost:8000")
    print("   http://localhost:8000/docs")
    print("\n3. اختبار الخدمة:")
    print("   python integration_example.py")
    print("\n📚 الوثائق:")
    print("   README.md - دليل الاستخدام")
    print("   api.py - واجهة برمجة التطبيقات")
    print("\n🆘 الدعم:")
    print("   support@safeegypt.ai")
    print("   https://safeegypt.ai")
    print("\n✅ جاهز للاستخدام!")

if __name__ == "__main__":
    main()
