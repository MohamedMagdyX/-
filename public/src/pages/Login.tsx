import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_ACCOUNT } from '@/data/mockDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Building2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '@/assets/logo-main.jpg';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccess('تم تسجيل الدخول بنجاح! سيتم توجيهك للوحة التحكم...');
        // التوجيه التلقائي بعد تسجيل الدخول الناجح
        setTimeout(() => {
          if (email.trim().toLowerCase() === ADMIN_ACCOUNT.email.toLowerCase()) {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
              <img 
                src={logoImage} 
                alt="منصة الحماية الذكي للمنشآت المصرية"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            نظام الحماية الذكي
          </h1>
          <p className="text-muted-foreground">
            تسجيل الدخول إلى منصة الذكاء الاصطناعي لحماية المنشآت
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild className="w-full">
              <Link to="/" className="text-sm">
                العودة للصفحة الرئيسية
              </Link>
            </Button>
          </div>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك للوصول إلى المنصة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-right pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
