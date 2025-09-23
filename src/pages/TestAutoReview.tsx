import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  FileText,
  Building,
  MapPin,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react';
import { autoReviewSystem } from '../services/autoReviewService';
import { fireCodeDB } from '../data/fireCodeDatabase';

// بيانات مشروع تجريبي للاختبار
const testProjectData = {
  id: 'test-project-001',
  applicantId: 'applicant-001',
  projectName: 'مشروع اختبار المراجعة التلقائية',
  buildingType: 'سكني',
  location: 'القاهرة الجديدة',
  area: 1500,
  floors: 8,
  status: 'submitted',
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

const TestAutoReview: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const runTest = async () => {
    setIsRunning(true);
    setError(null);
    setTestResults(null);
    setCurrentStep('جاري إعداد المشروع التجريبي...');

    try {
      // إضافة المشروع التجريبي إلى قاعدة البيانات
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep('جاري إضافة المشروع إلى قاعدة البيانات...');
      
      // محاولة إضافة المشروع (قد يفشل إذا كان موجوداً)
      try {
        fireCodeDB.addProject(testProjectData as any);
      } catch (e) {
        // المشروع موجود بالفعل، هذا طبيعي
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep('جاري بدء المراجعة التلقائية...');

      // تشغيل المراجعة التلقائية
      const results = await autoReviewSystem.performAutoReview(testProjectData.id);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep('جاري إنشاء التقرير...');

      // إنشاء التقرير
      const report = await autoReviewSystem.generateAutoReviewReport(testProjectData.id);
      
      setCurrentStep('تم الانتهاء من المراجعة!');
      
      setTestResults({
        results,
        report,
        project: testProjectData
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />مرفوض</Badge>;
      case 'needs_revision':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />يحتاج تعديل</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Info className="h-3 w-3 mr-1" />غير محدد</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'major':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'major':
        return 'text-yellow-600';
      case 'minor':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🧪 اختبار نظام المراجعة التلقائية
          </h1>
          <p className="text-muted-foreground">
            اختبار شامل لنظام المراجعة التلقائية باستخدام الذكاء الاصطناعي
          </p>
        </div>

        {/* معلومات المشروع التجريبي */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              المشروع التجريبي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم المشروع</p>
                <p className="font-medium">{testProjectData.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نوع المبنى</p>
                <p className="font-medium">{testProjectData.buildingType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المساحة</p>
                <p className="font-medium">{testProjectData.area} متر مربع</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد الطوابق</p>
                <p className="font-medium">{testProjectData.floors} طابق</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">الرسومات المرفقة:</p>
              <div className="flex flex-wrap gap-2">
                {testProjectData.drawings.map((drawing) => (
                  <Badge key={drawing.id} variant="outline" className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {drawing.fileName}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* زر التشغيل */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              {!isRunning ? (
                <Button 
                  onClick={runTest}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-5 w-5 mr-2" />
                  تشغيل اختبار المراجعة التلقائية
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 mr-2 animate-spin text-primary" />
                    <span className="text-lg font-medium">جاري التشغيل...</span>
                  </div>
                  {currentStep && (
                    <p className="text-muted-foreground">{currentStep}</p>
                  )}
                  <Progress value={66} className="w-full max-w-md mx-auto" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* رسالة الخطأ */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* النتائج */}
        {testResults && (
          <div className="space-y-6">
            {/* ملخص النتائج */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  نتائج الاختبار (مختصر)
                </CardTitle>
                <CardDescription className="text-sm">أهم المؤشرات فقط</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(testResults.report.overallStatus)}
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">{testResults.report.complianceScore}% امتثال</Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">إجمالي: {testResults.report.totalIssues}</Badge>
                  <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">حرجة: {testResults.report.criticalIssues}</Badge>
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">كبيرة: {testResults.report.majorIssues}</Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">صغيرة: {testResults.report.minorIssues}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* تفاصيل كل رسم */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">تفاصيل مراجعة الرسومات</h3>
              {testResults.results.map((result: any, index: number) => (
                <Card key={result.drawingId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        {result.drawingFileName}
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.overallStatus)}
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">{result.complianceScore}%</Badge>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {result.drawingType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.issues && result.issues.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">المشاكل المكتشفة:</h4>
                        {result.issues.map((issue: any, issueIndex: number) => (
                          <div key={issueIndex} className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-start space-x-3 space-x-reverse">
                              {getSeverityIcon(issue.severity)}
                              <div className="flex-1">
                                <h5 className={`font-medium ${getSeverityColor(issue.severity)}`}>
                                  {issue.ruleTitle}
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
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p>لا توجد مشاكل في هذا الرسم</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* إعادة التشغيل */}
            <div className="text-center space-y-4">
              <Button 
                onClick={runTest}
                variant="outline"
                disabled={isRunning}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة تشغيل الاختبار
              </Button>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  للاختبار المتقدم مع رفع ملفات حقيقية:
                </p>
                <Button 
                  onClick={() => window.location.href = '/advanced-test-auto-review'}
                  className="bg-primary hover:bg-primary/90"
                >
                  🧪 الانتقال للاختبار المتقدم
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAutoReview;
