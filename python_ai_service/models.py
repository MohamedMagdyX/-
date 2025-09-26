# نماذج البيانات لخدمة تحليل الصور
# Data Models for Image Analysis Service

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum
import uuid

class AnalysisStatus(str, Enum):
    """حالات التحليل"""
    PENDING = "pending"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class SeverityLevel(str, Enum):
    """مستويات الخطورة"""
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    INFO = "info"

class ComplianceStatus(str, Enum):
    """حالات الامتثال"""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    NEEDS_ATTENTION = "needs_attention"
    NOT_APPLICABLE = "not_applicable"

class BuildingType(str, Enum):
    """أنواع المباني"""
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"
    EDUCATIONAL = "educational"
    HEALTHCARE = "healthcare"
    GOVERNMENTAL = "governmental"
    RELIGIOUS = "religious"

class ElementType(str, Enum):
    """أنواع العناصر في الرسم"""
    FIRE_ALARM_PANEL = "fire_alarm_panel"
    SMOKE_DETECTOR = "smoke_detector"
    HEAT_DETECTOR = "heat_detector"
    FIRE_EXTINGUISHER = "fire_extinguisher"
    EMERGENCY_EXIT = "emergency_exit"
    FIRE_HOSE = "fire_hose"
    SPRINKLER = "sprinkler"
    STAIRCASE = "staircase"
    ELEVATOR = "elevator"
    WALL = "wall"
    DOOR = "door"
    WINDOW = "window"
    ROOM = "room"

class BoundingBox(BaseModel):
    """مربع إحاطة للعنصر"""
    x: float = Field(..., description="الموضع الأفقي")
    y: float = Field(..., description="الموضع العمودي") 
    width: float = Field(..., description="العرض")
    height: float = Field(..., description="الارتفاع")
    
    @validator('width', 'height')
    def validate_dimensions(cls, v):
        if v <= 0:
            raise ValueError('الأبعاد يجب أن تكون أكبر من صفر')
        return v

class DetectedElement(BaseModel):
    """عنصر مكتشف في الرسم"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: ElementType
    name: str
    confidence: float = Field(..., ge=0.0, le=1.0, description="مستوى الثقة")
    bounding_box: BoundingBox
    properties: Dict[str, Any] = Field(default_factory=dict)
    location: Optional[str] = None
    zone: Optional[str] = None
    
class ExtractedText(BaseModel):
    """نص مستخرج من الصورة"""
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: BoundingBox
    language: Optional[str] = None

class ComplianceRule(BaseModel):
    """قاعدة امتثال"""
    rule_id: str
    title: str
    description: str
    category: str
    severity: SeverityLevel
    requirement: str
    applicable_elements: List[ElementType] = Field(default_factory=list)

class ComplianceIssue(BaseModel):
    """مشكلة امتثال"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rule_id: str
    title: str
    description: str
    severity: SeverityLevel
    status: ComplianceStatus
    evidence: List[str] = Field(default_factory=list)
    suggested_fix: str
    affected_elements: List[str] = Field(default_factory=list)
    impact_score: float = Field(..., ge=0.0, le=10.0)

class Recommendation(BaseModel):
    """توصية للتحسين"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    priority: str = Field(..., description="high, medium, low")
    category: str
    title: str
    description: str
    benefits: List[str] = Field(default_factory=list)
    implementation: Dict[str, Any] = Field(default_factory=dict)
    cost_estimate: Optional[str] = None
    timeline: Optional[str] = None

class AnalysisStep(BaseModel):
    """خطوة في عملية التحليل"""
    step_id: str
    name: str
    description: str
    status: AnalysisStatus
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    progress: float = Field(0.0, ge=0.0, le=100.0)
    details: Dict[str, Any] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)

class ProjectInfo(BaseModel):
    """معلومات المشروع"""
    title: str
    location: str
    district: Optional[str] = None
    purpose: str
    building_type: BuildingType
    area: Optional[float] = None
    floors: Optional[int] = None
    occupancy: Optional[int] = None

class DrawingData(BaseModel):
    """بيانات الرسم"""
    drawing_number: str
    title: str
    scale: str
    revision: str
    date: Optional[datetime] = None
    author: Optional[str] = None
    checker: Optional[str] = None

class AnalysisResult(BaseModel):
    """نتيجة التحليل الكاملة"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    file_name: str
    file_size: int
    file_type: str
    analysis_date: datetime = Field(default_factory=datetime.now)
    processing_time: float
    
    # معلومات المشروع والرسم
    project_info: ProjectInfo
    drawing_data: DrawingData
    
    # العناصر المكتشفة
    detected_elements: List[DetectedElement] = Field(default_factory=list)
    extracted_texts: List[ExtractedText] = Field(default_factory=list)
    
    # تحليل الامتثال
    compliance_rules: List[ComplianceRule] = Field(default_factory=list)
    compliance_issues: List[ComplianceIssue] = Field(default_factory=list)
    compliance_score: float = Field(0.0, ge=0.0, le=100.0)
    
    # التوصيات
    recommendations: List[Recommendation] = Field(default_factory=list)
    
    # خطوات التحليل
    analysis_steps: List[AnalysisStep] = Field(default_factory=list)
    
    # ملخص النتائج
    summary: Dict[str, Any] = Field(default_factory=dict)
    
    # الحالة العامة
    overall_status: AnalysisStatus
    overall_status_message: str

class AnalysisRequest(BaseModel):
    """طلب تحليل جديد"""
    file_name: str
    file_size: int
    file_type: str
    building_type: BuildingType
    project_info: Optional[ProjectInfo] = None
    analysis_options: Dict[str, Any] = Field(default_factory=dict)

class AnalysisResponse(BaseModel):
    """استجابة التحليل"""
    request_id: str
    status: AnalysisStatus
    message: str
    result: Optional[AnalysisResult] = None
    progress: float = Field(0.0, ge=0.0, le=100.0)
    estimated_completion: Optional[datetime] = None

class ErrorResponse(BaseModel):
    """استجابة خطأ"""
    error_code: str
    error_message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)
