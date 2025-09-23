import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  FileText, X, CheckCircle, AlertTriangle, XCircle, 
  Info, Clock, BarChart3, Settings, MapPin, 
  Wifi, Volume2, Zap, Eye, Download, RefreshCw
} from 'lucide-react';
import { ComprehensiveAnalysis } from '../services/comprehensiveDrawingAnalysisService';

interface ComprehensiveAnalysisViewerProps {
  analysis: ComprehensiveAnalysis;
  onClose?: () => void;
  onExport?: () => void;
  onReanalyze?: () => void;
}

const ComprehensiveAnalysisViewer: React.FC<ComprehensiveAnalysisViewerProps> = ({
  analysis,
  onClose,
  onExport,
  onReanalyze
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'non_compliant':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'major':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'minor':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'FACP':
        return <Settings className="h-4 w-4" />;
      case 'smoke_detector':
        return <Wifi className="h-4 w-4" />;
      case 'heat_detector':
        return <Zap className="h-4 w-4" />;
      case 'sounder':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">{analysis.fileName}</h2>
                <p className="text-sm text-muted-foreground">
                  {analysis.projectInfo.title} • {analysis.projectInfo.location}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
            <Button variant="outline" size="sm" onClick={onReanalyze}>
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة تحليل
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              إغلاق
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="project">معلومات المشروع</TabsTrigger>
              <TabsTrigger value="drawing">بيانات الرسم</TabsTrigger>
              <TabsTrigger value="components">مكونات النظام</TabsTrigger>
              <TabsTrigger value="locations">المواقع</TabsTrigger>
              <TabsTrigger value="validation">نقاط التحقق</TabsTrigger>
              <TabsTrigger value="references">المرجعيات</TabsTrigger>
              <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {/* نظرة عامة */}
              <TabsContent value="overview" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  {/* ملخص النتائج */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        ملخص التحليل الشامل
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <div className="text-3xl font-bold text-primary mb-2">
                            {analysis.complianceScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">درجة المطابقة</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {analysis.summary.totalComponents}
                          </div>
                          <p className="text-sm text-muted-foreground">مكونات النظام</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {analysis.summary.totalLocations}
                          </div>
                          <p className="text-sm text-muted-foreground">المواقع</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {analysis.summary.totalValidationPoints}
                          </div>
                          <p className="text-sm text-muted-foreground">نقاط التحقق</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* حالة التحقق */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        حالة نقاط التحقق
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">مطابق</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {analysis.summary.compliantPoints}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">غير مطابق</span>
                          </div>
                          <Badge variant="destructive">
                            {analysis.summary.nonCompliantPoints}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">مشاكل حرجة</span>
                          </div>
                          <Badge variant="destructive">{analysis.summary.criticalIssues}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">مشاكل كبيرة</span>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {analysis.summary.majorIssues}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* معلومات المشروع السريعة */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        معلومات المشروع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">عنوان المشروع</p>
                          <p className="font-medium">{analysis.projectInfo.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الموقع</p>
                          <p className="font-medium">{analysis.projectInfo.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">المنطقة</p>
                          <p className="font-medium">{analysis.projectInfo.district}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">المقياس</p>
                          <p className="font-medium">{analysis.projectInfo.scale}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* معلومات المشروع */}
              <TabsContent value="project" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات المشروع الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">عنوان المشروع</p>
                          <p className="font-medium">{analysis.projectInfo.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الموقع</p>
                          <p className="font-medium">{analysis.projectInfo.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">المنطقة</p>
                          <p className="font-medium">{analysis.projectInfo.district}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الغرض</p>
                          <p className="font-medium">{analysis.projectInfo.purpose}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">عنوان الرسم</p>
                          <p className="font-medium">{analysis.projectInfo.drawingTitle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">المقياس</p>
                          <p className="font-medium">{analysis.projectInfo.scale}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات المراجعة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">رقم المراجعة</p>
                          <p className="font-medium">{analysis.projectInfo.revision.number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">وصف المراجعة</p>
                          <p className="font-medium">{analysis.projectInfo.revision.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ المراجعة</p>
                          <p className="font-medium">{analysis.projectInfo.revision.date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">معتمد من</p>
                          <p className="font-medium">{analysis.projectInfo.revision.approvedBy}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* بيانات الرسم */}
              <TabsContent value="drawing" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>بيانات الرسم التقنية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">رقم الرسم</p>
                          <p className="font-medium text-xs">{analysis.drawingData.drawingNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">مرجع ملف النموذج</p>
                          <p className="font-medium text-xs">{analysis.drawingData.modelFileReference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">استشاري التصميم الرئيسي</p>
                          <p className="font-medium">{analysis.drawingData.leadDesignConsultant}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">مهندس التصميم</p>
                          <p className="font-medium">{analysis.drawingData.designArchitect}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الاستشاري الفرعي</p>
                          <p className="font-medium">{analysis.drawingData.subConsultant}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">إعداد</p>
                          <p className="font-medium">{analysis.drawingData.authoredBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">مراجعة</p>
                          <p className="font-medium">{analysis.drawingData.checkedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">حالة مراجعة المهندس</p>
                          <p className="font-medium">{analysis.drawingData.engineerReviewStatus}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>الملاحظات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">الأبعاد</p>
                        <p className="font-medium">{analysis.notes.dimensions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">المناسيب</p>
                        <p className="font-medium">{analysis.notes.elevations}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">المراجع</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysis.notes.references.map((ref, idx) => (
                            <li key={idx}>{ref}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ملاحظات عامة</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysis.notes.generalNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* مكونات النظام */}
              <TabsContent value="components" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        مكونات نظام الإنذار من الحريق
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.fireAlarmComponents.map((component) => (
                          <div key={component.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                {getComponentIcon(component.type)}
                                <div>
                                  <h4 className="font-medium">{component.model}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {component.location} • {component.gridReference}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {component.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">المنطقة</p>
                                <p className="font-medium">{component.zone}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">العنوان</p>
                                <p className="font-medium">{component.address}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">التغطية</p>
                                <p className="font-medium">{component.coverage} م²</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">الجهد</p>
                                <p className="font-medium">{component.specifications.voltage || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* المواقع */}
              <TabsContent value="locations" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        تفاصيل المواقع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysis.locations.map((location) => (
                          <div key={location.name} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium">{location.name}</h4>
                              <Badge variant="outline">
                                {location.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">المرجع:</span>
                                <span className="font-medium">{location.gridReference}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">المساحة:</span>
                                <span className="font-medium">{location.area} م²</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">السعة:</span>
                                <span className="font-medium">{location.occupancy} شخص</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">الحمل الحراري:</span>
                                <span className="font-medium">{location.fireLoad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">الوصول:</span>
                                <span className="font-medium">{location.accessibility}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">المكونات:</span>
                                <span className="font-medium">{location.components.length}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* نقاط التحقق */}
              <TabsContent value="validation" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        نقاط التحقق والامتثال
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.validationPoints.map((point) => (
                          <div key={point.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                {getStatusIcon(point.status)}
                                <div>
                                  <h4 className="font-medium">{point.description}</h4>
                                  <p className="text-sm text-muted-foreground">{point.requirement}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Badge className={getSeverityColor(point.severity)}>
                                  {point.severity}
                                </Badge>
                                <Badge variant={
                                  point.status === 'compliant' ? 'default' :
                                  point.status === 'non_compliant' ? 'destructive' : 'secondary'
                                }>
                                  {point.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">الأدلة:</p>
                                <p className="font-medium">{point.evidence}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">التوصية:</p>
                                <p className="font-medium">{point.recommendation}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">مرجع القاعدة:</p>
                                <p className="font-medium text-xs">{point.ruleReference}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* المرجعيات */}
              <TabsContent value="references" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>الرسومات المرجعية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.referenceDrawings.map((ref, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{ref.title}</h4>
                                <p className="text-sm text-muted-foreground">{ref.drawingNumber}</p>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Badge variant="outline">
                                  {ref.type}
                                </Badge>
                                <Badge variant={
                                  ref.status === 'current' ? 'default' :
                                  ref.status === 'superseded' ? 'destructive' : 'secondary'
                                }>
                                  {ref.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground">المراجعة:</p>
                              <p className="font-medium">{ref.revision}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* التوصيات */}
              <TabsContent value="recommendations" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>التوصيات والإجراءات المطلوبة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <CardTitle className="text-lg">{rec.title}</CardTitle>
                              <Badge variant={
                                rec.priority === 'high' ? 'destructive' :
                                rec.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {rec.priority}
                              </Badge>
                            </div>
                            <CardDescription className="mb-4">{rec.description}</CardDescription>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-2">خطوات التنفيذ:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                  {rec.implementation.steps.map((step, stepIdx) => (
                                    <li key={stepIdx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-muted-foreground">الموارد:</p>
                                  <p className="font-medium">{rec.implementation.resources.join(', ')}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">الجدول الزمني:</p>
                                  <p className="font-medium">{rec.implementation.timeline}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">التكلفة:</p>
                                  <p className="font-medium">{rec.implementation.cost}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisViewer;
