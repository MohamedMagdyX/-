// نظام إصدار التقارير PDF
import { fireCodeDB, ReviewReport, Project } from '../data/fireCodeDatabase';

export interface PDFReportData {
  project: Project;
  report: ReviewReport;
  reviewResults: any[];
  generatedDate: string;
  reportType: 'review' | 'license';
}

class PDFReportGenerator {
  // إنشاء تقرير المراجعة بصيغة PDF
  async generateReviewReportPDF(projectId: string): Promise<string> {
    const project = fireCodeDB.getProjectById(projectId);
    if (!project || !project.reviewReport) {
      throw new Error('Project or review report not found');
    }

    const reportData: PDFReportData = {
      project,
      report: project.reviewReport,
      reviewResults: project.drawings.flatMap(d => d.reviewResults),
      generatedDate: new Date().toLocaleDateString('ar-EG'),
      reportType: 'review'
    };

    // محاكاة إنشاء PDF - في التطبيق الحقيقي سيكون هذا مكتبة PDF حقيقية
    const pdfContent = this.generatePDFContent(reportData);
    const pdfPath = `/reports/review-report-${projectId}-${Date.now()}.pdf`;
    
    // محاكاة حفظ الملف
    console.log('PDF Report Generated:', pdfPath);
    console.log('PDF Content:', pdfContent);
    
    return pdfPath;
  }

  // إنشاء ترخيص بصيغة PDF
  async generateLicensePDF(projectId: string): Promise<string> {
    const project = fireCodeDB.getProjectById(projectId);
    if (!project || !project.license) {
      throw new Error('Project or license not found');
    }

    const licenseData = {
      project,
      license: project.license,
      generatedDate: new Date().toLocaleDateString('ar-EG'),
      reportType: 'license' as const
    };

    // محاكاة إنشاء PDF للترخيص
    const pdfContent = this.generateLicensePDFContent(licenseData);
    const pdfPath = `/licenses/license-${projectId}-${Date.now()}.pdf`;
    
    console.log('License PDF Generated:', pdfPath);
    console.log('License Content:', pdfContent);
    
    return pdfPath;
  }

  // إنشاء محتوى PDF للتقرير
  private generatePDFContent(data: PDFReportData): string {
    const { project, report, reviewResults } = data;
    
    return `
# تقرير المراجعة التلقائية للمشروع

## معلومات المشروع
- **اسم المشروع:** ${project.projectName}
- **نوع المبنى:** ${project.buildingType}
- **الموقع:** ${project.location}
- **المساحة:** ${project.area} متر مربع
- **عدد الطوابق:** ${project.floors}
- **تاريخ الإرسال:** ${new Date(project.submissionDate).toLocaleDateString('ar-EG')}
- **تاريخ المراجعة:** ${new Date(report.generatedDate).toLocaleDateString('ar-EG')}

## نتائج المراجعة
- **الحالة العامة:** ${this.getStatusText(report.overallStatus)}
- **نسبة المطابقة:** ${report.complianceScore}%
- **المخالفات الحرجة:** ${report.criticalIssues}
- **المخالفات الكبيرة:** ${report.majorIssues}
- **المخالفات الصغيرة:** ${report.minorIssues}

## تفاصيل المراجعة
${reviewResults.map(result => `
### ${result.ruleTitle}
- **الحالة:** ${this.getStatusText(result.status)}
- **الخطورة:** ${this.getSeverityText(result.severity)}
- **الملاحظات:** ${result.notes}
- **الحل المقترح:** ${result.suggestedFix || 'لا يوجد حل مقترح'}
`).join('\n')}

## التوصيات
${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

---
تم إنشاء هذا التقرير تلقائياً بواسطة نظام Safe Egypt AI
تاريخ الإنشاء: ${data.generatedDate}
    `.trim();
  }

  // إنشاء محتوى PDF للترخيص
  private generateLicensePDFContent(data: any): string {
    const { project, license } = data;
    
    return `
# ترخيص حماية المباني من أخطار الحريق

## بيانات الترخيص
- **رقم الترخيص:** ${license.licenseNumber}
- **تاريخ الإصدار:** ${new Date(license.issueDate).toLocaleDateString('ar-EG')}
- **تاريخ الانتهاء:** ${new Date(license.expiryDate).toLocaleDateString('ar-EG')}
- **الحالة:** ${license.status === 'active' ? 'نشط' : 'منتهي الصلاحية'}

## بيانات المشروع
- **اسم المشروع:** ${project.projectName}
- **نوع المبنى:** ${project.buildingType}
- **الموقع:** ${project.location}
- **المساحة:** ${project.area} متر مربع
- **عدد الطوابق:** ${project.floors}

## شروط الترخيص
1. يجب الالتزام بجميع متطلبات الكود المصري لحماية المباني من أخطار الحريق
2. يجب إجراء صيانة دورية لجميع أنظمة الحماية
3. يجب إبلاغ الجهات المختصة بأي تعديلات على المبنى
4. يجب تجديد الترخيص قبل انتهاء صلاحيته

## توقيعات
- **المهندس المسؤول:** ________________
- **مقدم الطلب:** ________________
- **تاريخ التوقيع:** ${data.generatedDate}

---
تم إصدار هذا الترخيص بواسطة نظام Safe Egypt AI
رقم الترخيص: ${license.licenseNumber}
    `.trim();
  }

  // تحويل حالة المشروع إلى نص
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'approved': 'موافق عليه',
      'rejected': 'مرفوض',
      'needs_revision': 'يحتاج تعديل',
      'under_review': 'قيد المراجعة',
      'submitted': 'تم الإرسال',
      'compliant': 'مطابق',
      'non_compliant': 'غير مطابق',
      'needs_attention': 'يحتاج انتباه'
    };
    return statusMap[status] || status;
  }

  // تحويل مستوى الخطورة إلى نص
  private getSeverityText(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'critical': 'حرجة',
      'major': 'كبيرة',
      'minor': 'صغيرة'
    };
    return severityMap[severity] || severity;
  }

  // تحميل ملف PDF
  downloadPDF(pdfPath: string, filename: string): void {
    // محاكاة تحميل الملف - في التطبيق الحقيقي سيكون هذا تحميل حقيقي
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = filename;
    link.click();
  }

  // إنشاء تقرير شامل للمشروع
  async generateComprehensiveReport(projectId: string): Promise<{
    reviewReport: string;
    license?: string;
  }> {
    const project = fireCodeDB.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const results: { reviewReport: string; license?: string } = {
      reviewReport: ''
    };

    // إنشاء تقرير المراجعة
    if (project.reviewReport) {
      results.reviewReport = await this.generateReviewReportPDF(projectId);
    }

    // إنشاء الترخيص إذا كان متوفراً
    if (project.license) {
      results.license = await this.generateLicensePDF(projectId);
    }

    return results;
  }
}

// إنشاء instance واحد من مولد التقارير
export const pdfReportGenerator = new PDFReportGenerator();
