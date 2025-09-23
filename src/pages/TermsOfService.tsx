import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">شروط الاستخدام</h1>
              <p className="text-muted-foreground mt-1">
                الشروط والأحكام المنظمة لاستخدام منصة الحماية الذكي
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
                <FileText className="w-5 h-5" />
                مقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                مرحباً بك في منصة الحماية الذكي للمنشآت المصرية. باستخدامك لهذه المنصة، 
                فإنك توافق على الالتزام بالشروط والأحكام المذكورة أدناه.
              </p>
              <p className="text-sm text-muted-foreground">
                آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
              </p>
            </CardContent>
          </Card>

          {/* Acceptance */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                قبول الشروط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                باستخدامك لهذه المنصة، فإنك تؤكد أنك:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                <li>تقرأ وفهمت هذه الشروط والأحكام</li>
                <li>توافق على الالتزام بها</li>
                <li>لديك الصلاحية القانونية للدخول في هذه الاتفاقية</li>
                <li>تقدم معلومات صحيحة ودقيقة</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                مسؤوليات المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">يجب على المستخدم:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>تقديم معلومات صحيحة ودقيقة</li>
                  <li>الحفاظ على سرية بيانات الدخول</li>
                  <li>عدم مشاركة الحساب مع الآخرين</li>
                  <li>الالتزام بالقوانين واللوائح المصرية</li>
                  <li>عدم استخدام المنصة لأغراض غير قانونية</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">يمنع على المستخدم:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>محاولة اختراق النظام</li>
                  <li>إرسال فيروسات أو برامج ضارة</li>
                  <li>انتهاك حقوق الملكية الفكرية</li>
                  <li>استخدام المنصة لإرسال رسائل مزعجة</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>وصف الخدمة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                تقدم المنصة الخدمات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                <li>مراجعة الرسومات الهندسية باستخدام الذكاء الاصطناعي</li>
                <li>فحص توافق التصميمات مع الكود المصري للحماية من الحريق</li>
                <li>إصدار التقارير والموافقات الإلكترونية</li>
                <li>تتبع حالة الطلبات والمراجعات</li>
                <li>أنظمة الإنذار المبكر للحماية من الحريق</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                حدود المسؤولية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  لا تتحمل المنصة المسؤولية عن:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                  <li>الأضرار الناتجة عن سوء استخدام المنصة</li>
                  <li>فقدان البيانات بسبب أسباب خارجة عن إرادتنا</li>
                  <li>انقطاع الخدمة لأسباب تقنية أو قوة قاهرة</li>
                  <li>القرارات المتخذة بناءً على تقارير المنصة</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                إنهاء الخدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                يحق للمنصة إنهاء أو تعليق حسابك في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                <li>انتهاك شروط الاستخدام</li>
                <li>تقديم معلومات كاذبة أو مضللة</li>
                <li>استخدام المنصة لأغراض غير قانونية</li>
                <li>عدم النشاط لفترة طويلة</li>
              </ul>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>تعديل الشروط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. 
                سيتم إشعار المستخدمين بأي تغييرات عبر البريد الإلكتروني أو عبر المنصة.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>تواصل معنا</CardTitle>
              <CardDescription>
                إذا كان لديك أي أسئلة حول شروط الاستخدام هذه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  البريد الإلكتروني: legal@safeegypt.ai
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
