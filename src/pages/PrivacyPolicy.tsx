import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight, Lock, Eye, Database, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">سياسة الخصوصية</h1>
              <p className="text-muted-foreground mt-1">
                نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowRight className="w-4 h-4 mr-2" />
                العودة للصفحة الرئيسية
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Introduction */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                مقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                نحن في منصة الحماية الذكي للمنشآت المصرية نلتزم بحماية خصوصيتك وبياناتك الشخصية. 
                هذه السياسة توضح كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام خدماتنا.
              </p>
              <p className="text-sm text-muted-foreground">
                آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                البيانات التي نجمعها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">البيانات الشخصية:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>الاسم الكامل</li>
                  <li>البريد الإلكتروني</li>
                  <li>رقم الهاتف</li>
                  <li>نوع المستخدم (مقدم طلب أو أدمن)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">بيانات المشاريع:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>معلومات المشروع والموقع</li>
                  <li>الرسومات والمخططات الهندسية</li>
                  <li>تقارير المراجعة والموافقات</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                كيفية استخدام البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  نستخدم البيانات التي نجمعها للأغراض التالية:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>توفير خدمات مراجعة تراخيص المباني</li>
                  <li>تحليل الرسومات باستخدام الذكاء الاصطناعي</li>
                  <li>إصدار التقارير والموافقات</li>
                  <li>تحسين خدماتنا وتطويرها</li>
                  <li>التواصل معك حول طلباتك</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                حماية البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  نطبق أعلى معايير الأمان لحماية بياناتك:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>الوصول المقيد للبيانات حسب الصلاحيات</li>
                  <li>مراقبة مستمرة للأنظمة الأمنية</li>
                  <li>نسخ احتياطية منتظمة للبيانات</li>
                  <li>تدريب الموظفين على أمن المعلومات</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                حقوقك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  لديك الحق في:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>الوصول إلى بياناتك الشخصية</li>
                  <li>تصحيح أو تحديث بياناتك</li>
                  <li>حذف بياناتك الشخصية</li>
                  <li>سحب الموافقة على معالجة البيانات</li>
                  <li>التقدم بشكوى إلى الجهات المختصة</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>تواصل معنا</CardTitle>
              <CardDescription>
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  البريد الإلكتروني: privacy@safeegypt.ai
                </p>
                <p className="text-muted-foreground">
                  الهاتف: +20 2 1234 5678
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
