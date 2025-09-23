import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Save, 
  ArrowRight,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { mockDB } from '@/data/mockDatabase';

export const ApplicantSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    // إعدادات الإشعارات
    emailNotifications: true,
    projectUpdates: true,
    systemAlerts: true,
    
    // إعدادات الخصوصية
    profileVisibility: 'private',
    dataSharing: false,
    
    // إعدادات اللغة والمنطقة
    language: 'ar',
    timezone: 'Africa/Cairo',
    dateFormat: 'dd/mm/yyyy',
    
    // إعدادات الأمان
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // منع الرجوع نهائياً لصفحة تسجيل الدخول أو الصفحة الرئيسية
  useEffect(() => {
    const preventBack = (event: PopStateEvent) => {
      // منع الحدث نهائياً
      event.preventDefault();
      // إضافة حالة جديدة للتاريخ لمنع الرجوع
      window.history.pushState(null, '', window.location.href);
    };

    // إضافة مستمع للحدث
    window.addEventListener('popstate', preventBack);
    
    // إضافة حالة جديدة للتاريخ
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // محاكاة حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('تم حفظ الإعدادات بنجاح!');
      
      // إخفاء الرسالة بعد 3 ثوان
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('جميع حقول كلمة المرور مطلوبة');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // التحقق من وجود المستخدم
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // التحقق من كلمة المرور الحالية
      const currentUser = mockDB.findUserById(user.id);
      if (!currentUser) {
        throw new Error('المستخدم غير موجود في قاعدة البيانات');
      }

      // التحقق من كلمة المرور الحالية (في النظام الحقيقي، يجب تشفير كلمة المرور)
      if (currentPassword !== currentUser.password) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // محاكاة تغيير كلمة المرور
      await new Promise(resolve => setTimeout(resolve, 1000));

      // تحديث كلمة المرور في قاعدة البيانات المحلية
      mockDB.updateUser(user.id, {
        ...currentUser,
        password: newPassword
      });
      
      setSuccessMessage('تم تغيير كلمة المرور بنجاح!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
                <p className="text-sm text-gray-600">إدارة إعدادات حسابك وتفضيلاتك</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للوحة التحكم</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2 space-x-reverse text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* إعدادات الإشعارات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Bell className="w-5 h-5" />
                <span>الإشعارات</span>
              </CardTitle>
              <CardDescription>
                اختر كيفية تلقي الإشعارات والتحديثات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>الإشعارات عبر البريد الإلكتروني</Label>
                  <p className="text-sm text-gray-600">تلقي الإشعارات على بريدك الإلكتروني</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>تحديثات المشاريع</Label>
                  <p className="text-sm text-gray-600">إشعارات حول حالة مشاريعك</p>
                </div>
                <Switch
                  checked={settings.projectUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, projectUpdates: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>تنبيهات النظام</Label>
                  <p className="text-sm text-gray-600">إشعارات مهمة من النظام</p>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, systemAlerts: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* إعدادات الأمان */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Shield className="w-5 h-5" />
                <span>الأمان</span>
              </CardTitle>
              <CardDescription>
                إدارة إعدادات الأمان وكلمة المرور
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
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
              
              <div>
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
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
              
              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
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
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* إعدادات إضافية */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* إعدادات الخصوصية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Globe className="w-5 h-5" />
                <span>الخصوصية</span>
              </CardTitle>
              <CardDescription>
                إدارة إعدادات الخصوصية ومشاركة البيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>مشاركة البيانات</Label>
                  <p className="text-sm text-gray-600">السماح بمشاركة بياناتك مع الجهات المختصة</p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, dataSharing: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* إعدادات اللغة والمنطقة */}
          <Card>
            <CardHeader>
              <CardTitle>اللغة والمنطقة</CardTitle>
              <CardDescription>
                إعدادات اللغة والتوقيت والتاريخ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اللغة</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div>
                <Label>التوقيت</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={settings.timezone}
                  onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* زر الحفظ */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  );
};
