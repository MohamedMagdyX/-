# مكتشف العناصر باستخدام الذكاء الاصطناعي
# AI Object Detection for Fire Safety Elements

import torch
import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Any, Tuple, Optional
import logging
from pathlib import Path

from models import DetectedElement, BoundingBox, ElementType
from config import AI_MODELS, IMAGE_PROCESSING

logger = logging.getLogger(__name__)

class FireSafetyObjectDetector:
    """مكتشف عناصر السلامة من الحريق"""
    
    def __init__(self):
        self.model = None
        self.confidence_threshold = AI_MODELS["object_detection"]["confidence_threshold"]
        self.iou_threshold = AI_MODELS["object_detection"]["iou_threshold"]
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # فئات العناصر المطلوبة
        self.class_names = {
            0: "fire_alarm_panel",
            1: "smoke_detector", 
            2: "heat_detector",
            3: "fire_extinguisher",
            4: "emergency_exit",
            5: "fire_hose",
            6: "sprinkler",
            7: "staircase",
            8: "elevator",
            9: "wall",
            10: "door",
            11: "window",
            12: "room"
        }
        
        # الأسماء العربية
        self.arabic_names = {
            "fire_alarm_panel": "لوحة إنذار الحريق",
            "smoke_detector": "كاشف الدخان",
            "heat_detector": "كاشف الحرارة", 
            "fire_extinguisher": "طفاية الحريق",
            "emergency_exit": "مخرج الطوارئ",
            "fire_hose": "خرطوم الحريق",
            "sprinkler": "رشاش الماء",
            "staircase": "السلم",
            "elevator": "المصعد",
            "wall": "الجدار",
            "door": "الباب",
            "window": "النافذة",
            "room": "الغرفة"
        }
        
        self._load_model()
    
    def _load_model(self):
        """تحميل نموذج YOLO"""
        try:
            model_path = Path(AI_MODELS["object_detection"]["model_name"])
            
            if model_path.exists():
                self.model = YOLO(str(model_path))
            else:
                # تحميل النموذج الأساسي وتدريبه على بيانات السلامة من الحريق
                self.model = YOLO('yolov8n.pt')
                logger.info("تم تحميل النموذج الأساسي، سيتم تدريبه على بيانات السلامة من الحريق")
            
            self.model.to(self.device)
            logger.info(f"تم تحميل النموذج على الجهاز: {self.device}")
            
        except Exception as e:
            logger.error(f"خطأ في تحميل النموذج: {str(e)}")
            raise
    
    def detect_elements(self, image: np.ndarray) -> List[DetectedElement]:
        """اكتشاف العناصر في الصورة"""
        try:
            # تشغيل النموذج
            results = self.model(image, conf=self.confidence_threshold, iou=self.iou_threshold)
            
            detected_elements = []
            
            for result in results:
                if result.boxes is not None:
                    boxes = result.boxes.xyxy.cpu().numpy()  # إحداثيات الصناديق
                    confidences = result.boxes.conf.cpu().numpy()  # مستويات الثقة
                    class_ids = result.boxes.cls.cpu().numpy().astype(int)  # فئات العناصر
                    
                    for box, confidence, class_id in zip(boxes, confidences, class_ids):
                        # تحويل الإحداثيات
                        x1, y1, x2, y2 = box
                        width = x2 - x1
                        height = y2 - y1
                        
                        # الحصول على نوع العنصر
                        element_type_str = self.class_names.get(class_id, "unknown")
                        element_type = ElementType(element_type_str) if element_type_str != "unknown" else None
                        
                        if element_type:
                            # إنشاء مربع الإحاطة
                            bounding_box = BoundingBox(
                                x=float(x1),
                                y=float(y1), 
                                width=float(width),
                                height=float(height)
                            )
                            
                            # إنشاء العنصر المكتشف
                            element = DetectedElement(
                                type=element_type,
                                name=self.arabic_names.get(element_type_str, element_type_str),
                                confidence=float(confidence),
                                bounding_box=bounding_box,
                                properties=self._extract_element_properties(element_type, bounding_box, image)
                            )
                            
                            detected_elements.append(element)
            
            logger.info(f"تم اكتشاف {len(detected_elements)} عنصر")
            return detected_elements
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف العناصر: {str(e)}")
            return []
    
    def _extract_element_properties(self, element_type: ElementType, bounding_box: BoundingBox, image: np.ndarray) -> Dict[str, Any]:
        """استخراج خصائص العنصر"""
        properties = {}
        
        try:
            # استخراج منطقة العنصر
            x1, y1 = int(bounding_box.x), int(bounding_box.y)
            x2, y2 = int(bounding_box.x + bounding_box.width), int(bounding_box.y + bounding_box.height)
            
            # التأكد من أن الإحداثيات داخل حدود الصورة
            h, w = image.shape[:2]
            x1 = max(0, min(x1, w))
            y1 = max(0, min(y1, h))
            x2 = max(0, min(x2, w))
            y2 = max(0, min(y2, h))
            
            element_region = image[y1:y2, x1:x2]
            
            if element_region.size == 0:
                return properties
            
            # خصائص عامة
            properties["area_pixels"] = int(bounding_box.width * bounding_box.height)
            properties["aspect_ratio"] = round(bounding_box.width / bounding_box.height, 2)
            
            # خصائص حسب نوع العنصر
            if element_type == ElementType.FIRE_ALARM_PANEL:
                properties.update(self._analyze_fire_panel(element_region))
            elif element_type == ElementType.SMOKE_DETECTOR:
                properties.update(self._analyze_smoke_detector(element_region))
            elif element_type == ElementType.HEAT_DETECTOR:
                properties.update(self._analyze_heat_detector(element_region))
            elif element_type == ElementType.FIRE_EXTINGUISHER:
                properties.update(self._analyze_fire_extinguisher(element_region))
            elif element_type == ElementType.EMERGENCY_EXIT:
                properties.update(self._analyze_emergency_exit(element_region))
            
        except Exception as e:
            logger.warning(f"خطأ في استخراج خصائص العنصر: {str(e)}")
        
        return properties
    
    def _analyze_fire_panel(self, region: np.ndarray) -> Dict[str, Any]:
        """تحليل لوحة الإنذار"""
        properties = {}
        
        try:
            # تحليل الألوان
            if len(region.shape) == 3:
                mean_color = np.mean(region, axis=(0, 1))
                properties["dominant_color"] = [int(c) for c in mean_color]
                
                # البحث عن الأضواء/المؤشرات
                gray = cv2.cvtColor(region, cv2.COLOR_RGB2GRAY)
                bright_pixels = np.sum(gray > 200)
                properties["has_indicators"] = bright_pixels > (region.shape[0] * region.shape[1] * 0.1)
            
            properties["panel_type"] = "conventional"  # أو "addressable"
            
        except Exception as e:
            logger.warning(f"خطأ في تحليل لوحة الإنذار: {str(e)}")
        
        return properties
    
    def _analyze_smoke_detector(self, region: np.ndarray) -> Dict[str, Any]:
        """تحليل كاشف الدخان"""
        properties = {}
        
        try:
            # تحليل الشكل الدائري
            gray = cv2.cvtColor(region, cv2.COLOR_RGB2GRAY) if len(region.shape) == 3 else region
            contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                area = cv2.contourArea(largest_contour)
                perimeter = cv2.arcLength(largest_contour, True)
                
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter * perimeter)
                    properties["is_circular"] = circularity > 0.7
                    properties["circularity_score"] = round(circularity, 2)
            
            properties["detector_type"] = "optical"  # أو "ionization"
            
        except Exception as e:
            logger.warning(f"خطأ في تحليل كاشف الدخان: {str(e)}")
        
        return properties
    
    def _analyze_heat_detector(self, region: np.ndarray) -> Dict[str, Any]:
        """تحليل كاشف الحرارة"""
        properties = {}
        
        try:
            # كاشفات الحرارة عادة ما تكون مربعة أو مستطيلة
            gray = cv2.cvtColor(region, cv2.COLOR_RGB2GRAY) if len(region.shape) == 3 else region
            contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                rect = cv2.minAreaRect(largest_contour)
                properties["shape"] = "rectangular"
                properties["dimensions"] = [round(d, 1) for d in rect[1]]
            
            properties["detector_type"] = "fixed_temperature"  # أو "rate_of_rise"
            
        except Exception as e:
            logger.warning(f"خطأ في تحليل كاشف الحرارة: {str(e)}")
        
        return properties
    
    def _analyze_fire_extinguisher(self, region: np.ndarray) -> Dict[str, Any]:
        """تحليل طفاية الحريق"""
        properties = {}
        
        try:
            # تحليل الألوان (الأحمر غالباً)
            if len(region.shape) == 3:
                # تحويل إلى HSV
                hsv = cv2.cvtColor(region, cv2.COLOR_RGB2HSV)
                mean_hsv = np.mean(hsv, axis=(0, 1))
                
                # تحديد اللون الأحمر
                if mean_hsv[0] < 10 or mean_hsv[0] > 170:  # درجات اللون الأحمر
                    properties["color"] = "red"
                    properties["is_red_dominant"] = True
                else:
                    properties["color"] = "other"
                    properties["is_red_dominant"] = False
                
                properties["hsv_values"] = [round(v, 1) for v in mean_hsv]
            
            # تحليل الشكل (عمودي عادة)
            aspect_ratio = region.shape[1] / region.shape[0]
            properties["is_vertical"] = aspect_ratio < 0.8
            properties["aspect_ratio"] = round(aspect_ratio, 2)
            
            properties["extinguisher_type"] = "dry_chemical"  # أو "water", "foam", etc.
            
        except Exception as e:
            logger.warning(f"خطأ في تحليل طفاية الحريق: {str(e)}")
        
        return properties
    
    def _analyze_emergency_exit(self, region: np.ndarray) -> Dict[str, Any]:
        """تحليل مخرج الطوارئ"""
        properties = {}
        
        try:
            # البحث عن النص "EXIT" أو "خروج"
            gray = cv2.cvtColor(region, cv2.COLOR_RGB2GRAY) if len(region.shape) == 3 else region
            
            # تحسين التباين للنص
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(gray)
            
            # البحث عن الحواف
            edges = cv2.Canny(enhanced, 50, 150)
            
            # حساب كثافة الحواف (مؤشر على وجود نص)
            edge_density = np.sum(edges > 0) / edges.size
            properties["has_text"] = edge_density > 0.1
            properties["text_density"] = round(edge_density, 3)
            
            # تحليل الألوان (أخضر غالباً)
            if len(region.shape) == 3:
                mean_color = np.mean(region, axis=(0, 1))
                if mean_color[1] > mean_color[0] and mean_color[1] > mean_color[2]:  # أخضر
                    properties["color_scheme"] = "green"
                else:
                    properties["color_scheme"] = "other"
            
            properties["exit_type"] = "emergency"
            
        except Exception as e:
            logger.warning(f"خطأ في تحليل مخرج الطوارئ: {str(e)}")
        
        return properties
    
    def filter_elements_by_type(self, elements: List[DetectedElement], element_types: List[ElementType]) -> List[DetectedElement]:
        """تصفية العناصر حسب النوع"""
        return [elem for elem in elements if elem.type in element_types]
    
    def filter_elements_by_confidence(self, elements: List[DetectedElement], min_confidence: float) -> List[DetectedElement]:
        """تصفية العناصر حسب مستوى الثقة"""
        return [elem for elem in elements if elem.confidence >= min_confidence]
    
    def group_elements_by_type(self, elements: List[DetectedElement]) -> Dict[ElementType, List[DetectedElement]]:
        """تجميع العناصر حسب النوع"""
        groups = {}
        for element in elements:
            if element.type not in groups:
                groups[element.type] = []
            groups[element.type].append(element)
        return groups
    
    def calculate_coverage_areas(self, elements: List[DetectedElement], image_shape: Tuple[int, int]) -> Dict[str, float]:
        """حساب مناطق التغطية"""
        coverage = {}
        total_area = image_shape[0] * image_shape[1]
        
        # تجميع العناصر حسب النوع
        groups = self.group_elements_by_type(elements)
        
        for element_type, type_elements in groups.items():
            total_element_area = sum(
                elem.bounding_box.width * elem.bounding_box.height 
                for elem in type_elements
            )
            coverage[element_type.value] = round((total_element_area / total_area) * 100, 2)
        
        return coverage
