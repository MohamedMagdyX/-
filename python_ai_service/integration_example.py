# مثال على التكامل مع الواجهة الأمامية
# Frontend Integration Example

import requests
import json
import time
from typing import Dict, Any, Optional

class SafeEgyptAIClient:
    """عميل للتواصل مع خدمة تحليل الصور"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        
        # إعداد رؤوس HTTP
        self.session.headers.update({
            'User-Agent': 'SafeEgyptAI-Client/1.0',
            'Accept': 'application/json'
        })
    
    def analyze_image(self, image_path: str, building_type: str = "commercial", 
                     project_info: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """تحليل صورة جديدة"""
        try:
            # إعداد البيانات
            files = {'file': open(image_path, 'rb')}
            data = {
                'building_type': building_type,
                'project_title': project_info.get('title', '') if project_info else '',
                'project_location': project_info.get('location', '') if project_info else '',
                'project_purpose': project_info.get('purpose', '') if project_info else ''
            }
            
            # إرسال الطلب
            response = self.session.post(
                f"{self.base_url}/analyze",
                files=files,
                data=data,
                timeout=30
            )
            
            files['file'].close()
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"خطأ في الطلب: {response.status_code} - {response.text}")
                
        except Exception as e:
            return {"error": str(e)}
    
    def get_analysis_status(self, request_id: str) -> Dict[str, Any]:
        """الحصول على حالة التحليل"""
        try:
            response = self.session.get(f"{self.base_url}/analysis/{request_id}")
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"خطأ في الطلب: {response.status_code}")
                
        except Exception as e:
            return {"error": str(e)}
    
    def wait_for_completion(self, request_id: str, timeout: int = 300, 
                           check_interval: int = 5) -> Dict[str, Any]:
        """انتظار إكمال التحليل"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status_response = self.get_analysis_status(request_id)
            
            if "error" in status_response:
                return status_response
            
            status = status_response.get("status")
            
            if status == "completed":
                # الحصول على النتيجة
                return self.get_analysis_result(request_id)
            elif status == "failed":
                return {"error": "فشل التحليل", "details": status_response}
            
            # انتظار قبل الفحص التالي
            time.sleep(check_interval)
        
        return {"error": "انتهت مهلة الانتظار"}
    
    def get_analysis_result(self, request_id: str) -> Dict[str, Any]:
        """الحصول على نتيجة التحليل"""
        try:
            response = self.session.get(f"{self.base_url}/analysis/{request_id}/result")
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"خطأ في الطلب: {response.status_code}")
                
        except Exception as e:
            return {"error": str(e)}
    
    def get_analysis_report(self, request_id: str, format: str = "json") -> Dict[str, Any]:
        """الحصول على تقرير التحليل"""
        try:
            response = self.session.get(
                f"{self.base_url}/analysis/{request_id}/report",
                params={"format": format}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"خطأ في الطلب: {response.status_code}")
                
        except Exception as e:
            return {"error": str(e)}
    
    def get_statistics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الخدمة"""
        try:
            response = self.session.get(f"{self.base_url}/statistics")
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"خطأ في الطلب: {response.status_code}")
                
        except Exception as e:
            return {"error": str(e)}
    
    def health_check(self) -> Dict[str, Any]:
        """فحص صحة الخدمة"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "unhealthy", "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}

