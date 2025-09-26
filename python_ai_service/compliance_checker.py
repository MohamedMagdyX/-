# فاحص الامتثال للكود المصري للحريق
# Egyptian Fire Code Compliance Checker

import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
import math
from dataclasses import dataclass
from enum import Enum

from models import (
    DetectedElement, ExtractedText, ComplianceRule, ComplianceIssue, 
    ComplianceStatus, SeverityLevel, ElementType, BoundingBox
)
from config import EGYPTIAN_FIRE_CODE_RULES

logger = logging.getLogger(__name__)

class RuleCategory(str, Enum):
    """فئات قواعد الكود"""
    COVERAGE = "coverage"
    DISTANCE = "distance"
    ACCESSIBILITY = "accessibility"
    CAPACITY = "capacity"
    DIMENSIONS = "dimensions"
    SIGNAGE = "signage"
    DOCUMENTATION = "documentation"

@dataclass
class CoverageArea:
    """منطقة التغطية"""
    area_type: str
    total_area: float  # متر مربع
    covered_area: float  # متر مربع
    coverage_percentage: float
    required_coverage: float

@dataclass
class DistanceMeasurement:
    """قياس المسافة"""
    element1: str
    element2: str
    distance: float  # متر
    required_distance: float  # متر
    is_compliant: bool

