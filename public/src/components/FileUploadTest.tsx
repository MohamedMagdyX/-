import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Brain,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Settings,
  Search,
  Filter,
  Maximize2
} from 'lucide-react';
import DetailedAnalysisViewer from './DetailedAnalysisViewer';
import ComprehensiveAnalysisViewer from './ComprehensiveAnalysisViewer';
import { DetailedAnalysis } from '../services/detailedAnalysisService';
import { ComprehensiveAnalysis, comprehensiveDrawingAnalysisService } from '../services/comprehensiveDrawingAnalysisService';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'error';
  progress: number;
  classification?: string;
  detectedElements?: string[];
  complianceIssues?: any[];
  processingSteps?: ProcessingStep[];
  analysisResult?: any;
  detailedAnalysis?: DetailedAnalysis;
  comprehensiveAnalysis?: ComprehensiveAnalysis;
}

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  details?: string;
  timestamp: Date;
}

const FileUploadTest: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [selectedComprehensiveAnalysis, setSelectedComprehensiveAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تصنيف الملفات
  const classifyFile = (fileName: string): string => {
    const name = fileName.toLowerCase();
    const classifications = {
      'architectural': 'المخططات المعمارية',
      'معماري': 'المخططات المعمارية',
      'structural': 'المخططات الإنشائية',
      'إنشائي': 'المخططات الإنشائية',
      'electrical': 'مخططات الكهرباء',
      'كهرباء': 'مخططات الكهرباء',
      'plumbing': 'مخططات السباكة',
      'سباكة': 'مخططات السباكة',
      'hvac': 'مخططات التكييف',
      'تكييف': 'مخططات التكييف',
      'fire': 'مخططات الحريق',
      'حريق': 'مخططات الحريق',
      'topographic': 'المخططات الطبوغرافية',
      'طبوغرافي': 'المخططات الطبوغرافية',
      'site': 'مخططات الموقع',
      'موقع': 'مخططات الموقع'
    };

    for (const [keyword, classification] of Object.entries(classifications)) {
      if (name.includes(keyword)) {
        return classification;
      }
    }
    return 'المخططات المعمارية';
  };

  // اكتشاف العناصر
  const detectElements = (classification: string): string[] => {
    const elementMap: { [key: string]: string[] } = {
      'المخططات المعمارية': [
        'الجدران الخارجية', 'المخارج الرئيسية', 'المخارج الطارئة',
        'المساحات المفتوحة', 'الغرف والمساحات', 'النوافذ والأبواب',
        'المداخل الرئيسية', 'المساحات المشتركة', 'السلالم'
      ],
      'مخططات الحريق': [
        'أجهزة كشف الدخان', 'أجهزة كشف الحرارة', 'طفايات الحريق',
        'أنظمة الإطفاء التلقائي', 'أنظمة الإنذار', 'أجهزة الإخلاء',
        'أنظمة إدارة الدخان', 'أجهزة الإطفاء اليدوية'
      ],
      'مخططات الكهرباء': [
        'لوحات التوزيع', 'الكابلات', 'المفاتيح', 'المصابيح',
        'أجهزة الإنذار', 'أنظمة الطوارئ', 'أجهزة الحماية',
        'مقابس الكهرباء', 'أنظمة الإنارة'
      ],
      'المخططات الإنشائية': [
        'الأعمدة', 'الكمرات', 'الأساسات', 'البلاطات',
        'الجدران الحاملة', 'الأسقف', 'السلالم الإنشائية',
        'الأقواس', 'العوارض'
      ],
      'مخططات السباكة': [
        'المواسير الرئيسية', 'المواسير الفرعية', 'الصنابير',
        'المراحيض', 'أجهزة الإطفاء', 'أنظمة الصرف',
        'خزانات المياه', 'مضخات المياه'
      ],
      'مخططات التكييف': [
        'وحدات التكييف', 'القنوات', 'المشعات', 'أجهزة التهوية',
        'أجهزة التدفئة', 'أنظمة التبريد', 'أجهزة التحكم',
        'أنظمة التهوية الطارئة'
      ]
    };
    return elementMap[classification] || ['عناصر عامة'];
  };

  // محاكاة فحص المطابقة
  const checkCompliance = (classification: string): any[] => {
    const issues = [];
    const rules = [
      { id: 'rule-001', title: 'تعريف المبنى', severity: 'critical' },
      { id: 'rule-004', title: 'المسافة الدنيا بين المباني', severity: 'major' },
      { id: 'rule-007', title: 'عدد المخارج', severity: 'critical' },
      { id: 'rule-010', title: 'أجهزة كشف الدخان', severity: 'major' },
      { id: 'rule-013', title: 'طفايات الحريق', severity: 'major' },
      { id: 'rule-016', title: 'المواد المقاومة للحريق', severity: 'critical' }
    ];

    rules.forEach(rule => {
      const hasIssue = Math.random() < (rule.severity === 'critical' ? 0.3 : 0.2);
      if (hasIssue) {
        issues.push({
          ...rule,
          description: `مشكلة في ${rule.title}`,
          suggestedFix: `إصلاح مشكلة ${rule.title} حسب المعايير المطلوبة`
        });
      }
    });

    return issues;
  };

  // محاكاة خطوات المعالجة
  const simulateProcessingSteps = async (file: UploadedFile): Promise<ProcessingStep[]> => {
    const steps: ProcessingStep[] = [];
    
    // خطوة 1: تصنيف الملف
    const step1: ProcessingStep = {
      id: `step1-${file.id}`,
      name: `تصنيف الملف: ${file.file.name}`,
      status: 'processing',
      timestamp: new Date()
    };
    steps.push(step1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    step1.status = 'completed';
    step1.duration = 1000;
    step1.details = `تم تصنيف الملف كـ: ${classifyFile(file.file.name)}`;

    // خطوة 2: اكتشاف العناصر
    const step2: ProcessingStep = {
      id: `step2-${file.id}`,
      name: 'اكتشاف العناصر في الرسم',
      status: 'processing',
      timestamp: new Date()
    };
    steps.push(step2);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const detectedElements = detectElements(classifyFile(file.file.name));
    step2.status = 'completed';
    step2.duration = 1500;
    step2.details = `تم اكتشاف ${detectedElements.length} عنصر`;

    // خطوة 3: فحص المطابقة
    const step3: ProcessingStep = {
      id: `step3-${file.id}`,
      name: 'فحص المطابقة لقواعد الكود المصري',
      status: 'processing',
      timestamp: new Date()
    };
    steps.push(step3);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const complianceIssues = checkCompliance(classifyFile(file.file.name));
    step3.status = 'completed';
    step3.duration = 2000;
    step3.details = `تم فحص 6 قواعد، تم اكتشاف ${complianceIssues.length} مشكلة`;

    // خطوة 4: حساب النقاط
    const step4: ProcessingStep = {
      id: `step4-${file.id}`,
      name: 'حساب درجة الامتثال',
      status: 'processing',
      timestamp: new Date()
    };
    steps.push(step4);
    await new Promise(resolve => setTimeout(resolve, 800));
    const criticalIssues = complianceIssues.filter(issue => issue.severity === 'critical').length;
    const majorIssues = complianceIssues.filter(issue => issue.severity === 'major').length;
    const complianceScore = Math.max(0, 100 - (criticalIssues * 20 + majorIssues * 10));
    step4.status = 'completed';
    step4.duration = 800;
    step4.details = `درجة الامتثال: ${complianceScore}%`;

    return steps;
  };

  // معالجة الملف
  const processFile = async (file: UploadedFile) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'analyzing' as const } : f
    ));

    try {
      // تشغيل التحليل الشامل
      const comprehensiveAnalysis = await comprehensiveDrawingAnalysisService.performComprehensiveAnalysis(
        file.file.name,
        file.size,
        file.type,
        file.file.name // محاكاة محتوى الملف
      );

      // إنشاء تحليل مبسط للتوافق مع النظام الحالي
      const processingSteps = await simulateProcessingSteps(file);
      const classification = classifyFile(file.file.name);
      const detectedElements = detectElements(classification);
      const complianceIssues = checkCompliance(classification);
      
      const criticalIssues = comprehensiveAnalysis.summary.criticalIssues;
      const majorIssues = comprehensiveAnalysis.summary.majorIssues;
      const minorIssues = comprehensiveAnalysis.summary.minorIssues;
      
      const complianceScore = comprehensiveAnalysis.complianceScore;
      const overallStatus = comprehensiveAnalysis.overallStatus;

      const analysisResult = {
        classification,
        detectedElements,
        complianceIssues,
        overallStatus,
        complianceScore,
        processingTime: processingSteps.reduce((total, step) => total + (step.duration || 0), 0)
      };

      // إنشاء تحليل تفصيلي مبسط
      const detailedAnalysis = {
        id: `analysis-${file.id}-${Date.now()}`,
        fileName: file.file.name,
        fileSize: file.size,
        fileType: file.type,
        classification,
        overallStatus,
        complianceScore,
        processingTime: analysisResult.processingTime,
        steps: processingSteps.map(step => ({
          id: step.id,
          name: step.name,
          description: `معالجة ${step.name}`,
          status: step.status,
          startTime: step.timestamp,
          endTime: step.duration ? new Date(step.timestamp.getTime() + step.duration) : undefined,
          duration: step.duration,
          progress: step.status === 'completed' ? 100 : 0,
          details: {
            subSteps: [],
            metrics: [],
            logs: [],
            errors: [],
            warnings: []
          }
        })),
        summary: {
          totalSteps: processingSteps.length,
          completedSteps: processingSteps.filter(s => s.status === 'completed').length,
          failedSteps: processingSteps.filter(s => s.status === 'error').length,
          warningsCount: 0,
          errorsCount: 0,
          totalIssues: criticalIssues + majorIssues + minorIssues,
          criticalIssues,
          majorIssues,
          minorIssues
        },
        detectedElements: [{
          category: classification,
          elements: detectedElements.map(name => ({
            name,
            confidence: 0.85 + Math.random() * 0.1,
            properties: {
              type: 'عنصر معماري',
              material: 'خرسانة مسلحة',
              status: 'جيد'
            }
          }))
        }],
        complianceAnalysis: complianceIssues.map((issue, idx) => ({
          ruleId: `rule-${idx + 1}`,
          ruleTitle: issue.title,
          category: 'السلامة العامة',
          severity: issue.severity,
          status: issue.severity === 'critical' ? 'non_compliant' : 'compliant',
          description: issue.description,
          suggestedFix: issue.suggestedFix,
          evidence: [{
            type: 'text',
            content: 'تم فحص المخطط بناءً على القواعد المعمول بها',
            confidence: 0.9
          }],
          impact: {
            safety: issue.severity === 'critical' ? 8 : issue.severity === 'major' ? 6 : 4,
            cost: issue.severity === 'critical' ? 8 : issue.severity === 'major' ? 5 : 3,
            timeline: issue.severity === 'critical' ? '1-2 أسابيع' : issue.severity === 'major' ? '3-5 أيام' : '1-2 أيام',
            complexity: issue.severity === 'critical' ? 'high' : issue.severity === 'major' ? 'medium' : 'low'
          }
        })),
        recommendations: complianceIssues.filter(issue => issue.severity === 'critical' || issue.severity === 'major').map(issue => ({
          priority: issue.severity === 'critical' ? 'high' : 'medium',
          category: 'السلامة العامة',
          title: `إصلاح مشكلة ${issue.title}`,
          description: `تنفيذ الحل المقترح لمشكلة ${issue.title}`,
          benefits: [
            'تحسين مستوى السلامة',
            'الامتثال للمعايير القانونية',
            'تقليل مخاطر الحريق'
          ],
          implementation: {
            steps: [
              'مراجعة المخططات الحالية',
              'تحديد المواقع المطلوب تعديلها',
              'إعداد المخططات المحدثة',
              'تنفيذ التعديلات'
            ],
            resources: [
              'مهندس معماري',
              'مهندس حماية من الحريق'
            ],
            timeline: issue.severity === 'critical' ? '1-2 أسابيع' : '3-5 أيام',
            cost: issue.severity === 'critical' ? '15,000 - 25,000 جنيه' : '8,000 - 15,000 جنيه'
          }
        })),
        technicalDetails: {
          processingEngine: 'Safe Egypt AI Engine v2.1',
          aiModel: 'Fire Safety Compliance Model v1.8',
          version: '2.1.0',
          confidence: 94.5,
          accuracy: 96.2,
          performance: {
            cpu: Math.round(Math.random() * 30 + 20),
            memory: Math.round(Math.random() * 40 + 30),
            disk: Math.round(Math.random() * 20 + 10),
            network: Math.round(Math.random() * 15 + 5)
          }
        }
      };

      setUploadedFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'completed' as const,
          classification,
          detectedElements,
          complianceIssues,
          processingSteps,
          analysisResult,
          detailedAnalysis,
          comprehensiveAnalysis
        } : f
      ));

    } catch (error) {
      console.error('خطأ في معالجة الملف:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'error' as const } : f
      ));
    }
  };

  // معالجة جميع الملفات
  const processAllFiles = async () => {
    setIsAnalyzing(true);
    
    for (const file of uploadedFiles) {
      if (file.status === 'uploaded') {
        await processFile(file);
      }
    }
    
    setIsAnalyzing(false);
  };

  // رفع الملفات
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        file,
        preview: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      // محاكاة رفع الملف
      const uploadInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === uploadedFile.id) {
            const newProgress = Math.min(f.progress + 10, 100);
            if (newProgress === 100) {
              clearInterval(uploadInterval);
              return { ...f, progress: 100, status: 'uploaded' as const };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 100);
    });
  }, []);

  // معالجة السحب والإفلات
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // حذف ملف
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // إعادة معالجة ملف
  const reprocessFile = (file: UploadedFile) => {
    const updatedFile = { ...file, status: 'uploaded' as const };
    setUploadedFiles(prev => prev.map(f => f.id === file.id ? updatedFile : f));
    processFile(updatedFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'analyzing':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Badge className="bg-blue-100 text-blue-800">جاري الرفع</Badge>;
      case 'uploaded':
        return <Badge className="bg-green-100 text-green-800">مرفوع</Badge>;
      case 'analyzing':
        return <Badge className="bg-yellow-100 text-yellow-800">جاري التحليل</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">خطأ</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">غير محدد</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'major':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* منطقة رفع الملفات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            رفع الملفات للاختبار
          </CardTitle>
          <CardDescription>
            اسحب الملفات هنا أو اضغط لاختيار الملفات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">اسحب الملفات هنا</p>
            <p className="text-sm text-muted-foreground mb-4">
              أو اضغط لاختيار الملفات من جهازك
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              اختيار الملفات
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.dwg,.jpg,.png,.jpeg"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* قائمة الملفات المرفوعة */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                الملفات المرفوعة ({uploadedFiles.length})
              </span>
              {uploadedFiles.some(f => f.status === 'uploaded') && (
                <Button
                  onClick={processAllFiles}
                  disabled={isAnalyzing}
                  size="sm"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      بدء التحليل
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium">{file.preview}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusBadge(file.status)}
                      {file.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reprocessFile(file)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* شريط التقدم */}
                  {file.status === 'uploading' && (
                    <div className="space-y-2">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {file.progress}% مكتمل
                      </p>
                    </div>
                  )}

                  {/* نتائج التحليل */}
                  {file.status === 'completed' && file.analysisResult && (
                    <div className="space-y-4 mt-4">
                      {/* التصنيف والعناصر */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Search className="h-4 w-4 mr-2" />
                            التصنيف والعناصر
                          </h4>
                          <div className="space-y-2">
                            <Badge variant="outline">{file.analysisResult.classification}</Badge>
                            <div className="flex flex-wrap gap-1">
                              {file.analysisResult.detectedElements?.map((element: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {element}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* درجة الامتثال */}
                        <div className="text-center">
                          <h4 className="font-medium mb-2">درجة الامتثال</h4>
                          <div className="text-3xl font-bold text-primary">
                            {file.analysisResult.complianceScore}%
                          </div>
                          <Badge className={`mt-2 ${
                            file.analysisResult.overallStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            file.analysisResult.overallStatus === 'needs_revision' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {file.analysisResult.overallStatus === 'approved' ? 'موافق عليه' :
                             file.analysisResult.overallStatus === 'needs_revision' ? 'يحتاج تعديل' :
                             'مرفوض'}
                          </Badge>
                          
                          {/* أزرار التحليل */}
                          <div className="flex flex-col space-y-2 mt-3">
                            {file.detailedAnalysis && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAnalysis(file.detailedAnalysis!)}
                              >
                                <Maximize2 className="h-4 w-4 mr-2" />
                                عرض التحليل التفصيلي
                              </Button>
                            )}
                            {file.comprehensiveAnalysis && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setSelectedComprehensiveAnalysis(file.comprehensiveAnalysis!)}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                التحليل الشامل (قواعد الكود)
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* خطوات المعالجة */}
                      {file.processingSteps && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            خطوات المعالجة
                          </h4>
                          <div className="space-y-2">
                            {file.processingSteps.map((step) => (
                              <div key={step.id} className="flex items-center space-x-3 space-x-reverse p-2 bg-muted rounded">
                                {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{step.name}</p>
                                  {step.details && (
                                    <p className="text-xs text-muted-foreground">{step.details}</p>
                                  )}
                                  {step.duration && (
                                    <p className="text-xs text-muted-foreground">المدة: {step.duration}ms</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* المشاكل المكتشفة */}
                      {file.analysisResult.complianceIssues && file.analysisResult.complianceIssues.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            المشاكل المكتشفة ({file.analysisResult.complianceIssues.length})
                          </h4>
                          <div className="space-y-2">
                            {file.analysisResult.complianceIssues.map((issue: any, idx: number) => (
                              <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-start space-x-3 space-x-reverse">
                                  {getSeverityIcon(issue.severity)}
                                  <div className="flex-1">
                                    <h5 className={`font-medium ${
                                      issue.severity === 'critical' ? 'text-red-600' :
                                      issue.severity === 'major' ? 'text-yellow-600' : 'text-blue-600'
                                    }`}>
                                      {issue.title}
                                    </h5>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {issue.description}
                                    </p>
                                    {issue.suggestedFix && (
                                      <div className="mt-2 p-2 bg-blue-50 rounded border-r-4 border-blue-200">
                                        <p className="text-sm text-blue-800">
                                          <strong>💡 الحل المقترح:</strong> {issue.suggestedFix}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* عارض التحليل التفصيلي */}
      {selectedAnalysis && (
        <DetailedAnalysisViewer
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
          onExport={() => {
            // منطق التصدير
            console.log('تصدير التحليل:', selectedAnalysis);
          }}
          onReanalyze={() => {
            // منطق إعادة التحليل
            console.log('إعادة تحليل:', selectedAnalysis.fileName);
          }}
        />
      )}

      {/* عارض التحليل الشامل */}
      {selectedComprehensiveAnalysis && (
        <ComprehensiveAnalysisViewer
          analysis={selectedComprehensiveAnalysis}
          onClose={() => setSelectedComprehensiveAnalysis(null)}
          onExport={() => {
            // منطق التصدير
            console.log('تصدير التحليل الشامل:', selectedComprehensiveAnalysis);
          }}
          onReanalyze={() => {
            // منطق إعادة التحليل
            console.log('إعادة تحليل شامل:', selectedComprehensiveAnalysis.fileName);
          }}
        />
      )}
    </div>
  );
};

export default FileUploadTest;
