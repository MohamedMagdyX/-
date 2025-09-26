# واجهة برمجة التطبيقات للخدمة
# API Interface for the AI Service

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Dict, Any, Optional
import logging
import asyncio
from datetime import datetime
import uuid
import json
from pathlib import Path
import aiofiles

from models import (
    AnalysisRequest, AnalysisResponse, AnalysisResult, AnalysisStatus,
    BuildingType, ErrorResponse, ProjectInfo
)
from main_analyzer import MainImageAnalyzer
from config import API_CONFIG, UPLOAD_DIR, OUTPUT_DIR

logger = logging.getLogger(__name__)

# إنشاء تطبيق FastAPI
app = FastAPI(
    title=API_CONFIG["title"],
    description=API_CONFIG["description"],
    version=API_CONFIG["version"]
)

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في الإنتاج، حدد النطاقات المسموحة
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# إنشاء المحلل الرئيسي
analyzer = MainImageAnalyzer()

# تخزين مؤقت للطلبات قيد المعالجة
active_analyses: Dict[str, Dict[str, Any]] = {}

@app.on_event("startup")
async def startup_event():
    """حدث بدء التطبيق"""
    logger.info("بدء تشغيل خدمة تحليل الصور بالذكاء الاصطناعي")
    
    # إنشاء المجلدات المطلوبة
    UPLOAD_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)

@app.on_event("shutdown")
async def shutdown_event():
    """حدث إيقاف التطبيق"""
    logger.info("إيقاف خدمة تحليل الصور بالذكاء الاصطناعي")

@app.get("/")
async def root():
    """الصفحة الرئيسية"""
    return {
        "message": "مرحباً بك في خدمة تحليل الصور بالذكاء الاصطناعي - Safe Egypt AI",
        "version": API_CONFIG["version"],
        "status": "active",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """فحص صحة الخدمة"""
    try:
        stats = analyzer.get_analysis_statistics()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "statistics": stats,
            "active_analyses": len(active_analyses)
        }
    except Exception as e:
        logger.error(f"خطأ في فحص الصحة: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    building_type: BuildingType = BuildingType.COMMERCIAL,
    project_title: Optional[str] = None,
    project_location: Optional[str] = None,
    project_purpose: Optional[str] = None
):
    """تحليل صورة جديدة"""
    try:
        # إنشاء معرف فريد للطلب
        request_id = str(uuid.uuid4())
        
        # التحقق من تنسيق الملف
        if not file.filename:
            raise HTTPException(status_code=400, detail="اسم الملف مطلوب")
        
        file_extension = Path(file.filename).suffix.lower()
        allowed_extensions = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".pdf"]
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"تنسيق الملف غير مدعوم. التنسيقات المسموحة: {allowed_extensions}"
            )
        
        # حفظ الملف
        file_path = UPLOAD_DIR / f"{request_id}{file_extension}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # إنشاء معلومات المشروع
        project_info = ProjectInfo(
            title=project_title or "مشروع غير محدد",
            location=project_location or "موقع غير محدد",
            purpose=project_purpose or "غير محدد",
            building_type=building_type
        )
        
        # إضافة الطلب إلى قائمة المعالجة
        active_analyses[request_id] = {
            "status": AnalysisStatus.PROCESSING,
            "progress": 0.0,
            "start_time": datetime.now(),
            "file_name": file.filename,
            "building_type": building_type,
            "project_info": project_info
        }
        
        # بدء التحليل في الخلفية
        background_tasks.add_task(
            process_analysis,
            request_id,
            str(file_path),
            building_type,
            project_info
        )
        
        return AnalysisResponse(
            request_id=request_id,
            status=AnalysisStatus.PROCESSING,
            message="تم بدء تحليل الصورة بنجاح",
            progress=0.0,
            estimated_completion=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطأ في بدء التحليل: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ داخلي: {str(e)}")

async def process_analysis(request_id: str, file_path: str, building_type: BuildingType, project_info: ProjectInfo):
    """معالجة التحليل في الخلفية"""
    try:
        logger.info(f"بدء معالجة التحليل: {request_id}")
        
        # تحديث حالة الطلب
        active_analyses[request_id]["status"] = AnalysisStatus.PROCESSING
        active_analyses[request_id]["progress"] = 10.0
        
        # تنفيذ التحليل
        result = await analyzer.analyze_image(file_path, building_type, project_info)
        
        # حفظ النتيجة
        result_path = OUTPUT_DIR / f"{request_id}_result.json"
        async with aiofiles.open(result_path, 'w', encoding='utf-8') as f:
            result_json = result.dict()
            await f.write(json.dumps(result_json, ensure_ascii=False, indent=2, default=str))
        
        # تحديث حالة الطلب
        active_analyses[request_id].update({
            "status": AnalysisStatus.COMPLETED,
            "progress": 100.0,
            "end_time": datetime.now(),
            "result": result,
            "result_path": str(result_path)
        })
        
        logger.info(f"تم إكمال التحليل بنجاح: {request_id}")
        
    except Exception as e:
        logger.error(f"خطأ في معالجة التحليل {request_id}: {str(e)}")
        
        # تحديث حالة الطلب بالفشل
        active_analyses[request_id].update({
            "status": AnalysisStatus.FAILED,
            "error": str(e),
            "end_time": datetime.now()
        })

@app.get("/analysis/{request_id}", response_model=AnalysisResponse)
async def get_analysis_status(request_id: str):
    """الحصول على حالة التحليل"""
    try:
        if request_id not in active_analyses:
            raise HTTPException(status_code=404, detail="الطلب غير موجود")
        
        analysis_info = active_analyses[request_id]
        
        response = AnalysisResponse(
            request_id=request_id,
            status=analysis_info["status"],
            message=self._get_status_message(analysis_info["status"]),
            progress=analysis_info.get("progress", 0.0),
            estimated_completion=analysis_info.get("estimated_completion")
        )
        
        # إضافة النتيجة إذا كانت متوفرة
        if "result" in analysis_info:
            response.result = analysis_info["result"]
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطأ في الحصول على حالة التحليل: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ داخلي: {str(e)}")

@app.get("/analysis/{request_id}/result")
async def get_analysis_result(request_id: str):
    """الحصول على نتيجة التحليل"""
    try:
        if request_id not in active_analyses:
            raise HTTPException(status_code=404, detail="الطلب غير موجود")
        
        analysis_info = active_analyses[request_id]
        
        if analysis_info["status"] != AnalysisStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="التحليل لم يكتمل بعد")
        
        # إرجاع ملف النتيجة
        result_path = analysis_info.get("result_path")
        if result_path and Path(result_path).exists():
            return FileResponse(
                path=result_path,
                filename=f"analysis_result_{request_id}.json",
                media_type="application/json"
            )
        else:
            # إرجاع النتيجة مباشرة
            result = analysis_info.get("result")
            if result:
                return result.dict()
            else:
                raise HTTPException(status_code=404, detail="النتيجة غير متوفرة")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطأ في الحصول على نتيجة التحليل: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ داخلي: {str(e)}")