class ComplianceChecker:
    """فاحص الامتثال للكود المصري للحريق"""
    
    def __init__(self):
        self.rules = self._initialize_rules()
        self.image_dimensions = None
        self.scale_factor = None
        
    def _initialize_rules(self) -> List[ComplianceRule]:
        """تهيئة قواعد الكود المصري"""
        rules = []
        
        # قاعدة تغطية أجهزة كشف الدخان
        rules.append(ComplianceRule(
            rule_id="rule-001",
            title="تغطية أجهزة كشف الدخان",
            description="يجب توزيع أجهزة كشف الدخان بحيث تغطي جميع المساحات",
            category=RuleCategory.COVERAGE.value,
            severity=SeverityLevel.CRITICAL,
            requirement="جهاز كشف دخان لكل 100 متر مربع",
            applicable_elements=[ElementType.SMOKE_DETECTOR]
        ))
        
        # قاعدة تغطية أجهزة كشف الحرارة
        rules.append(ComplianceRule(
            rule_id="rule-002",
            title="تغطية أجهزة كشف الحرارة",
            description="يجب توزيع أجهزة كشف الحرارة في المناطق عالية الخطورة",
            category=RuleCategory.COVERAGE.value,
            severity=SeverityLevel.MAJOR,
            requirement="جهاز كشف حرارة لكل 80 متر مربع في المناطق عالية الخطورة",
            applicable_elements=[ElementType.HEAT_DETECTOR]
        ))
        
        # قاعدة تغطية طفايات الحريق
        rules.append(ComplianceRule(
            rule_id="rule-003",
            title="تغطية طفايات الحريق",
            description="يجب توزيع طفايات الحريق في جميع أنحاء المبنى",
            category=RuleCategory.COVERAGE.value,
            severity=SeverityLevel.MAJOR,
            requirement="طفاية حريق لكل 200 متر مربع",
            applicable_elements=[ElementType.FIRE_EXTINGUISHER]
        ))
        
        # قاعدة مسافة مخارج الطوارئ
        rules.append(ComplianceRule(
            rule_id="rule-004",
            title="مسافة مخارج الطوارئ",
            description="يجب أن تكون المسافة إلى أقرب مخرج طارئ لا تزيد عن 30 متر",
            category=RuleCategory.DISTANCE.value,
            severity=SeverityLevel.CRITICAL,
            requirement="أقصى مسافة 30 متر لأقرب مخرج طارئ",
            applicable_elements=[ElementType.EMERGENCY_EXIT]
        ))
        
        # قاعدة عرض مخارج الطوارئ
        rules.append(ComplianceRule(
            rule_id="rule-005",
            title="عرض مخارج الطوارئ",
            description="يجب أن يكون عرض مخارج الطوارئ كافياً لعدد السكان",
            category=RuleCategory.DIMENSIONS.value,
            severity=SeverityLevel.CRITICAL,
            requirement="عرض المخرج لا يقل عن 90 سم",
            applicable_elements=[ElementType.EMERGENCY_EXIT]
        ))
        
        # قاعدة نظام الإنذار
        rules.append(ComplianceRule(
            rule_id="rule-006",
            title="نظام الإنذار من الحريق",
            description="يجب وجود نظام إنذار صوتي وضوئي",
            category=RuleCategory.COVERAGE.value,
            severity=SeverityLevel.MAJOR,
            requirement="نظام إنذار في جميع المناطق",
            applicable_elements=[ElementType.FIRE_ALARM_PANEL]
        ))
        
        # قاعدة إمكانية الوصول
        rules.append(ComplianceRule(
            rule_id="rule-007",
            title="إمكانية الوصول لأجهزة الحماية",
            description="يجب أن تكون جميع أجهزة الحماية قابلة للوصول",
            category=RuleCategory.ACCESSIBILITY.value,
            severity=SeverityLevel.MAJOR,
            requirement="إمكانية الوصول لجميع الأجهزة للصيانة والطوارئ",
            applicable_elements=[ElementType.SMOKE_DETECTOR, ElementType.HEAT_DETECTOR, 
                               ElementType.FIRE_EXTINGUISHER, ElementType.FIRE_ALARM_PANEL]
        ))
        
        # قاعدة الإشارات والعلامات
        rules.append(ComplianceRule(
            rule_id="rule-008",
            title="الإشارات والعلامات",
            description="يجب وجود إشارات واضحة لمخارج الطوارئ",
            category=RuleCategory.SIGNAGE.value,
            severity=SeverityLevel.MINOR,
            requirement="إشارات واضحة ومضيئة لمخارج الطوارئ",
            applicable_elements=[ElementType.EMERGENCY_EXIT]
        ))
        
        return rules
    
    def check_compliance(self, elements: List[DetectedElement], texts: List[ExtractedText], 
                        image_dimensions: Tuple[int, int], scale_factor: float = None) -> List[ComplianceIssue]:
        """فحص الامتثال للكود المصري"""
        try:
            self.image_dimensions = image_dimensions
            self.scale_factor = scale_factor or self._calculate_scale_factor(texts)
            
            issues = []
            
            # فحص كل قاعدة
            for rule in self.rules:
                rule_issues = self._check_rule_compliance(rule, elements, texts)
                issues.extend(rule_issues)
            
            logger.info(f"تم فحص {len(self.rules)} قاعدة واكتشاف {len(issues)} مشكلة")
            return issues
            
        except Exception as e:
            logger.error(f"خطأ في فحص الامتثال: {str(e)}")
            return []
    
    def _check_rule_compliance(self, rule: ComplianceRule, elements: List[DetectedElement], 
                              texts: List[ExtractedText]) -> List[ComplianceIssue]:
        """فحص امتثال قاعدة معينة"""
        issues = []
        
        try:
            if rule.rule_id == "rule-001":  # تغطية أجهزة كشف الدخان
                issues.extend(self._check_smoke_detector_coverage(rule, elements))
            
            elif rule.rule_id == "rule-002":  # تغطية أجهزة كشف الحرارة
                issues.extend(self._check_heat_detector_coverage(rule, elements))
            
            elif rule.rule_id == "rule-003":  # تغطية طفايات الحريق
                issues.extend(self._check_fire_extinguisher_coverage(rule, elements))
            
            elif rule.rule_id == "rule-004":  # مسافة مخارج الطوارئ
                issues.extend(self._check_emergency_exit_distance(rule, elements))
            
            elif rule.rule_id == "rule-005":  # عرض مخارج الطوارئ
                issues.extend(self._check_emergency_exit_width(rule, elements))
            
            elif rule.rule_id == "rule-006":  # نظام الإنذار
                issues.extend(self._check_fire_alarm_system(rule, elements))
            
            elif rule.rule_id == "rule-007":  # إمكانية الوصول
                issues.extend(self._check_accessibility(rule, elements))
            
            elif rule.rule_id == "rule-008":  # الإشارات والعلامات
                issues.extend(self._check_signage(rule, elements, texts))
        
        except Exception as e:
            logger.error(f"خطأ في فحص القاعدة {rule.rule_id}: {str(e)}")
        
        return issues
    
    def _check_smoke_detector_coverage(self, rule: ComplianceRule, elements: List[DetectedElement]) -> List[ComplianceIssue]:
        """فحص تغطية أجهزة كشف الدخان"""
        issues = []
        
        smoke_detectors = [e for e in elements if e.type == ElementType.SMOKE_DETECTOR]
        
        if not smoke_detectors:
            issues.append(ComplianceIssue(
                rule_id=rule.rule_id,
                title=rule.title,
                description="لا توجد أجهزة كشف دخان في الرسم",
                severity=rule.severity,
                status=ComplianceStatus.NON_COMPLIANT,
                evidence=["لم يتم العثور على أي أجهزة كشف دخان"],
                suggested_fix="إضافة أجهزة كشف دخان حسب المساحة المطلوبة (جهاز لكل 100 متر مربع)",
                affected_elements=[],
                impact_score=9.0
            ))
            return issues
        
        # حساب المساحة الإجمالية
        total_area = self._calculate_total_area(elements)
        
        # حساب المساحة المغطاة (كل جهاز يغطي 100 متر مربع)
        required_detectors = math.ceil(total_area / 100)
        actual_detectors = len(smoke_detectors)
        
        if actual_detectors < required_detectors:
            shortage = required_detectors - actual_detectors
            issues.append(ComplianceIssue(
                rule_id=rule.rule_id,
                title=rule.title,
                description=f"عدد أجهزة كشف الدخان غير كافي",
                severity=rule.severity,
                status=ComplianceStatus.NON_COMPLIANT,
                evidence=[
                    f"المساحة الإجمالية: {total_area:.1f} متر مربع",
                    f"العدد المطلوب: {required_detectors} جهاز",
                    f"العدد الموجود: {actual_detectors} جهاز",
                    f"النقص: {shortage} جهاز"
                ],
                suggested_fix=f"إضافة {shortage} أجهزة كشف دخان إضافية",
                affected_elements=[e.id for e in smoke_detectors],
                impact_score=8.5
            ))
        
        return issues
    
    def _check_heat_detector_coverage(self, rule: ComplianceRule, elements: List[DetectedElement]) -> List[ComplianceIssue]:
        """فحص تغطية أجهزة كشف الحرارة"""
        issues = []
        
        heat_detectors = [e for e in elements if e.type == ElementType.HEAT_DETECTOR]
        high_risk_areas = self._identify_high_risk_areas(elements)
        
        if high_risk_areas and not heat_detectors:
            issues.append(ComplianceIssue(
                rule_id=rule.rule_id,
                title=rule.title,
                description="لا توجد أجهزة كشف حرارة في المناطق عالية الخطورة",
                severity=rule.severity,
                status=ComplianceStatus.NON_COMPLIANT,
                evidence=[f"تم تحديد {len(high_risk_areas)} منطقة عالية الخطورة بدون أجهزة كشف حرارة"],
                suggested_fix="إضافة أجهزة كشف حرارة في المناطق عالية الخطورة",
                affected_elements=[],
                impact_score=7.5
            ))
        
        return issues
    
    def _check_fire_extinguisher_coverage(self, rule: ComplianceRule, elements: List[DetectedElement]) -> List[ComplianceIssue]:
        """فحص تغطية طفايات الحريق"""
        issues = []
        
        fire_extinguishers = [e for e in elements if e.type == ElementType.FIRE_EXTINGUISHER]
        
        if not fire_extinguishers:
            issues.append(ComplianceIssue(
                rule_id=rule.rule_id,
                title=rule.title,
                description="لا توجد طفايات حريق في الرسم",
                severity=rule.severity,
                status=ComplianceStatus.NON_COMPLIANT,
                evidence=["لم يتم العثور على أي طفايات حريق"],
                suggested_fix="إضافة طفايات حريق حسب المساحة المطلوبة (طفاية لكل 200 متر مربع)",
                affected_elements=[],
                impact_score=8.0
            ))
            return issues
        
        # حساب المساحة الإجمالية
        total_area = self._calculate_total_area(elements)
        
        # حساب العدد المطلوب
        required_extinguishers = math.ceil(total_area / 200)
        actual_extinguishers = len(fire_extinguishers)
        
        if actual_extinguishers < required_extinguishers:
            shortage = required_extinguishers - actual_extinguishers
            issues.append(ComplianceIssue(
                rule_id=rule.rule_id,
                title=rule.title,
                description=f"عدد طفايات الحريق غير كافي",
                severity=rule.severity,
                status=ComplianceStatus.NON_COMPLIANT,
                evidence=[
                    f"المساحة الإجمالية: {total_area:.1f} متر مربع",
                    f"العدد المطلوب: {required_extinguishers} طفاية",
                    f"العدد الموجود: {actual_extinguishers} طفاية",
                    f"النقص: {shortage} طفاية"
                ],
                suggested_fix=f"إضافة {shortage} طفايات حريق إضافية",
                affected_elements=[e.id for e in fire_extinguishers],
                impact_score=7.0
            ))
        
        return issues
    
    def _check_emergency_exit_distance(self, rule: ComplianceRule, elements: List[DetectedElement]) -> List[ComplianceIssue]:
        """فحص مسافة مخارج الطوارئ"""
        issues = []
        
        emergency_exits = [e for e in elements if e.type == ElementType.EMERGENCY_EXIT]
        rooms = [e for e in elements if e.type == ElementType.ROOM]
        
        if not emergency_exits:
            issues.append(ComplianceIssue(
                rule_id=rule.rule_id,
                title=rule.title,
                description="لا توجد مخارج طوارئ في الرسم",
                severity=rule.severity,
                status=ComplianceStatus.NON_COMPLIANT,
                evidence=["لم يتم العثور على أي مخارج طوارئ"],
                suggested_fix="إضافة مخارج طوارئ حسب المساحة وعدد السكان",
                affected_elements=[],
                impact_score=9.5
            ))
            return issues
        
        # فحص المسافات من كل غرفة إلى أقرب مخرج
        for room in rooms:
            min_distance = float('inf')
            nearest_exit = None
            
            for exit_door in emergency_exits:
                distance = self._calculate_distance(room.bounding_box, exit_door.bounding_box)
                if distance < min_distance:
                    min_distance = distance
                    nearest_exit = exit_door
            
            # تحويل المسافة من البكسل إلى متر
            if self.scale_factor:
                distance_meters = min_distance * self.scale_factor
                
                if distance_meters > 30:  # 30 متر الحد الأقصى
                    issues.append(ComplianceIssue(
                        rule_id=rule.rule_id,
                        title=rule.title,
                        description=f"مسافة مخرج الطوارئ بعيدة جداً من {room.name}",
                        severity=rule.severity,
                        status=ComplianceStatus.NON_COMPLIANT,
                        evidence=[
                            f"المسافة الحالية: {distance_meters:.1f} متر",
                            f"الحد الأقصى المسموح: 30 متر",
                            f"المخرج الأقرب: {nearest_exit.name if nearest_exit else 'غير محدد'}"
                        ],
                        suggested_fix="إضافة مخرج طوارئ إضافي أو تقليل المسافة",
                        affected_elements=[room.id, nearest_exit.id if nearest_exit else ""],
                        impact_score=9.0
                    ))
        
        return issues
    
    def _check_emergency_exit_width(self, rule: ComplianceRule, elements: List[DetectedElement]) -> List[ComplianceIssue]:
        """فحص عرض مخارج الطوارئ"""
        issues = []
        
        emergency_exits = [e for e in elements if e.type == ElementType.EMERGENCY_EXIT]
        
        for exit_door in emergency_exits:
            # تحويل العرض من البكسل إلى متر
            if self.scale_factor:
                width_meters = exit_door.bounding_box.width * self.scale_factor
                
                if width_meters < 0.9:  # 90 سم الحد الأدنى
                    issues.append(ComplianceIssue(
                        rule_id=rule.rule_id,
                        title=rule.title,
                        description=f"عرض مخرج الطوارئ غير كافي في {exit_door.name}",
                        severity=rule.severity,
                        status=ComplianceStatus.NON_COMPLIANT,
                        evidence=[
                            f"العرض الحالي: {width_meters:.2f} متر",
                            f"الحد الأدنى المطلوب: 0.9 متر"
                        ],
                        suggested_fix="زيادة عرض مخرج الطوارئ إلى 90 سم على الأقل",
                        affected_elements=[exit_door.id],
                        impact_score=8.5
                    ))
        
        return issues
    
    def _check_fire_alarm_system(self, rule: ComplianceRule, elements: List[DetectedElement]) -> List[ComplianceIssue]:
        """فحص نظام الإنذار من الحريق"""
        issues = []
        
        fire_panels = [e for e in elements if e.type == ElementType.FIRE_ALARM_PANEL]
        
        if not fire_panels:
            issues.append(ComplianceIssue(
                rule_id=rule.rule_id,
                title=rule.title,
                description="لا يوجد نظام إنذار من الحريق",
                severity=rule.severity,
                status=ComplianceStatus.NON_COMPLIANT,
                evidence=["لم يتم العثور على لوحة إنذار الحريق"],
                suggested_fix="إضافة نظام إنذار من الحريق مع لوحة تحكم رئيسية",
                affected_elements=[],
                impact_score=8.0
            ))
        
        return issues
    
    def _check_accessibility(self, rule: ComplianceRule, elements: List[DetectedElement]) -> List[ComplianceIssue]:
        """فحص إمكانية الوصول للأجهزة"""
        issues = []
        
        # البحث عن الأجهزة المحاطة بأشياء تحجبها
        protected_elements = [ElementType.SMOKE_DETECTOR, ElementType.HEAT_DETECTOR, 
                            ElementType.FIRE_EXTINGUISHER, ElementType.FIRE_ALARM_PANEL]
        
        for element_type in protected_elements:
            devices = [e for e in elements if e.type == element_type]
            
            for device in devices:
                # فحص ما إذا كان الجهاز محاط بأشياء أخرى
                nearby_elements = self._find_nearby_elements(device, elements, max_distance=100)
                blocking_elements = [e for e in nearby_elements if e.type in [ElementType.WALL, ElementType.DOOR]]
                
                if len(blocking_elements) > 2:  # محاط بأكثر من عنصرين
                    issues.append(ComplianceIssue(
                        rule_id=rule.rule_id,
                        title=rule.title,
                        description=f"صعوبة الوصول لـ {device.name}",
                        severity=rule.severity,
                        status=ComplianceStatus.NEEDS_ATTENTION,
                        evidence=[f"الجهاز محاط بـ {len(blocking_elements)} عناصر قد تعيق الوصول"],
                        suggested_fix="إعادة تموضع الجهاز لضمان إمكانية الوصول",
                        affected_elements=[device.id],
                        impact_score=6.0
                    ))
        
        return issues
    
    def _check_signage(self, rule: ComplianceRule, elements: List[DetectedElement], texts: List[ExtractedText]) -> List[ComplianceIssue]:
        """فحص الإشارات والعلامات"""
        issues = []
        
        emergency_exits = [e for e in elements if e.type == ElementType.EMERGENCY_EXIT]
        
        for exit_door in emergency_exits:
            # البحث عن النصوص القريبة من مخرج الطوارئ
            nearby_texts = self._find_texts_near_element(exit_door, texts, max_distance=50)
            
            # البحث عن كلمات مفتاحية
            exit_keywords = ["خروج", "exit", "طوارئ", "emergency", "مخرج"]
            has_exit_sign = any(
                any(keyword in text.text.lower() for keyword in exit_keywords)
                for text in nearby_texts
            )
            
            if not has_exit_sign:
                issues.append(ComplianceIssue(
                    rule_id=rule.rule_id,
                    title=rule.title,
                    description=f"عدم وجود إشارة واضحة لمخرج الطوارئ {exit_door.name}",
                    severity=rule.severity,
                    status=ComplianceStatus.NEEDS_ATTENTION,
                    evidence=["لم يتم العثور على إشارة أو علامة واضحة للمخرج"],
                    suggested_fix="إضافة إشارة واضحة ومضيئة لمخرج الطوارئ",
                    affected_elements=[exit_door.id],
                    impact_score=5.0
                ))
        
        return issues
    
    def _calculate_total_area(self, elements: List[DetectedElement]) -> float:
        """حساب المساحة الإجمالية"""
        # استخدام الغرف إذا كانت متوفرة
        rooms = [e for e in elements if e.type == ElementType.ROOM]
        
        if rooms:
            total_area_pixels = sum(
                room.bounding_box.width * room.bounding_box.height 
                for room in rooms
            )
        else:
            # تقدير المساحة من أبعاد الصورة
            total_area_pixels = self.image_dimensions[0] * self.image_dimensions[1] * 0.7  # 70% من الصورة
        
        # تحويل إلى متر مربع
        if self.scale_factor:
            return total_area_pixels * (self.scale_factor ** 2)
        else:
            # تقدير افتراضي (1 بكسل = 1 سم)
            return total_area_pixels * 0.0001  # تحويل من سم² إلى م²
    
    def _calculate_scale_factor(self, texts: List[ExtractedText]) -> float:
        """حساب معامل المقياس من النصوص"""
        try:
            # البحث عن المقياس في النصوص
            for text in texts:
                text_lower = text.text.lower()
                
                # البحث عن أنماط المقياس
                import re
                scale_patterns = [
                    r'مقياس[:\s]*([0-9]+)\s*:\s*([0-9]+)',
                    r'scale[:\s]*([0-9]+)\s*:\s*([0-9]+)',
                    r'1\s*:\s*([0-9]+)',
                    r'([0-9]+)\s*:\s*1'
                ]
                
                for pattern in scale_patterns:
                    match = re.search(pattern, text_lower)
                    if match:
                        groups = match.groups()
                        if len(groups) == 2:
                            scale_ratio = float(groups[0]) / float(groups[1])
                        else:
                            scale_ratio = float(groups[0])
                        
                        # تحويل إلى متر لكل بكسل
                        # تقدير: 1:100 يعني 1 متر في الرسم = 100 متر في الواقع
                        # لكننا نحتاج العكس: 1 بكسل = كم متر
                        return scale_ratio / 1000  # تقدير افتراضي
            
            # إذا لم نجد مقياس، نستخدم تقدير افتراضي
            return 0.01  # 1 بكسل = 1 سم
            
        except Exception as e:
            logger.warning(f"خطأ في حساب معامل المقياس: {str(e)}")
            return 0.01
    
    def _calculate_distance(self, bbox1: BoundingBox, bbox2: BoundingBox) -> float:
        """حساب المسافة بين عنصرين"""
        # حساب المراكز
        center1_x = bbox1.x + bbox1.width / 2
        center1_y = bbox1.y + bbox1.height / 2
        center2_x = bbox2.x + bbox2.width / 2
        center2_y = bbox2.y + bbox2.height / 2
        
        # حساب المسافة الإقليدية
        distance = math.sqrt(
            (center2_x - center1_x) ** 2 + 
            (center2_y - center1_y) ** 2
        )
        
        return distance
    
    def _identify_high_risk_areas(self, elements: List[DetectedElement]) -> List[DetectedElement]:
        """تحديد المناطق عالية الخطورة"""
        high_risk_rooms = []
        
        # البحث عن غرف معينة عالية الخطورة
        high_risk_keywords = ["مطبخ", "kitchen", "مخزن", "storage", "ميكانيكي", "mechanical", 
                             "كهربائي", "electrical", "ورشة", "workshop"]
        
        rooms = [e for e in elements if e.type == ElementType.ROOM]
        
        for room in rooms:
            room_name = room.name.lower()
            if any(keyword in room_name for keyword in high_risk_keywords):
                high_risk_rooms.append(room)
        
        return high_risk_rooms
    
    def _find_nearby_elements(self, target_element: DetectedElement, all_elements: List[DetectedElement], 
                             max_distance: float) -> List[DetectedElement]:
        """البحث عن العناصر القريبة"""
        nearby = []
        
        for element in all_elements:
            if element.id != target_element.id:
                distance = self._calculate_distance(target_element.bounding_box, element.bounding_box)
                if distance <= max_distance:
                    nearby.append(element)
        
        return nearby
    
    def _find_texts_near_element(self, element: DetectedElement, texts: List[ExtractedText], 
                                max_distance: float) -> List[ExtractedText]:
        """البحث عن النصوص القريبة من عنصر"""
        nearby_texts = []
        
        for text in texts:
            distance = self._calculate_distance(element.bounding_box, text.bounding_box)
            if distance <= max_distance:
                nearby_texts.append(text)
        
        return nearby_texts
    
    def calculate_compliance_score(self, issues: List[ComplianceIssue]) -> float:
        """حساب درجة الامتثال"""
        if not issues:
            return 100.0
        
        # حساب النقاط المخصومة حسب الخطورة
        total_deduction = 0
        for issue in issues:
            if issue.severity == SeverityLevel.CRITICAL:
                total_deduction += 20
            elif issue.severity == SeverityLevel.MAJOR:
                total_deduction += 10
            elif issue.severity == SeverityLevel.MINOR:
                total_deduction += 5
        
        score = max(0, 100 - total_deduction)
        return round(score, 1)
