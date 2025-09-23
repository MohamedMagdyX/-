import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Building,
  BarChart3,
  FileCheck,
  Zap,
  Brain,
  TrendingUp,
  Target,
  Activity,
  Settings,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import FileUploadTest from '../components/FileUploadTest';

const AdvancedTestAutoReview: React.FC = () => {
  const [projectInfo, setProjectInfo] = useState({
    name: 'مشروع اختبار متقدم',
    buildingType: 'سكني',
    location: 'القاهرة الجديدة',
    area: '1500',
    floors: '8'
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🧪 اختبار متقدم لنظام المراجعة التلقائية
          </h1>
          <p className="text-muted-foreground">
            رفع ملفات ومراقبة التصنيف والخطوات التفصيلية للمعالجة باستخدام الذكاء الاصطناعي
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* لوحة التحكم */}
          <div className="lg:col-span-1 space-y-6">
            {/* معلومات المشروع */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  معلومات المشروع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="projectName">اسم المشروع</Label>
                  <Input
                    id="projectName"
                    value={projectInfo.name}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم المشروع"
                  />
                </div>
                <div>
                  <Label htmlFor="buildingType">نوع المبنى</Label>
                  <Input
                    id="buildingType"
                    value={projectInfo.buildingType}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, buildingType: e.target.value }))}
                    placeholder="سكني، تجاري، صناعي"
                  />
                </div>
                <div>
                  <Label htmlFor="area">المساحة (متر مربع)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={projectInfo.area}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="1500"
                  />
                </div>
                <div>
                  <Label htmlFor="floors">عدد الطوابق</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={projectInfo.floors}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, floors: e.target.value }))}
                    placeholder="8"
                  />
                </div>
              </CardContent>
            </Card>

            {/* إحصائيات سريعة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  إحصائيات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">30</div>
                    <p className="text-xs text-blue-600">قاعدة فحص</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">8</div>
                    <p className="text-xs text-green-600">أنواع رسومات</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">15</div>
                    <p className="text-xs text-yellow-600">عنصر كشف</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
                    <p className="text-xs text-purple-600">دقة التحليل</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* مميزات النظام */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  مميزات النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">تحليل ذكي للرسومات</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm">فحص شامل للمطابقة</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Activity className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">تتبع خطوات المعالجة</span>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">تقارير مفصلة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* منطقة الاختبار الرئيسية */}
          <div className="lg:col-span-3">
            <FileUploadTest />
          </div>
        </div>

        {/* دليل الاستخدام */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2" />
              دليل استخدام النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-medium mb-2">رفع الملفات</h3>
                <p className="text-sm text-muted-foreground">
                  اسحب الملفات أو اخترها من جهازك (PDF, DWG, JPG)
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-medium mb-2">التصنيف التلقائي</h3>
                <p className="text-sm text-muted-foreground">
                  يتم تصنيف الملفات تلقائياً حسب النوع (معماري، حريق، كهرباء)
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-yellow-600">3</span>
                </div>
                <h3 className="font-medium mb-2">التحليل والفحص</h3>
                <p className="text-sm text-muted-foreground">
                  اكتشاف العناصر وفحص المطابقة مع قواعد الكود المصري
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="font-medium mb-2">التقرير النهائي</h3>
                <p className="text-sm text-muted-foreground">
                  عرض النتائج والتوصيات مع درجة الامتثال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أنواع الملفات المدعومة */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              أنواع الملفات المدعومة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">الرسومات المعمارية</h4>
                <div className="space-y-2">
                  <Badge variant="outline">المخططات المعمارية</Badge>
                  <Badge variant="outline">مخططات الموقع</Badge>
                  <Badge variant="outline">المخططات الطبوغرافية</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">الرسومات التقنية</h4>
                <div className="space-y-2">
                  <Badge variant="outline">مخططات الحريق</Badge>
                  <Badge variant="outline">مخططات الكهرباء</Badge>
                  <Badge variant="outline">مخططات السباكة</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-600">الرسومات الإنشائية</h4>
                <div className="space-y-2">
                  <Badge variant="outline">المخططات الإنشائية</Badge>
                  <Badge variant="outline">مخططات التكييف</Badge>
                  <Badge variant="outline">الرسومات التفصيلية</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إجراءات سريعة */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                عرض أمثلة
              </Button>
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                تحميل دليل الاستخدام
              </Button>
              <Button variant="outline" className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة تعيين
              </Button>
              <Button variant="outline" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                إعدادات متقدمة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedTestAutoReview;