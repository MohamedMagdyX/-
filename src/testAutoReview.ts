// ملف اختبار نظام المراجعة التلقائية
import { autoReviewSystem } from './services/autoReviewService';
import { fireCodeDB } from './data/fireCodeDatabase';

// بيانات مشروع تجريبي
const testProject = {
  id: 'test-project-001',
  applicantId: 'applicant-001',
  projectName: 'مشروع اختبار المراجعة التلقائية',
  buildingType: 'سكني',
  location: 'القاهرة الجديدة',
  area: 1500,
  floors: 8,
  status: 'submitted' as const,
  submissionDate: new Date().toISOString(),
  drawings: [
    {
      id: 'drawing-001',
      projectId: 'test-project-001',
      fileName: 'المخططات المعمارية.pdf',
      fileType: 'pdf',
      fileSize: 2048000,
      uploadDate: new Date().toISOString(),
      status: 'pending' as const,
      reviewResults: []
    },
    {
      id: 'drawing-002',
      projectId: 'test-project-001',
      fileName: 'مخططات الحريق.pdf',
      fileType: 'pdf',
      fileSize: 1536000,
      uploadDate: new Date().toISOString(),
      status: 'pending' as const,
      reviewResults: []
    },
    {
      id: 'drawing-003',
      projectId: 'test-project-001',
      fileName: 'مخططات الكهرباء.pdf',
      fileType: 'pdf',
      fileSize: 1024000,
      uploadDate: new Date().toISOString(),
      status: 'pending' as const,
      reviewResults: []
    }
  ]
};

// دالة اختبار المراجعة التلقائية
export async function testAutoReview() {
  console.log('🧪 بدء اختبار نظام المراجعة التلقائية');
  console.log('=' .repeat(50));
  
  try {
    // إضافة المشروع التجريبي
    console.log('📋 إضافة المشروع التجريبي...');
    try {
      fireCodeDB.addProject(testProject as any);
      console.log('✅ تم إضافة المشروع بنجاح');
    } catch (error) {
      console.log('ℹ️ المشروع موجود بالفعل');
    }

    // تشغيل المراجعة التلقائية
    console.log('\n🔍 بدء المراجعة التلقائية...');
    const results = await autoReviewSystem.performAutoReview(testProject.id);
    
    console.log('\n📊 نتائج المراجعة:');
    console.log(`عدد الرسومات المراجعة: ${results.length}`);
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.drawingId}`);
      console.log(`   الحالة: ${result.overallStatus}`);
      console.log(`   درجة الامتثال: ${result.complianceScore}%`);
      console.log(`   مشاكل حرجة: ${result.criticalIssues}`);
      console.log(`   مشاكل كبيرة: ${result.majorIssues}`);
      console.log(`   مشاكل صغيرة: ${result.minorIssues}`);
    });

    // إنشاء التقرير
    console.log('\n📄 إنشاء التقرير...');
    const report = await autoReviewSystem.generateAutoReviewReport(testProject.id);
    
    console.log('\n📋 التقرير النهائي:');
    console.log(`المشروع: ${report.project.name}`);
    console.log(`الحالة الإجمالية: ${report.overallStatus}`);
    console.log(`درجة الامتثال: ${report.complianceScore}%`);
    console.log(`إجمالي المشاكل: ${report.criticalIssues + report.majorIssues + report.minorIssues}`);
    
    console.log('\n✅ تم إكمال الاختبار بنجاح!');
    
    return { results, report };
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    throw error;
  }
}

// دالة اختبار سريع
export async function quickTest() {
  console.log('⚡ اختبار سريع لنظام المراجعة');
  
  try {
    const results = await testAutoReview();
    console.log('🎉 الاختبار السريع مكتمل!');
    return results;
  } catch (error) {
    console.error('💥 فشل الاختبار السريع:', error);
    throw error;
  }
}

// تصدير للاستخدام في وحدة التحكم
if (typeof window !== 'undefined') {
  (window as any).testAutoReview = testAutoReview;
  (window as any).quickTest = quickTest;
}
