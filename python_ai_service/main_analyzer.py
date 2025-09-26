# المحلل الرئيسي للصور بالذكاء الاصطناعي
# Main AI Image Analyzer

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
import uuid

from models import (
    AnalysisResult, AnalysisStatus, AnalysisStep, ProjectInfo, DrawingData,
    DetectedElement, ExtractedText, ComplianceIssue, Recommendation,
    BuildingType
)
from image_processor import ImageProcessor, ImageInfo
from object_detector import FireSafetyObjectDetector
from ocr_extractor import OCRExtractor
from compliance_checker import ComplianceChecker

logger = logging.getLogger(__name__)

class MainImageAnalyzer:
    """المحلل الرئيسي للصور بالذكاء الاصطناعي"""
    
    def __init__(self):
        self.image_processor = ImageProcessor()
        self.object_detector = FireSafetyObjectDetector()
        self.ocr_extractor = OCRExtractor()
        self.compliance_checker = ComplianceChecker()
        
        # إحصائيات التحليل
        self.analysis_stats = {
            "total_analyses": 0,
            "successful_analyses": 0,
            "failed_analyses": 0,
            "average_processing_time": 0.0
        }
    
    async def analyze_image(self, image_path: str, building_type: BuildingType, 
                           project_info: Optional[ProjectInfo] = None) -> AnalysisResult:
        """تحليل الصورة الرئيسي"""
        analysis_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        logger.info(f"بدء تحليل الصورة: {image_path}")
        
        try:
            # إنشاء خطوات التحليل
            steps = self._create_analysis_steps(analysis_id)
            
            # الخطوة 1: تحميل ومعالجة الصورة
            await self._execute_step(steps[0], self._load_and_process_image, image_path)
            
            # الخطوة 2: اكتشاف العناصر
            await self._execute_step(steps[1], self._detect_elements, steps[0].result)
            
            # الخطوة 3: استخراج النصوص
            await self._execute_step(steps[2], self._extract_texts, steps[0].result)
            
            # الخطوة 4: فحص الامتثال
            await self._execute_step(steps[3], self._check_compliance, 
                                   steps[1].result, steps[2].result, steps[0].result["image_info"])
            
            # الخطوة 5: إنشاء التوصيات
            await self._execute_step(steps[4], self._generate_recommendations, 
                                   steps[3].result, steps[1].result)
            
            # الخطوة 6: إنشاء التقرير النهائي
            await self._execute_step(steps[5], self._create_final_report, 
                                   steps[0].result, steps[1].result, steps[2].result, 
                                   steps[3].result, steps[4].result, analysis_id, image_path, building_type)
            
            # تحديث الإحصائيات
            self._update_analysis_stats(start_time, True)
            
            return steps[5].result
            
        except Exception as e:
            logger.error(f"خطأ في تحليل الصورة {image_path}: {str(e)}")
            self._update_analysis_stats(start_time, False)
            
            # إنشاء نتيجة خطأ
            return self._create_error_result(analysis_id, image_path, str(e))
    
    def _create_analysis_steps(self, analysis_id: str) -> List[AnalysisStep]:
        """إنشاء خطوات التحليل"""
        steps = [
            AnalysisStep(
                step_id=f"{analysis_id}-step-1",
                name="تحميل ومعالجة الصورة",
                description="تحميل الصورة ومعالجتها للتحليل",
                status=AnalysisStatus.PENDING,
                progress=0.0
            ),
            AnalysisStep(
                step_id=f"{analysis_id}-step-2", 
                name="اكتشاف العناصر",
                description="اكتشاف عناصر السلامة من الحريق في الصورة",
                status=AnalysisStatus.PENDING,
                progress=0.0
            ),
            AnalysisStep(
                step_id=f"{analysis_id}-step-3",
                name="استخراج النصوص",
                description="استخراج النصوص والمعلومات من الصورة",
                status=AnalysisStatus.PENDING,
                progress=0.0
            ),
            AnalysisStep(
                step_id=f"{analysis_id}-step-4",
                name="فحص الامتثال",
                description="فحص الامتثال للكود المصري للحريق",
                status=AnalysisStatus.PENDING,
                progress=0.0
            ),
            AnalysisStep(
                step_id=f"{analysis_id}-step-5",
                name="إنشاء التوصيات",
                description="إنشاء توصيات للتحسين",
                status=AnalysisStatus.PENDING,
                progress=0.0
            ),
            AnalysisStep(
                step_id=f"{analysis_id}-step-6",
                name="إنشاء التقرير النهائي",
                description="إنشاء التقرير النهائي للتحليل",
                status=AnalysisStatus.PENDING,
                progress=0.0
            )
        ]
        
        return steps
    
    async def _execute_step(self, step: AnalysisStep, func, *args, **kwargs):
        """تنفيذ خطوة التحليل"""
        step.status = AnalysisStatus.PROCESSING
        step.start_time = datetime.now()
        step.progress = 0.0
        
        try:
            # تنفيذ الخطوة
            result = await func(*args, **kwargs)
            
            step.status = AnalysisStatus.COMPLETED
            step.end_time = datetime.now()
            step.duration = (step.end_time - step.start_time).total_seconds()
            step.progress = 100.0
            step.result = result
            
            logger.info(f"تم إكمال الخطوة: {step.name}")
            
        except Exception as e:
            step.status = AnalysisStatus.FAILED
            step.end_time = datetime.now()
            step.duration = (step.end_time - step.start_time).total_seconds()
            step.errors.append(str(e))
            
            logger.error(f"فشل في الخطوة {step.name}: {str(e)}")
            raise
    
    async def _load_and_process_image(self, image_path: str) -> Dict[str, Any]:
        """تحميل ومعالجة الصورة"""
        try:
            # التحقق من صحة الملف
            if not self.image_processor.validate_image_format(image_path):
                raise ValueError("تنسيق الملف غير مدعوم")
            
            # تحميل الصورة
            image = self.image_processor.load_image(image_path)
            
            # الحصول على معلومات الصورة
            image_info = self.image_processor.get_image_info(image)
            
            # معالجة الصورة
            processed_image = self.image_processor.preprocess_image(image)
            
            return {
                "original_image": image,
                "processed_image": processed_image,
                "image_info": image_info,
                "file_path": image_path
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحميل ومعالجة الصورة: {str(e)}")
            raise
    
    async def _detect_elements(self, image_data: Dict[str, Any]) -> List[DetectedElement]:
        """اكتشاف العناصر في الصورة"""
        try:
            processed_image = image_data["processed_image"]
            
            # اكتشاف العناصر
            detected_elements = self.object_detector.detect_elements(processed_image)
            
            # تصفية العناصر حسب مستوى الثقة
            filtered_elements = self.object_detector.filter_elements_by_confidence(
                detected_elements, 0.5
            )
            
            logger.info(f"تم اكتشاف {len(filtered_elements)} عنصر")
            return filtered_elements
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف العناصر: {str(e)}")
            raise
    
    async def _extract_texts(self, image_data: Dict[str, Any]) -> List[ExtractedText]:
        """استخراج النصوص من الصورة"""
        try:
            processed_image = image_data["processed_image"]
            
            # استخراج النصوص
            extracted_texts = self.ocr_extractor.extract_text(processed_image)
            
            logger.info(f"تم استخراج {len(extracted_texts)} نص")
            return extracted_texts
            
        except Exception as e:
            logger.error(f"خطأ في استخراج النصوص: {str(e)}")
            raise
    
    async def _check_compliance(self, detected_elements: List[DetectedElement], 
                              extracted_texts: List[ExtractedText], 
                              image_info: ImageInfo) -> List[ComplianceIssue]:
        """فحص الامتثال للكود المصري"""
        try:
            image_dimensions = (image_info.width, image_info.height)
            
            # فحص الامتثال
            compliance_issues = self.compliance_checker.check_compliance(
                detected_elements, extracted_texts, image_dimensions
            )
            
            logger.info(f"تم اكتشاف {len(compliance_issues)} مشكلة امتثال")
            return compliance_issues
            
        except Exception as e:
            logger.error(f"خطأ في فحص الامتثال: {str(e)}")
            raise
    
    async def _generate_recommendations(self, compliance_issues: List[ComplianceIssue],
                                      detected_elements: List[DetectedElement]) -> List[Recommendation]:
        """إنشاء التوصيات للتحسين"""
        try:
            recommendations = []
            
            # إنشاء توصيات من المشاكل المكتشفة
            for issue in compliance_issues:
                if issue.status.value == "non_compliant":
                    recommendation = Recommendation(
                        priority=self._map_severity_to_priority(issue.severity.value),
                        category=issue.rule_id,
                        title=f"إصلاح مشكلة: {issue.title}",
                        description=issue.suggested_fix,
                        benefits=[
                            "تحسين مستوى السلامة",
                            "الامتثال للمعايير القانونية",
                            "تقليل مخاطر الحريق"
                        ],
                        implementation={
                            "steps": [
                                "مراجعة المخططات الحالية",
                                "تحديد المواقع المطلوب تعديلها",
                                "إعداد المخططات المحدثة",
                                "تنفيذ التعديلات",
                                "إجراء الاختبارات والفحوصات"
                            ],
                            "resources": [
                                "مهندس حماية من الحريق",
                                "فريق البناء",
                                "معدات خاصة"
                            ],
                            "timeline": "2-4 أسابيع",
                            "cost": self._estimate_cost(issue.severity.value)
                        }
                    )
                    recommendations.append(recommendation)
            
            # إضافة توصيات عامة
            general_recommendations = self._generate_general_recommendations(detected_elements)
            recommendations.extend(general_recommendations)
            
            logger.info(f"تم إنشاء {len(recommendations)} توصية")
            return recommendations
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء التوصيات: {str(e)}")
            raise
    
    async def _create_final_report(self, image_data: Dict[str, Any], 
                                  detected_elements: List[DetectedElement],
                                  extracted_texts: List[ExtractedText],
                                  compliance_issues: List[ComplianceIssue],
                                  recommendations: List[Recommendation],
                                  analysis_id: str, image_path: str, building_type: BuildingType) -> AnalysisResult:
        """إنشاء التقرير النهائي"""
        try:
            image_info = image_data["image_info"]
            file_path = Path(image_path)
            
            # استخراج البيانات المنظمة
            structured_data = self.ocr_extractor.extract_structured_data(extracted_texts)
            
            # إنشاء معلومات المشروع
            project_info = self._create_project_info(structured_data, building_type)
            
            # إنشاء بيانات الرسم
            drawing_data = self._create_drawing_data(structured_data, file_path)
            
            # حساب درجة الامتثال
            compliance_score = self.compliance_checker.calculate_compliance_score(compliance_issues)
            
            # تحديد الحالة العامة
            overall_status, status_message = self._determine_overall_status(compliance_issues, compliance_score)
            
            # إنشاء الملخص
            summary = self._create_summary(detected_elements, extracted_texts, compliance_issues)
            
            # إنشاء خطوات التحليل
            analysis_steps = self._create_analysis_steps(analysis_id)
            
            result = AnalysisResult(
                id=analysis_id,
                file_name=file_path.name,
                file_size=file_path.stat().st_size,
                file_type=file_path.suffix,
                processing_time=(datetime.now() - datetime.now()).total_seconds(),  # سيتم تحديثه
                project_info=project_info,
                drawing_data=drawing_data,
                detected_elements=detected_elements,
                extracted_texts=extracted_texts,
                compliance_issues=compliance_issues,
                compliance_score=compliance_score,
                recommendations=recommendations,
                analysis_steps=analysis_steps,
                summary=summary,
                overall_status=overall_status,
                overall_status_message=status_message
            )
            
            logger.info(f"تم إنشاء التقرير النهائي بنجاح")
            return result
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء التقرير النهائي: {str(e)}")
            raise
    
    def _create_project_info(self, structured_data: Dict[str, Any], building_type: BuildingType) -> ProjectInfo:
        """إنشاء معلومات المشروع"""
        return ProjectInfo(
            title=structured_data.get("project_title", "مشروع غير محدد"),
            location=structured_data.get("location", "موقع غير محدد"),
            district=structured_data.get("district"),
            purpose=structured_data.get("purpose", "غير محدد"),
            building_type=building_type,
            area=structured_data.get("area"),
            floors=structured_data.get("floors"),
            occupancy=structured_data.get("occupancy")
        )
    
    def _create_drawing_data(self, structured_data: Dict[str, Any], file_path: Path) -> DrawingData:
        """إنشاء بيانات الرسم"""
        return DrawingData(
            drawing_number=structured_data.get("drawing_number", f"DWG-{file_path.stem}"),
            title=structured_data.get("drawing_title", "رسم تقني"),
            scale=structured_data.get("scale", "غير محدد"),
            revision=structured_data.get("revision", "1.0"),
            date=datetime.now() if "date" not in structured_data else None,
            author=structured_data.get("author"),
            checker=structured_data.get("checker")
        )
    
    def _determine_overall_status(self, compliance_issues: List[ComplianceIssue], 
                                 compliance_score: float) -> tuple[AnalysisStatus, str]:
        """تحديد الحالة العامة"""
        critical_issues = [i for i in compliance_issues if i.severity.value == "critical"]
        major_issues = [i for i in compliance_issues if i.severity.value == "major"]
        
        if critical_issues:
            return AnalysisStatus.FAILED, "يحتوي الرسم على مشاكل حرجة تتطلب إصلاح فوري"
        elif major_issues:
            return AnalysisStatus.NEEDS_REVISION, "يحتوي الرسم على مشاكل كبيرة تحتاج مراجعة"
        elif compliance_score >= 90:
            return AnalysisStatus.COMPLETED, "الرسم مطابق للمعايير بشكل ممتاز"
        elif compliance_score >= 75:
            return AnalysisStatus.COMPLETED, "الرسم مطابق للمعايير مع تحسينات بسيطة"
        else:
            return AnalysisStatus.NEEDS_REVISION, "الرسم يحتاج مراجعة شاملة"
    
    def _create_summary(self, detected_elements: List[DetectedElement], 
                       extracted_texts: List[ExtractedText],
                       compliance_issues: List[ComplianceIssue]) -> Dict[str, Any]:
        """إنشاء ملخص النتائج"""
        critical_issues = len([i for i in compliance_issues if i.severity.value == "critical"])
        major_issues = len([i for i in compliance_issues if i.severity.value == "major"])
        minor_issues = len([i for i in compliance_issues if i.severity.value == "minor"])
        
        return {
            "total_elements": len(detected_elements),
            "total_texts": len(extracted_texts),
            "total_issues": len(compliance_issues),
            "critical_issues": critical_issues,
            "major_issues": major_issues,
            "minor_issues": minor_issues,
            "element_types": list(set([e.type.value for e in detected_elements])),
            "text_statistics": self.ocr_extractor.get_text_statistics(extracted_texts)
        }
    
    def _map_severity_to_priority(self, severity: str) -> str:
        """تحويل مستوى الخطورة إلى أولوية"""
        mapping = {
            "critical": "high",
            "major": "medium", 
            "minor": "low",
            "info": "low"
        }
        return mapping.get(severity, "low")
    
    def _estimate_cost(self, severity: str) -> str:
        """تقدير التكلفة"""
        cost_estimates = {
            "critical": "15,000 - 25,000 جنيه",
            "major": "8,000 - 15,000 جنيه",
            "minor": "3,000 - 8,000 جنيه",
            "info": "1,000 - 3,000 جنيه"
        }
        return cost_estimates.get(severity, "غير محدد")
    
    def _generate_general_recommendations(self, detected_elements: List[DetectedElement]) -> List[Recommendation]:
        """إنشاء توصيات عامة"""
        recommendations = []
        
        # توصية للصيانة الدورية
        recommendations.append(Recommendation(
            priority="medium",
            category="maintenance",
            title="برنامج الصيانة الدورية",
            description="وضع برنامج صيانة دورية لجميع أجهزة السلامة من الحريق",
            benefits=[
                "ضمان عمل الأجهزة بكفاءة",
                "تجنب الأعطال المفاجئة",
                "الامتثال للمعايير القانونية"
            ],
            implementation={
                "steps": [
                    "إعداد جدول الصيانة الدورية",
                    "تدريب الفريق على الصيانة",
                    "توفير قطع الغيار",
                    "توثيق أعمال الصيانة"
                ],
                "timeline": "شهرياً",
                "cost": "5,000 - 10,000 جنيه سنوياً"
            }
        ))
        
        # توصية للتدريب
        recommendations.append(Recommendation(
            priority="medium",
            category="training",
            title="تدريب العاملين على السلامة",
            description="تدريب جميع العاملين على إجراءات السلامة من الحريق",
            benefits=[
                "رفع مستوى الوعي",
                "تحسين الاستجابة للطوارئ",
                "تقليل المخاطر"
            ],
            implementation={
                "steps": [
                    "إعداد برنامج تدريبي",
                    "توفير المدربين المتخصصين",
                    "تنفيذ التدريب النظري والعملي",
                    "إجراء التقييمات الدورية"
                ],
                "timeline": "ربع سنوي",
                "cost": "3,000 - 5,000 جنيه للدورة"
            }
        ))
        
        return recommendations
    
    def _create_error_result(self, analysis_id: str, image_path: str, error_message: str) -> AnalysisResult:
        """إنشاء نتيجة خطأ"""
        file_path = Path(image_path)
        
        return AnalysisResult(
            id=analysis_id,
            file_name=file_path.name,
            file_size=0,
            file_type=file_path.suffix,
            processing_time=0.0,
            project_info=ProjectInfo(
                title="تحليل فاشل",
                location="غير محدد",
                purpose="تحليل فاشل",
                building_type=BuildingType.COMMERCIAL
            ),
            drawing_data=DrawingData(
                drawing_number="خطأ",
                title="تحليل فاشل",
                scale="غير محدد",
                revision="0"
            ),
            overall_status=AnalysisStatus.FAILED,
            overall_status_message=f"فشل في تحليل الصورة: {error_message}"
        )
    
    def _update_analysis_stats(self, start_time: datetime, success: bool):
        """تحديث إحصائيات التحليل"""
        self.analysis_stats["total_analyses"] += 1
        
        if success:
            self.analysis_stats["successful_analyses"] += 1
        else:
            self.analysis_stats["failed_analyses"] += 1
        
        # تحديث متوسط وقت المعالجة
        processing_time = (datetime.now() - start_time).total_seconds()
        current_avg = self.analysis_stats["average_processing_time"]
        total_analyses = self.analysis_stats["total_analyses"]
        
        self.analysis_stats["average_processing_time"] = (
            (current_avg * (total_analyses - 1) + processing_time) / total_analyses
        )
    
    def get_analysis_statistics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات التحليل"""
        return self.analysis_stats.copy()
