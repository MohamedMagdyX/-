import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo-main.jpg';

export const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
                <img 
                  src={logoImage} 
                  alt="منصة الحماية الذكي للمنشآت المصرية"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-600">غير مصرح لك بالوصول</CardTitle>
            <CardDescription>
              ليس لديك الصلاحية للوصول إلى هذه الصفحة
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              يبدو أنك تحاول الوصول إلى صفحة تتطلب صلاحيات مختلفة عن نوع حسابك الحالي.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  العودة للصفحة الرئيسية
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">
                  تسجيل الدخول بحساب آخر
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
