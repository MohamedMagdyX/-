import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  ArrowLeft,
  Building2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Check,
  AlertTriangle,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockDB } from '@/data/mockDatabase';
import { fireCodeDB } from '@/data/fireCodeDatabase';

export const ApplicantProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [projectStats, setProjectStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0,
    needsRevision: 0
  });
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // منع الرجوع نهائياً
  useEffect(() => {
    const preventBack = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  // تحديث البيانات عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
      });
      
      // الحصول على الإحصائيات الحقيقية للمشاريع
      try {
        const stats = fireCodeDB.getUserProjectStats(user.id);
        setProjectStats(stats);
      } catch (error) {
        console.error('Error getting project stats:', error);
        // في حالة الخطأ، استخدم القيم الافتراضية
        setProjectStats({
          total: 0,
          approved: 0,
          pending: 0,
          underReview: 0,
          rejected: 0,
          needsRevision: 0
        });
      }
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // التحقق من صحة البيانات
      if (!editData.name.trim()) {
        setErrorMessage('الاسم مطلوب');
        setIsLoading(false);
        return;
      }

      if (!editData.email.trim()) {
        setErrorMessage('البريد الإلكتروني مطلوب');
        setIsLoading(false);
        return;
      }

      // التحقق من صحة البريد الإلكتروني
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        setErrorMessage('البريد الإلكتروني غير صحيح');
        setIsLoading(false);
        return;
      }

      // التحقق من أن البريد الإلكتروني غير مستخدم من قبل مستخدم آخر
      const existingUser = mockDB.findUserByEmail(editData.email);
      if (existingUser && existingUser.id !== user.id) {
        setErrorMessage('البريد الإلكتروني مستخدم من قبل مستخدم آخر');
        setIsLoading(false);
        return;
      }

      // محاكاة حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));

      // تحديث البيانات في قاعدة البيانات المحلية
      const updatedUser = {
        ...user,
        name: editData.name.trim(),
        email: editData.email.trim(),
      };

      // حفظ البيانات المحدثة
      mockDB.updateUser(user.id, updatedUser);

      setIsEditing(false);
      setSuccessMessage('تم حفظ التغييرات بنجاح!');
      
      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      setErrorMessage('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // بيانات إحصائية وهمية
  const stats = {
    totalProjects: 5,
    approvedProjects: 3,
    pendingProjects: 1,
    rejectedProjects: 1,
    joinDate: '2024-01-01'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                الملف الشخصي
              </h1>
              <p className="text-muted-foreground mt-1">
                إدارة معلوماتك الشخصية وإحصائياتك
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* الملف الشخصي */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  المعلومات الشخصية
                </CardTitle>
                <CardDescription>
                  إدارة معلوماتك الشخصية الأساسية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* رسائل النجاح والخطأ */}
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {errorMessage && (
                  <Alert className="border-red-200 bg-red-50 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* الصورة الشخصية */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {user?.role === 'applicant' ? 'مقدم طلب' : 'أدمن'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* تفاصيل الحساب */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{user?.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{user?.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع الحساب</Label>
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span>{user?.role === 'applicant' ? 'مقدم طلب' : 'أدمن'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>تاريخ الانضمام</Label>
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{stats.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            حفظ التغييرات
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel} 
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleEdit} className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      تعديل المعلومات
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الإحصائيات */}
          <div className="space-y-6">
            {/* إحصائيات المشاريع */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  إحصائيات المشاريع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">إجمالي المشاريع</span>
                  </div>
                  <Badge variant="secondary">{projectStats.total}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">مشاريع موافق عليها</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {projectStats.approved}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">مشاريع قيد المراجعة</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {projectStats.underReview}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm">مشاريع مرفوضة</span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {projectStats.rejected}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">مشاريع تحتاج تعديل</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {projectStats.needsRevision}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* معلومات إضافية */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات إضافية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>• يمكنك تعديل معلوماتك الشخصية في أي وقت</p>
                  <p>• جميع التغييرات محفوظة تلقائياً</p>
                  <p>• يمكنك مراجعة إحصائيات مشاريعك هنا</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
