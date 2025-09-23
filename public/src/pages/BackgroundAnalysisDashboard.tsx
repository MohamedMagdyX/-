/**
 * لوحة تحكم التحليل الشامل في الخلفية
 * للمديرين والمهندسين لمراجعة نتائج التحليل
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Settings, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  BarChart3,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { backgroundAnalysisService, BackgroundAnalysisResult } from '../services/backgroundAnalysisService';
import ComprehensiveAnalysisViewer from '../components/ComprehensiveAnalysisViewer';
import { ComprehensiveAnalysis } from '../services/comprehensiveDrawingAnalysisService';

const BackgroundAnalysisDashboard: React.FC = () => {
  const [analyses, setAnalyses] = useState<BackgroundAnalysisResult[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    averageComplianceScore: 0
  });
  const [selectedAnalysis, setSelectedAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    queueLength: 0,
    completedCount: 0
  });

  // تحديث البيانات كل 5 ثوان
  useEffect(() => {
    const updateData = () => {
      setAnalyses(backgroundAnalysisService.getCompletedAnalyses());
      setStats(backgroundAnalysisService.getAnalysisStats());
      setProcessingStatus(backgroundAnalysisService.getProcessingStatus());
    };

    updateData();
    const interval = setInterval(updateData, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleViewAnalysis = (analysis: ComprehensiveAnalysis) => {
    setSelectedAnalysis(analysis);
  };

  const handleExportAnalysis = (fileName: string, analysis: ComprehensiveAnalysis) => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analysis_${fileName}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRefresh = () => {
    setAnalyses(backgroundAnalysisService.getCompletedAnalyses());
    setStats(backgroundAnalysisService.getAnalysisStats());
    setProcessingStatus(backgroundAnalysisService.getProcessingStatus());
  };

  const handleClearResults = () => {
    if (confirm('هل أنت متأكد من مسح جميع نتائج التحليل؟')) {
      backgroundAnalysisService.clearResults();
      handleRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان الرئيسي */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم التحليل الشامل</h1>
            <p className="text-gray-600 mt-2">مراجعة نتائج تحليل الرسومات بالذكاء الاصطناعي</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
            <Button onClick={handleClearResults} variant="destructive">
              مسح النتائج
            </Button>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التحليلات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">جميع التحليلات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">تحليلات ناجحة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">فشلت</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">تحليلات فاشلة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط المطابقة</CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.averageComplianceScore}%</div>
              <p className="text-xs text-muted-foreground">درجة المطابقة</p>
            </CardContent>
          </Card>
        </div>

        {/* حالة المعالجة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              حالة المعالجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {processingStatus.isProcessing ? 'نشط' : 'خامل'}
                </div>
                <p className="text-sm text-gray-600">حالة المعالجة</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {processingStatus.queueLength}
                </div>
                <p className="text-sm text-gray-600">في قائمة الانتظار</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {processingStatus.completedCount}
                </div>
                <p className="text-sm text-gray-600">مكتملة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة التحليلات */}
        <Card>
          <CardHeader>
            <CardTitle>نتائج التحليل</CardTitle>
            <CardDescription>
              جميع التحليلات المكتملة والفاشلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد تحليلات متاحة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{result.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(result.timestamp).toLocaleString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge variant={result.status === 'completed' ? 'default' : 'destructive'}>
                          {result.status === 'completed' ? 'مكتمل' : 'فاشل'}
                        </Badge>
                        
                        {result.status === 'completed' && result.analysis && (
                          <>
                            <div className="text-center">
                              <p className="text-lg font-bold text-primary">
                                {result.analysis.complianceScore}%
                              </p>
                              <p className="text-xs text-gray-600">مطابقة</p>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAnalysis(result.analysis!)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              عرض
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportAnalysis(result.fileName, result.analysis!)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              تصدير
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* تفاصيل التحليل */}
                    {result.status === 'completed' && result.analysis && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium text-lg text-blue-600">
                              {result.analysis.summary.totalComponents}
                            </p>
                            <p className="text-gray-600">مكونات النظام</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-lg text-green-600">
                              {result.analysis.summary.compliantPoints}
                            </p>
                            <p className="text-gray-600">نقاط مطابقة</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-lg text-orange-600">
                              {result.analysis.summary.nonCompliantPoints}
                            </p>
                            <p className="text-gray-600">نقاط تحتاج مراجعة</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-lg text-red-600">
                              {result.analysis.summary.criticalIssues}
                            </p>
                            <p className="text-gray-600">مشاكل حرجة</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* عارض التحليل الشامل */}
        {selectedAnalysis && (
          <ComprehensiveAnalysisViewer
            analysis={selectedAnalysis}
            onClose={() => setSelectedAnalysis(null)}
            onExport={() => {
              console.log('تصدير التحليل الشامل:', selectedAnalysis);
            }}
            onReanalyze={() => {
              console.log('إعادة تحليل شامل:', selectedAnalysis.fileName);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BackgroundAnalysisDashboard;