def example_usage():
    """مثال على الاستخدام"""
    
    # إنشاء عميل
    client = SafeEgyptAIClient("http://localhost:8000")
    
    print("🔍 فحص صحة الخدمة...")
    health = client.health_check()
    print(f"حالة الخدمة: {health.get('status', 'غير معروف')}")
    
    if health.get('status') != 'healthy':
        print("❌ الخدمة غير متاحة")
        return
    
    print("✅ الخدمة متاحة")
    
    # معلومات المشروع
    project_info = {
        'title': 'مشروع تجاري - مجمع المكاتب',
        'location': 'القاهرة، مصر',
        'purpose': 'مباني تجارية ومكاتب'
    }
    
    # تحليل صورة
    print("\n📤 بدء تحليل الصورة...")
    image_path = "sample_drawing.pdf"  # مسار الصورة
    
    # التحقق من وجود الملف
    import os
    if not os.path.exists(image_path):
        print(f"❌ الملف غير موجود: {image_path}")
        print("يرجى وضع ملف صورة للتحليل في نفس المجلد")
        return
    
    # إرسال الطلب
    analysis_response = client.analyze_image(
        image_path=image_path,
        building_type="commercial",
        project_info=project_info
    )
    
    if "error" in analysis_response:
        print(f"❌ خطأ في التحليل: {analysis_response['error']}")
        return
    
    request_id = analysis_response.get('request_id')
    print(f"✅ تم بدء التحليل - معرف الطلب: {request_id}")
    
    # انتظار الإكمال
    print("\n⏳ انتظار إكمال التحليل...")
    result = client.wait_for_completion(request_id, timeout=300)
    
    if "error" in result:
        print(f"❌ خطأ في النتيجة: {result['error']}")
        return
    
    # عرض النتائج
    print("\n📊 نتائج التحليل:")
    print("=" * 50)
    
    # معلومات أساسية
    print(f"📁 اسم الملف: {result.get('file_name', 'غير محدد')}")
    print(f"🏢 نوع المبنى: {result.get('project_info', {}).get('building_type', 'غير محدد')}")
    print(f"📅 تاريخ التحليل: {result.get('analysis_date', 'غير محدد')}")
    print(f"⏱️ وقت المعالجة: {result.get('processing_time', 0):.2f} ثانية")
    print(f"📈 درجة الامتثال: {result.get('compliance_score', 0):.1f}%")
    print(f"✅ الحالة العامة: {result.get('overall_status', 'غير محدد')}")
    
    # العناصر المكتشفة
    detected_elements = result.get('detected_elements', [])
    print(f"\n🔍 العناصر المكتشفة: {len(detected_elements)}")
    
    if detected_elements:
        element_types = {}
        for element in detected_elements:
            element_type = element.get('type', 'غير محدد')
            element_types[element_type] = element_types.get(element_type, 0) + 1
        
        for element_type, count in element_types.items():
            print(f"  - {element_type}: {count}")
    
    # مشاكل الامتثال
    compliance_issues = result.get('compliance_issues', [])
    print(f"\n⚠️ مشاكل الامتثال: {len(compliance_issues)}")
    
    if compliance_issues:
        critical_issues = [i for i in compliance_issues if i.get('severity') == 'critical']
        major_issues = [i for i in compliance_issues if i.get('severity') == 'major']
        minor_issues = [i for i in compliance_issues if i.get('severity') == 'minor']
        
        print(f"  🔴 حرجة: {len(critical_issues)}")
        print(f"  🟡 كبيرة: {len(major_issues)}")
        print(f"  🟢 صغيرة: {len(minor_issues)}")
        
        # عرض المشاكل الحرجة
        if critical_issues:
            print("\n🔴 المشاكل الحرجة:")
            for issue in critical_issues[:3]:  # أول 3 مشاكل
                print(f"  - {issue.get('title', 'عنوان غير محدد')}")
                print(f"    {issue.get('description', 'وصف غير محدد')}")
    
    # التوصيات
    recommendations = result.get('recommendations', [])
    print(f"\n💡 التوصيات: {len(recommendations)}")
    
    if recommendations:
        high_priority = [r for r in recommendations if r.get('priority') == 'high']
        if high_priority:
            print("\n🔴 توصيات عالية الأولوية:")
            for rec in high_priority[:2]:  # أول توصيتين
                print(f"  - {rec.get('title', 'عنوان غير محدد')}")
                print(f"    {rec.get('description', 'وصف غير محدد')}")
    
    # الحصول على التقرير التفصيلي
    print("\n📄 الحصول على التقرير التفصيلي...")
    report = client.get_analysis_report(request_id)
    
    if "error" not in report:
        # حفظ التقرير
        report_filename = f"analysis_report_{request_id}.json"
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"✅ تم حفظ التقرير في: {report_filename}")
    
    # إحصائيات الخدمة
    print("\n📊 إحصائيات الخدمة:")
    stats = client.get_statistics()
    
    if "error" not in stats:
        print(f"  - إجمالي التحليلات: {stats.get('total_analyses', 0)}")
        print(f"  - التحليلات الناجحة: {stats.get('successful_analyses', 0)}")
        print(f"  - التحليلات الفاشلة: {stats.get('failed_analyses', 0)}")
        print(f"  - متوسط وقت المعالجة: {stats.get('average_processing_time', 0):.2f} ثانية")

def integration_with_typescript():
    """مثال على التكامل مع TypeScript/JavaScript"""
    
    typescript_code = """
// TypeScript/JavaScript Integration Example

interface AnalysisRequest {
  file: File;
  buildingType: 'residential' | 'commercial' | 'industrial' | 'educational';
  projectTitle?: string;
  projectLocation?: string;
  projectPurpose?: string;
}

interface AnalysisResponse {
  request_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  progress: number;
  result?: AnalysisResult;
}

class SafeEgyptAIClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }
  
  async analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('building_type', request.buildingType);
    
    if (request.projectTitle) formData.append('project_title', request.projectTitle);
    if (request.projectLocation) formData.append('project_location', request.projectLocation);
    if (request.projectPurpose) formData.append('project_purpose', request.projectPurpose);
    
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
  
  async getAnalysisStatus(requestId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/analysis/${requestId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
  
  async waitForCompletion(requestId: string, timeout: number = 300): Promise<AnalysisResponse> {
    const startTime = Date.now();
    const checkInterval = 5000; // 5 seconds
    
    while (Date.now() - startTime < timeout * 1000) {
      const status = await this.getAnalysisStatus(requestId);
      
      if (status.status === 'completed') {
        return status;
      } else if (status.status === 'failed') {
        throw new Error('Analysis failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    throw new Error('Timeout waiting for analysis completion');
  }
}

// Usage Example
const client = new SafeEgyptAIClient();

async function analyzeDrawing(file: File) {
  try {
    const response = await client.analyzeImage({
      file: file,
      buildingType: 'commercial',
      projectTitle: 'مشروع تجاري',
      projectLocation: 'القاهرة، مصر'
    });
    
    console.log('Analysis started:', response.request_id);
    
    const result = await client.waitForCompletion(response.request_id);
    console.log('Analysis completed:', result);
    
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}
"""
    
    print("\n📝 مثال التكامل مع TypeScript:")
    print("=" * 50)
    print(typescript_code)

if __name__ == "__main__":
    print("🚀 Safe Egypt AI - مثال التكامل")
    print("=" * 50)
    
    # تشغيل المثال
    example_usage()
    
    # عرض مثال TypeScript
    integration_with_typescript()
    
    print("\n✅ انتهى المثال")