@app.get("/analysis/{request_id}/report")
async def get_analysis_report(request_id: str, format: str = "json"):
    """الحصول على تقرير التحليل"""
    try:
        if request_id not in active_analyses:
            raise HTTPException(status_code=404, detail="الطلب غير موجود")
        
        analysis_info = active_analyses[request_id]
        
        if analysis_info["status"] != AnalysisStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="التحليل لم يكتمل بعد")
        
        result = analysis_info.get("result")
        if not result:
            raise HTTPException(status_code=404, detail="النتيجة غير متوفرة")
        
        # إنشاء التقرير
        report = create_analysis_report(result, format)
        
        if format == "json":
            return report
        else:
            # إرجاع ملف التقرير
            report_path = OUTPUT_DIR / f"{request_id}_report.{format}"
            async with aiofiles.open(report_path, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(report, ensure_ascii=False, indent=2, default=str))
            
            return FileResponse(
                path=report_path,
                filename=f"analysis_report_{request_id}.{format}",
                media_type="application/json" if format == "json" else "text/plain"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطأ في إنشاء تقرير التحليل: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ داخلي: {str(e)}")

@app.get("/analyses")
async def list_analyses(limit: int = 10, offset: int = 0):
    """قائمة التحليلات"""
    try:
        analyses = list(active_analyses.items())
        
        # تطبيق التصفية والترقيم
        start = offset
        end = offset + limit
        
        paginated_analyses = analyses[start:end]
        
        result = []
        for request_id, analysis_info in paginated_analyses:
            result.append({
                "request_id": request_id,
                "status": analysis_info["status"],
                "file_name": analysis_info["file_name"],
                "building_type": analysis_info["building_type"],
                "start_time": analysis_info["start_time"],
                "end_time": analysis_info.get("end_time"),
                "progress": analysis_info.get("progress", 0.0)
            })
        
        return {
            "analyses": result,
            "total": len(analyses),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"خطأ في قائمة التحليلات: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ داخلي: {str(e)}")

@app.delete("/analysis/{request_id}")
async def delete_analysis(request_id: str):
    """حذف تحليل"""
    try:
        if request_id not in active_analyses:
            raise HTTPException(status_code=404, detail="الطلب غير موجود")
        
        # حذف الملفات المرتبطة
        analysis_info = active_analyses[request_id]
        
        # حذف ملف النتيجة
        result_path = analysis_info.get("result_path")
        if result_path and Path(result_path).exists():
            Path(result_path).unlink()
        
        # حذف من القائمة
        del active_analyses[request_id]
        
        return {"message": "تم حذف التحليل بنجاح"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطأ في حذف التحليل: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ داخلي: {str(e)}")

@app.get("/statistics")
async def get_statistics():
    """إحصائيات الخدمة"""
    try:
        stats = analyzer.get_analysis_statistics()
        
        # إضافة إحصائيات إضافية
        stats.update({
            "active_analyses": len(active_analyses),
            "completed_analyses": len([a for a in active_analyses.values() if a["status"] == AnalysisStatus.COMPLETED]),
            "failed_analyses": len([a for a in active_analyses.values() if a["status"] == AnalysisStatus.FAILED]),
            "processing_analyses": len([a for a in active_analyses.values() if a["status"] == AnalysisStatus.PROCESSING])
        })
        
        return stats
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الإحصائيات: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ داخلي: {str(e)}")

def _get_status_message(self, status: AnalysisStatus) -> str:
    """الحصول على رسالة الحالة"""
    messages = {
        AnalysisStatus.PENDING: "في انتظار المعالجة",
        AnalysisStatus.PROCESSING: "قيد المعالجة",
        AnalysisStatus.COMPLETED: "تم إكمال التحليل بنجاح",
        AnalysisStatus.FAILED: "فشل في التحليل",
        AnalysisStatus.CANCELLED: "تم إلغاء التحليل"
    }
    return messages.get(status, "حالة غير معروفة")

def create_analysis_report(result: AnalysisResult, format: str = "json") -> Dict[str, Any]:
    """إنشاء تقرير التحليل"""
    report = {
        "report_info": {
            "id": result.id,
            "file_name": result.file_name,
            "analysis_date": result.analysis_date,
            "processing_time": result.processing_time,
            "overall_status": result.overall_status,
            "compliance_score": result.compliance_score
        },
        "project_info": result.project_info.dict(),
        "drawing_data": result.drawing_data.dict(),
        "summary": result.summary,
        "detected_elements": {
            "total": len(result.detected_elements),
            "by_type": {}
        },
        "compliance_issues": {
            "total": len(result.compliance_issues),
            "critical": len([i for i in result.compliance_issues if i.severity.value == "critical"]),
            "major": len([i for i in result.compliance_issues if i.severity.value == "major"]),
            "minor": len([i for i in result.compliance_issues if i.severity.value == "minor"])
        },
        "recommendations": {
            "total": len(result.recommendations),
            "high_priority": len([r for r in result.recommendations if r.priority == "high"]),
            "medium_priority": len([r for r in result.recommendations if r.priority == "medium"]),
            "low_priority": len([r for r in result.recommendations if r.priority == "low"])
        },
        "detailed_results": {
            "detected_elements": [element.dict() for element in result.detected_elements],
            "extracted_texts": [text.dict() for text in result.extracted_texts],
            "compliance_issues": [issue.dict() for issue in result.compliance_issues],
            "recommendations": [rec.dict() for rec in result.recommendations]
        }
    }
    
    # تجميع العناصر حسب النوع
    element_types = {}
    for element in result.detected_elements:
        element_type = element.type.value
        if element_type not in element_types:
            element_types[element_type] = 0
        element_types[element_type] += 1
    
    report["detected_elements"]["by_type"] = element_types
    
    return report

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api:app",
        host=API_CONFIG["host"],
        port=API_CONFIG["port"],
        reload=API_CONFIG["debug"]
    )
