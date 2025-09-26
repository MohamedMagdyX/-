# معالج الصور والتحليل البصري
# Image Processor and Visual Analysis

import cv2
import numpy as np
from PIL import Image, ImageEnhance
import imageio
from typing import List, Tuple, Dict, Any, Optional
from pathlib import Path
import logging
from dataclasses import dataclass

from models import DetectedElement, BoundingBox, ElementType
from config import IMAGE_PROCESSING

logger = logging.getLogger(__name__)

@dataclass
class ImageInfo:
    """معلومات الصورة"""
    width: int
    height: int
    channels: int
    dpi: Tuple[int, int]
    format: str
    size_bytes: int

class ImageProcessor:
    """معالج الصور الرئيسي"""
    
    def __init__(self):
        self.max_dimensions = IMAGE_PROCESSING["max_dimensions"]
        self.target_dpi = IMAGE_PROCESSING["dpi"]
        
    def load_image(self, image_path: str) -> np.ndarray:
        """تحميل الصورة"""
        try:
            if image_path.lower().endswith('.pdf'):
                # معالجة ملفات PDF
                return self._load_pdf_as_image(image_path)
            else:
                # تحميل الصور العادية
                image = cv2.imread(image_path)
                if image is None:
                    raise ValueError(f"لا يمكن تحميل الصورة: {image_path}")
                return image
        except Exception as e:
            logger.error(f"خطأ في تحميل الصورة {image_path}: {str(e)}")
            raise
    
    def _load_pdf_as_image(self, pdf_path: str) -> np.ndarray:
        """تحويل PDF إلى صورة"""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(pdf_path)
            page = doc[0]  # الصفحة الأولى
            mat = fitz.Matrix(self.target_dpi/72, self.target_dpi/72)  # تحسين الدقة
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            doc.close()
            
            # تحويل إلى numpy array
            pil_image = Image.open(io.BytesIO(img_data))
            return np.array(pil_image)
        except ImportError:
            logger.warning("PyMuPDF غير متوفر، استخدام PIL بدلاً منه")
            return self._load_pdf_with_pil(pdf_path)
    
    def _load_pdf_with_pil(self, pdf_path: str) -> np.ndarray:
        """تحويل PDF باستخدام PIL"""
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(pdf_path, dpi=self.target_dpi)
            if images:
                return np.array(images[0])
            else:
                raise ValueError("لا توجد صفحات في ملف PDF")
        except ImportError:
            raise ImportError("pdf2image مطلوب لمعالجة ملفات PDF")
    
    def get_image_info(self, image: np.ndarray) -> ImageInfo:
        """الحصول على معلومات الصورة"""
        height, width = image.shape[:2]
        channels = image.shape[2] if len(image.shape) == 3 else 1
        
        return ImageInfo(
            width=width,
            height=height,
            channels=channels,
            dpi=(self.target_dpi, self.target_dpi),
            format="RGB" if channels == 3 else "GRAYSCALE",
            size_bytes=image.nbytes
        )
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """معالجة أولية للصورة"""
        try:
            # تحويل إلى RGB إذا كان BGR
            if len(image.shape) == 3 and image.shape[2] == 3:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # تصحيح الإضاءة والتباين
            image = self._enhance_image(image)
            
            # إزالة الضوضاء
            image = self._denoise_image(image)
            
            # تصحيح الميل
            image = self._correct_skew(image)
            
            return image
            
        except Exception as e:
            logger.error(f"خطأ في المعالجة الأولية: {str(e)}")
            return image
    
    def _enhance_image(self, image: np.ndarray) -> np.ndarray:
        """تحسين جودة الصورة"""
        # تحويل إلى PIL للتحسين
        pil_image = Image.fromarray(image)
        
        # تحسين التباين
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.2)
        
        # تحسين الحدة
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(1.1)
        
        # تحسين الإضاءة
        enhancer = ImageEnhance.Brightness(pil_image)
        pil_image = enhancer.enhance(1.05)
        
        return np.array(pil_image)
    
    def _denoise_image(self, image: np.ndarray) -> np.ndarray:
        """إزالة الضوضاء"""
        if len(image.shape) == 3:
            # صورة ملونة
            return cv2.bilateralFilter(image, 9, 75, 75)
        else:
            # صورة رمادية
            return cv2.bilateralFilter(image, 9, 75, 75)
    
    def _correct_skew(self, image: np.ndarray) -> np.ndarray:
        """تصحيح ميل الصورة"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
            
            # اكتشاف الحواف
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            
            # خطوط Hough
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is not None:
                angles = []
                for line in lines:
                    rho, theta = line[0]
                    angle = theta * 180 / np.pi
                    if -45 < angle < 45:
                        angles.append(angle)
                
                if angles:
                    median_angle = np.median(angles)
                    if abs(median_angle) > 0.5:  # تصحيح فقط إذا كان الميل كبير
                        return self._rotate_image(image, -median_angle)
            
            return image
            
        except Exception as e:
            logger.warning(f"خطأ في تصحيح الميل: {str(e)}")
            return image
    
    def _rotate_image(self, image: np.ndarray, angle: float) -> np.ndarray:
        """دوران الصورة"""
        height, width = image.shape[:2]
        center = (width // 2, height // 2)
        
        # مصفوفة الدوران
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        
        # حساب الأبعاد الجديدة
        cos_val = np.abs(rotation_matrix[0, 0])
        sin_val = np.abs(rotation_matrix[0, 1])
        new_width = int((height * sin_val) + (width * cos_val))
        new_height = int((height * cos_val) + (width * sin_val))
        
        # تعديل مصفوفة الدوران
        rotation_matrix[0, 2] += (new_width / 2) - center[0]
        rotation_matrix[1, 2] += (new_height / 2) - center[1]
        
        # تطبيق الدوران
        return cv2.warpAffine(image, rotation_matrix, (new_width, new_height), 
                            borderValue=(255, 255, 255))
    
    def extract_color_layers(self, image: np.ndarray) -> Dict[str, np.ndarray]:
        """فصل طبقات الألوان"""
        if len(image.shape) != 3:
            return {"grayscale": image}
        
        # فصل RGB
        layers = {
            "red": image[:, :, 0],
            "green": image[:, :, 1], 
            "blue": image[:, :, 2]
        }
        
        # تحويل إلى HSV لفصل أفضل
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        layers.update({
            "hue": hsv[:, :, 0],
            "saturation": hsv[:, :, 1],
            "value": hsv[:, :, 2]
        })
        
        return layers
    
    def detect_geometric_shapes(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """اكتشاف الأشكال الهندسية"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
            
            # اكتشاف الحواف
            edges = cv2.Canny(gray, 50, 150)
            
            # اكتشاف الخطوط
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, 
                                  minLineLength=50, maxLineGap=10)
            
            # اكتشاف الدوائر
            circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1, 20,
                                     param1=50, param2=30, minRadius=10, maxRadius=200)
            
            # اكتشاف المستطيلات
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            rectangles = []
            for contour in contours:
                approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
                if len(approx) == 4:
                    rectangles.append(approx)
            
            shapes = []
            
            # إضافة الخطوط
            if lines is not None:
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    shapes.append({
                        "type": "line",
                        "coordinates": [(x1, y1), (x2, y2)],
                        "length": np.sqrt((x2-x1)**2 + (y2-y1)**2)
                    })
            
            # إضافة الدوائر
            if circles is not None:
                circles = np.round(circles[0, :]).astype("int")
                for (x, y, r) in circles:
                    shapes.append({
                        "type": "circle",
                        "center": (x, y),
                        "radius": r
                    })
            
            # إضافة المستطيلات
            for rect in rectangles:
                shapes.append({
                    "type": "rectangle",
                    "corners": rect.reshape(-1, 2).tolist()
                })
            
            return shapes
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف الأشكال: {str(e)}")
            return []
    
    def create_image_thumbnail(self, image: np.ndarray, max_size: Tuple[int, int] = (300, 300)) -> np.ndarray:
        """إنشاء صورة مصغرة"""
        height, width = image.shape[:2]
        
        # حساب النسب
        ratio = min(max_size[0]/width, max_size[1]/height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        
        # تغيير الحجم
        thumbnail = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        return thumbnail
    
    def save_processed_image(self, image: np.ndarray, output_path: str, quality: int = 95) -> bool:
        """حفظ الصورة المعالجة"""
        try:
            # تحويل إلى PIL
            if len(image.shape) == 3:
                pil_image = Image.fromarray(image.astype(np.uint8))
            else:
                pil_image = Image.fromarray(image.astype(np.uint8), mode='L')
            
            # حفظ
            pil_image.save(output_path, quality=quality, optimize=True)
            return True
            
        except Exception as e:
            logger.error(f"خطأ في حفظ الصورة {output_path}: {str(e)}")
            return False
    
    def validate_image_format(self, file_path: str) -> bool:
        """التحقق من صحة تنسيق الملف"""
        allowed_formats = IMAGE_PROCESSING["allowed_formats"]
        file_extension = Path(file_path).suffix.lower()
        
        return file_extension in allowed_formats
    
    def get_image_dimensions(self, file_path: str) -> Tuple[int, int]:
        """الحصول على أبعاد الصورة"""
        try:
            with Image.open(file_path) as img:
                return img.size  # (width, height)
        except Exception as e:
            logger.error(f"خطأ في قراءة أبعاد الصورة {file_path}: {str(e)}")
            return (0, 0)
