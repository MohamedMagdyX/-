# مستخرج النصوص من الصور باستخدام OCR
# OCR Text Extractor from Images

import cv2
import numpy as np
from PIL import Image
import pytesseract
import easyocr
from paddleocr import PaddleOCR
from typing import List, Dict, Any, Optional, Tuple
import logging
import re
from dataclasses import dataclass

from models import ExtractedText, BoundingBox
from config import AI_MODELS, DRAWING_SYMBOLS

logger = logging.getLogger(__name__)

@dataclass
class TextRegion:
    """منطقة نصية"""
    text: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    language: Optional[str] = None

class OCRExtractor:
    """مستخرج النصوص من الصور"""
    
    def __init__(self):
        self.primary_ocr = AI_MODELS["ocr"]["primary"]
        self.languages = AI_MODELS["ocr"]["languages"]
        self.confidence_threshold = AI_MODELS["ocr"]["confidence_threshold"]
        
        # تهيئة محركات OCR
        self.paddle_ocr = None
        self.easy_ocr = None
        self._initialize_ocr_engines()
        
        # أنماط النصوص المهمة في الرسومات
        self.text_patterns = {
            "drawing_number": r"رقم\s*الرسم[:\s]*([A-Z0-9\-]+)",
            "scale": r"المقياس[:\s]*([0-9:/\s]+)",
            "revision": r"مراجعة[:\s]*([A-Z0-9]+)",
            "date": r"التاريخ[:\s]*([0-9/]+)",
            "author": r"رسم[:\s]*([^\n]+)",
            "checker": r"فحص[:\s]*([^\n]+)",
            "approver": r"اعتماد[:\s]*([^\n]+)",
            "project_title": r"مشروع[:\s]*([^\n]+)",
            "location": r"الموقع[:\s]*([^\n]+)",
            "building_type": r"نوع\s*المبنى[:\s]*([^\n]+)",
            "area": r"المساحة[:\s]*([0-9.]+)\s*م[²2]",
            "floors": r"الطوابق[:\s]*([0-9]+)",
            "occupancy": r"السعة[:\s]*([0-9]+)",
            "grid_reference": r"([A-Z][0-9]+)",
            "room_name": r"(غرفة|مكتب|صالة|مطبخ|حمام|مخزن|ممر|سلم)",
            "dimension": r"([0-9.]+)\s*×\s*([0-9.]+)\s*م",
            "elevation": r"منسوب[:\s]*([+-]?[0-9.]+)\s*م",
            "fire_zone": r"منطقة\s*الحريق[:\s]*([A-Z0-9]+)",
            "detector_address": r"عنوان[:\s]*([0-9]+)",
            "device_model": r"موديل[:\s]*([A-Z0-9\-]+)",
            "voltage": r"الجهد[:\s]*([0-9]+)\s*فولت",
            "current": r"التيار[:\s]*([0-9.]+)\s*أمبير"
        }
    
    def _initialize_ocr_engines(self):
        """تهيئة محركات OCR"""
        try:
            # تهيئة PaddleOCR
            if self.primary_ocr == "paddleocr":
                self.paddle_ocr = PaddleOCR(
                    use_angle_cls=True,
                    lang='ar'
                )
                logger.info("تم تهيئة PaddleOCR")
            
            # تهيئة EasyOCR
            self.easy_ocr = easyocr.Reader(
                ['ar', 'en'],
                gpu=False,
                verbose=False
            )
            logger.info("تم تهيئة EasyOCR")
            
            # تهيئة Tesseract
            try:
                pytesseract.get_tesseract_version()
                logger.info("تم التحقق من تثبيت Tesseract")
            except Exception:
                logger.warning("Tesseract غير متوفر")
                
        except Exception as e:
            logger.error(f"خطأ في تهيئة محركات OCR: {str(e)}")
    
    def extract_text(self, image: np.ndarray) -> List[ExtractedText]:
        """استخراج النصوص من الصورة"""
        try:
            # معالجة الصورة لتحسين OCR
            processed_image = self._preprocess_for_ocr(image)
            
            # استخراج النصوص باستخدام المحرك الأساسي
            if self.primary_ocr == "paddleocr":
                texts = self._extract_with_paddle(processed_image)
            elif self.primary_ocr == "easyocr":
                texts = self._extract_with_easy(processed_image)
            else:  # tesseract
                texts = self._extract_with_tesseract(processed_image)
            
            # تحسين وتصفية النتائج
            texts = self._postprocess_texts(texts)
            
            # تحويل إلى نموذج البيانات
            extracted_texts = []
            for text_region in texts:
                if text_region.confidence >= self.confidence_threshold:
                    bbox = BoundingBox(
                        x=float(text_region.bbox[0]),
                        y=float(text_region.bbox[1]),
                        width=float(text_region.bbox[2] - text_region.bbox[0]),
                        height=float(text_region.bbox[3] - text_region.bbox[1])
                    )
                    
                    extracted_text = ExtractedText(
                        text=text_region.text.strip(),
                        confidence=text_region.confidence,
                        bounding_box=bbox,
                        language=text_region.language
                    )
                    
                    extracted_texts.append(extracted_text)
            
            logger.info(f"تم استخراج {len(extracted_texts)} نص")
            return extracted_texts
            
        except Exception as e:
            logger.error(f"خطأ في استخراج النصوص: {str(e)}")
            return []
    
    def _preprocess_for_ocr(self, image: np.ndarray) -> np.ndarray:
        """معالجة الصورة لتحسين OCR"""
        try:
            # تحويل إلى رمادي
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            else:
                gray = image.copy()
            
            # تحسين التباين
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
            enhanced = clahe.apply(gray)
            
            # إزالة الضوضاء
            denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)
            
            # تحسين الحدة
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            sharpened = cv2.filter2D(denoised, -1, kernel)
            
            # تصحيح الميل الطفيف
            corrected = self._correct_text_skew(sharpened)
            
            return corrected
            
        except Exception as e:
            logger.warning(f"خطأ في معالجة الصورة: {str(e)}")
            return image
    
    def _correct_text_skew(self, image: np.ndarray) -> np.ndarray:
        """تصحيح ميل النصوص"""
        try:
            # اكتشاف الخطوط
            edges = cv2.Canny(image, 50, 150, apertureSize=3)
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is not None:
                angles = []
                for line in lines:
                    rho, theta = line[0]
                    angle = theta * 180 / np.pi
                    # تصحيح الميل البسيط فقط
                    if -5 < angle < 5:
                        angles.append(angle)
                
                if angles:
                    median_angle = np.median(angles)
                    if abs(median_angle) > 0.5:
                        # دوران الصورة
                        height, width = image.shape
                        center = (width // 2, height // 2)
                        rotation_matrix = cv2.getRotationMatrix2D(center, -median_angle, 1.0)
                        rotated = cv2.warpAffine(image, rotation_matrix, (width, height), 
                                               borderValue=(255, 255, 255))
                        return rotated
            
            return image
            
        except Exception as e:
            logger.warning(f"خطأ في تصحيح الميل: {str(e)}")
            return image
    
    def _extract_with_paddle(self, image: np.ndarray) -> List[TextRegion]:
        """استخراج النصوص باستخدام PaddleOCR"""
        try:
            results = self.paddle_ocr.ocr(image, cls=True)
            text_regions = []
            
            if results and results[0]:
                for line in results[0]:
                    if line:
                        bbox = line[0]  # [[x1,y1], [x2,y1], [x2,y2], [x1,y2]]
                        text_info = line[1]
                        text = text_info[0]
                        confidence = text_info[1]
                        
                        # تحويل الإحداثيات
                        x_coords = [point[0] for point in bbox]
                        y_coords = [point[1] for point in bbox]
                        x1, x2 = min(x_coords), max(x_coords)
                        y1, y2 = min(y_coords), max(y_coords)
                        
                        text_region = TextRegion(
                            text=text,
                            confidence=confidence,
                            bbox=(x1, y1, x2, y2),
                            language="ar"
                        )
                        text_regions.append(text_region)
            
            return text_regions
            
        except Exception as e:
            logger.error(f"خطأ في PaddleOCR: {str(e)}")
            return []
    
    def _extract_with_easy(self, image: np.ndarray) -> List[TextRegion]:
        """استخراج النصوص باستخدام EasyOCR"""
        try:
            results = self.easy_ocr.readtext(image)
            text_regions = []
            
            for (bbox, text, confidence) in results:
                # تحويل الإحداثيات
                x_coords = [point[0] for point in bbox]
                y_coords = [point[1] for point in bbox]
                x1, x2 = min(x_coords), max(x_coords)
                y1, y2 = min(y_coords), max(y_coords)
                
                text_region = TextRegion(
                    text=text,
                    confidence=confidence,
                    bbox=(x1, y1, x2, y2),
                    language="ar"
                )
                text_regions.append(text_region)
            
            return text_regions
            
        except Exception as e:
            logger.error(f"خطأ في EasyOCR: {str(e)}")
            return []
    
    def _extract_with_tesseract(self, image: np.ndarray) -> List[TextRegion]:
        """استخراج النصوص باستخدام Tesseract"""
        try:
            # إعداد Tesseract للعربية
            custom_config = r'--oem 3 --psm 6 -l ara+eng'
            
            # استخراج النصوص مع الإحداثيات
            data = pytesseract.image_to_data(image, config=custom_config, output_type=pytesseract.Output.DICT)
            
            text_regions = []
            n_boxes = len(data['text'])
            
            for i in range(n_boxes):
                text = data['text'][i].strip()
                confidence = float(data['conf'][i]) / 100.0  # تحويل إلى نسبة
                
                if text and confidence > 0:
                    x = data['left'][i]
                    y = data['top'][i]
                    w = data['width'][i]
                    h = data['height'][i]
                    
                    text_region = TextRegion(
                        text=text,
                        confidence=confidence,
                        bbox=(x, y, x + w, y + h),
                        language="ar"
                    )
                    text_regions.append(text_region)
            
            return text_regions
            
        except Exception as e:
            logger.error(f"خطأ في Tesseract: {str(e)}")
            return []
    
    def _postprocess_texts(self, text_regions: List[TextRegion]) -> List[TextRegion]:
        """معالجة النتائج وتحسينها"""
        processed = []
        
        for region in text_regions:
            # تنظيف النص
            cleaned_text = self._clean_text(region.text)
            
            if cleaned_text and len(cleaned_text.strip()) > 1:
                # تحديث النص المنظف
                region.text = cleaned_text
                
                # تحسين مستوى الثقة بناءً على جودة النص
                region.confidence = self._improve_confidence(cleaned_text, region.confidence)
                
                processed.append(region)
        
        # إزالة التكرارات
        processed = self._remove_duplicates(processed)
        
        return processed
    
    def _clean_text(self, text: str) -> str:
        """تنظيف النص"""
        if not text:
            return ""
        
        # إزالة الأحرف الخاصة غير المرغوبة
        text = re.sub(r'[^\w\s\-\/\.\(\)\[\]:،,؛;]', '', text)
        
        # إزالة المسافات الزائدة
        text = re.sub(r'\s+', ' ', text)
        
        # تصحيح الأخطاء الشائعة
        corrections = {
            'الرسم': 'الرسم',
            'المقياس': 'المقياس',
            'مراجعة': 'مراجعة',
            'التاريخ': 'التاريخ',
            'رسم': 'رسم',
            'فحص': 'فحص',
            'اعتماد': 'اعتماد',
            'مشروع': 'مشروع',
            'الموقع': 'الموقع',
            'المساحة': 'المساحة',
            'الطوابق': 'الطوابق',
            'السعة': 'السعة'
        }
        
        for wrong, correct in corrections.items():
            text = text.replace(wrong, correct)
        
        return text.strip()
    
    def _improve_confidence(self, text: str, original_confidence: float) -> float:
        """تحسين مستوى الثقة"""
        # زيادة الثقة للنصوص التي تطابق الأنماط المعروفة
        for pattern_name, pattern in self.text_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                return min(original_confidence + 0.1, 1.0)
        
        # تقليل الثقة للنصوص القصيرة جداً
        if len(text.strip()) < 3:
            return original_confidence * 0.7
        
        return original_confidence
    
    def _remove_duplicates(self, text_regions: List[TextRegion]) -> List[TextRegion]:
        """إزالة النصوص المكررة"""
        unique_regions = []
        seen_texts = set()
        
        for region in text_regions:
            # تطبيع النص للمقارنة
            normalized_text = re.sub(r'\s+', ' ', region.text.lower().strip())
            
            if normalized_text not in seen_texts:
                seen_texts.add(normalized_text)
                unique_regions.append(region)
        
        return unique_regions
    
    def extract_structured_data(self, texts: List[ExtractedText]) -> Dict[str, Any]:
        """استخراج البيانات المنظمة من النصوص"""
        structured_data = {}
        
        # دمج جميع النصوص
        full_text = " ".join([text.text for text in texts])
        
        # البحث عن الأنماط
        for key, pattern in self.text_patterns.items():
            matches = re.findall(pattern, full_text, re.IGNORECASE)
            if matches:
                structured_data[key] = matches[0] if len(matches) == 1 else matches
        
        # استخراج معلومات إضافية
        structured_data.update(self._extract_additional_info(full_text))
        
        return structured_data
    
    def _extract_additional_info(self, text: str) -> Dict[str, Any]:
        """استخراج معلومات إضافية"""
        info = {}
        
        # استخراج الأرقام والأبعاد
        dimensions = re.findall(r'([0-9.]+)\s*×\s*([0-9.]+)', text)
        if dimensions:
            info["dimensions"] = [{"width": float(d[0]), "height": float(d[1])} for d in dimensions]
        
        # استخراج المساحات
        areas = re.findall(r'([0-9.]+)\s*م[²2]', text)
        if areas:
            info["areas"] = [float(area) for area in areas]
        
        # استخراج المراجع الشبكية
        grid_refs = re.findall(r'([A-Z][0-9]+)', text)
        if grid_refs:
            info["grid_references"] = list(set(grid_refs))
        
        # استخراج أسماء الغرف
        room_names = re.findall(r'(غرفة|مكتب|صالة|مطبخ|حمام|مخزن|ممر|سلم|مدخل|صالة|صالة انتظار)', text)
        if room_names:
            info["room_names"] = list(set(room_names))
        
        return info
    
    def find_text_near_element(self, texts: List[ExtractedText], element_bbox: BoundingBox, max_distance: float = 50.0) -> List[ExtractedText]:
        """البحث عن النصوص القريبة من عنصر معين"""
        nearby_texts = []
        
        for text in texts:
            # حساب المسافة بين النص والعنصر
            text_center_x = text.bounding_box.x + text.bounding_box.width / 2
            text_center_y = text.bounding_box.y + text.bounding_box.height / 2
            
            element_center_x = element_bbox.x + element_bbox.width / 2
            element_center_y = element_bbox.y + element_bbox.height / 2
            
            distance = np.sqrt(
                (text_center_x - element_center_x)**2 + 
                (text_center_y - element_center_y)**2
            )
            
            if distance <= max_distance:
                nearby_texts.append(text)
        
        return nearby_texts
    
    def get_text_statistics(self, texts: List[ExtractedText]) -> Dict[str, Any]:
        """إحصائيات النصوص المستخرجة"""
        if not texts:
            return {}
        
        confidences = [text.confidence for text in texts]
        text_lengths = [len(text.text) for text in texts]
        
        return {
            "total_texts": len(texts),
            "average_confidence": round(np.mean(confidences), 3),
            "min_confidence": round(np.min(confidences), 3),
            "max_confidence": round(np.max(confidences), 3),
            "average_text_length": round(np.mean(text_lengths), 1),
            "total_characters": sum(text_lengths),
            "languages": list(set([text.language for text in texts if text.language]))
        }
