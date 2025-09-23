/**
 * خدمة التحليل الشامل في الخلفية
 * تعمل تلقائياً عند رفع الرسومات بدون إظهار واجهة للمستخدم
 */

import { comprehensiveDrawingAnalysisService, ComprehensiveAnalysis } from './comprehensiveDrawingAnalysisService';

export interface BackgroundAnalysisResult {
  fileName: string;
  analysis: ComprehensiveAnalysis;
  timestamp: Date;
  status: 'completed' | 'failed';
}

class BackgroundAnalysisService {
  private analysisQueue: Array<{
    id: string;
    file: File;
    timestamp: Date;
  }> = [];
  
  private completedAnalyses: BackgroundAnalysisResult[] = [];
  private isProcessing = false;

  /**
   * إضافة رسم للتحليل في الخلفية
   */
  addDrawingForAnalysis(file: File): string {
    const id = `bg-analysis-${Date.now()}-${Math.random()}`;
    
    this.analysisQueue.push({
      id,
      file,
      timestamp: new Date()
    });

    // بدء المعالجة إذا لم تكن جارية
    if (!this.isProcessing) {
      this.processQueue();
    }

    console.log(`تم إضافة الرسم للتحليل في الخلفية: ${file.name}`);
    return id;
  }

  /**
   * معالجة قائمة الانتظار
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.analysisQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.analysisQueue.length > 0) {
      const { id, file } = this.analysisQueue.shift()!;
      
      try {
        console.log(`بدء تحليل الرسم في الخلفية: ${file.name}`);
        
        // تشغيل التحليل الشامل
        const analysis = await comprehensiveDrawingAnalysisService.performComprehensiveAnalysis(
          file.name,
          file.size,
          file.type,
          file.name // محاكاة محتوى الملف
        );

        // حفظ النتيجة
        this.completedAnalyses.push({
          fileName: file.name,
          analysis,
          timestamp: new Date(),
          status: 'completed'
        });

        console.log(`تم تحليل الرسم بنجاح: ${file.name} - درجة المطابقة: ${analysis.complianceScore}%`);

        // حفظ في localStorage للمراجعة اللاحقة
        this.saveAnalysisResult(file.name, analysis);

      } catch (error) {
        console.error(`فشل في تحليل الرسم: ${file.name}`, error);
        
        this.completedAnalyses.push({
          fileName: file.name,
          analysis: {} as ComprehensiveAnalysis,
          timestamp: new Date(),
          status: 'failed'
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * حفظ نتيجة التحليل في localStorage
   */
  private saveAnalysisResult(fileName: string, analysis: ComprehensiveAnalysis): void {
    try {
      const key = `background_analysis_${fileName}_${Date.now()}`;
      const data = {
        fileName,
        analysis,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`تم حفظ نتيجة التحليل: ${fileName}`);
    } catch (error) {
      console.error('خطأ في حفظ نتيجة التحليل:', error);
    }
  }

  /**
   * الحصول على جميع التحليلات المكتملة
   */
  getCompletedAnalyses(): BackgroundAnalysisResult[] {
    return this.completedAnalyses;
  }

  /**
   * الحصول على تحليل محدد
   */
  getAnalysisByFileName(fileName: string): BackgroundAnalysisResult | null {
    return this.completedAnalyses.find(a => a.fileName === fileName) || null;
  }

  /**
   * الحصول على إحصائيات التحليل
   */
  getAnalysisStats(): {
    total: number;
    completed: number;
    failed: number;
    averageComplianceScore: number;
  } {
    const total = this.completedAnalyses.length;
    const completed = this.completedAnalyses.filter(a => a.status === 'completed').length;
    const failed = this.completedAnalyses.filter(a => a.status === 'failed').length;
    
    const completedAnalyses = this.completedAnalyses.filter(a => a.status === 'completed');
    const averageComplianceScore = completedAnalyses.length > 0 
      ? completedAnalyses.reduce((sum, a) => sum + a.analysis.complianceScore, 0) / completedAnalyses.length
      : 0;

    return {
      total,
      completed,
      failed,
      averageComplianceScore: Math.round(averageComplianceScore)
    };
  }

  /**
   * مسح قائمة الانتظار
   */
  clearQueue(): void {
    this.analysisQueue = [];
    console.log('تم مسح قائمة انتظار التحليل');
  }

  /**
   * مسح جميع النتائج
   */
  clearResults(): void {
    this.completedAnalyses = [];
    console.log('تم مسح جميع نتائج التحليل');
  }

  /**
   * الحصول على حالة المعالجة
   */
  getProcessingStatus(): {
    isProcessing: boolean;
    queueLength: number;
    completedCount: number;
  } {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.analysisQueue.length,
      completedCount: this.completedAnalyses.length
    };
  }
}

// إنشاء instance واحد للخدمة
export const backgroundAnalysisService = new BackgroundAnalysisService();

// تصدير الخدمة للاستخدام في أجزاء أخرى من التطبيق
export default backgroundAnalysisService;
