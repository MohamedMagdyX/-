import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Download,
  User,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fireCodeDB } from '@/data/fireCodeDatabase';
import DashboardChatBot from '@/components/DashboardChatBot';
import VoiceApplication from '@/components/VoiceApplication';

interface Application {
  id: string;
  projectName: string;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  submittedDate: string;
  lastUpdate: string;
}

export const ApplicantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0,
    needsRevision: 0
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // منع الرجوع نهائياً لصفحة تسجيل الدخول أو الصفحة الرئيسية
  useEffect(() => {
    const preventBack = (event: PopStateEvent) => {
      // منع الحدث نهائياً
      event.preventDefault();
      
      // إضافة حالة جديدة للتاريخ لمنع الرجوع
      window.history.pushState(null, '', window.location.href);
    };

    // إضافة حالة للتاريخ لمنع الرجوع
    window.history.pushState(null, '', window.location.href);
    
    // إضافة مستمع للحدث
    window.addEventListener('popstate', preventBack);

    // تنظيف المستمع عند إلغاء التحميل
    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  // الحصول على الإحصائيات الحقيقية للمشاريع
  useEffect(() => {
    if (user) {
      try {
        // تحديث توصيات التقارير القديمة لتظهر التفاصيل الجديدة
        try { fireCodeDB.refreshAllReportsRecommendations(); } catch {}
        const stats = fireCodeDB.getUserProjectStats(user.id);
        setProjectStats(stats);
        const projects = fireCodeDB.getProjectsByApplicant(user.id);
        const mapped: Application[] = projects.map(p => ({
          id: p.id,
          projectName: p.projectName,
          status: p.status as Application['status'],
          submittedDate: p.submissionDate,
          lastUpdate: p.reviewDate || p.submissionDate,
        }));
        setApplications(mapped);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/applicant/profile');
  };

  const handleSettings = () => {
    navigate('/applicant/settings');
  };

  const handleHelp = () => {
    navigate('/applicant/help');
  };

  const viewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDetailsOpen(true);
  };

  const downloadProjectReport = (projectId: string) => {
    const project = fireCodeDB.getProjectById(projectId);
    if (!project) return;
    const approved = project.status === 'approved';
    const hasLicense = !!project.license;
    const licenseNo = project.license?.licenseNumber || '-';
    const issueDate = project.license ? new Date(project.license.issueDate).toLocaleDateString('ar-EG') : '-';
    const expiryDate = project.license ? new Date(project.license.expiryDate).toLocaleDateString('ar-EG') : '-';
    const statusColor = approved ? '#16a34a' : (project.status === 'rejected' ? '#dc2626' : '#ea580c');
    const origin = window.location.origin;
    const reportHtml = `
      <html lang="ar"><head><meta charset="utf-8" />
      <title>${approved ? 'شهادة ترخيص حماية من الحريق' : 'تقرير مراجعة مشروع'}</title>
      <style>
        @page { size: A4; margin: 18mm; }
        body{font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Noto Sans",sans-serif; direction: rtl; padding:0; color:#0f172a}
        .brand{display:flex; align-items:center; gap:12px}
        .brand-logo{width:40px; height:40px; border-radius:8px; background:
          radial-gradient(circle at 30% 30%, #fde047 0 40%, transparent 40%),
          linear-gradient(135deg, #ef4444, #b91c1c); position:relative}
        .brand-logo:after{content:''; position:absolute; inset:8px; border:2px solid rgba(255,255,255,.9); border-radius:6px}
        .brand-img{width:48px; height:48px; object-fit:contain; border-radius:8px; border:1px solid #fecaca; background:#fff}
        .brand-title{font-weight:800; font-size:18px; color:#b91c1c}
        .header{display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #ef4444; padding-bottom:12px; margin-bottom:16px}
        .subtitle{color:#64748b; font-size:12px}
        .badge{display:inline-block; padding:4px 10px; border-radius:999px; border:1px solid #e2e8f0; font-weight:600; color:${statusColor}}
        .section{border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; margin:12px 0; background:#fff}
        .section-title{margin:0 0 10px; color:#dc2626; font-size:16px}
        .row{display:flex; justify-content:space-between; gap:16px; margin:6px 0}
        .key{color:#475569}
        .value{font-weight:600}
        .license-card{border:2px solid #16a34a; border-radius:16px; background:linear-gradient(0deg,#f0fdf4,#ffffff); padding:18px; margin:14px 0}
        .license-title{margin:0 0 6px; color:#065f46}
        .watermark{position:fixed; inset:0; opacity:.05; display:flex; align-items:center; justify-content:center; font-size:72px; font-weight:800; color:#dc2626; pointer-events:none}
        .footer{margin-top:16px; display:flex; justify-content:space-between; align-items:center; color:#64748b; font-size:12px}
        .stamp{border:2px dashed #ef4444; color:#ef4444; padding:6px 10px; border-radius:8px; font-weight:700}
      </style></head><body>
      <div class="watermark">منصة الحماية الذكية</div>
      <div class="header">
        <div class="brand">
          <img class="brand-img" src="${origin}/logo.png" alt="Logo" onerror="this.style.display='none';document.getElementById('brand-fallback').style.display='block';" />
          <div id="brand-fallback" class="brand-logo" style="display:none"></div>
          <div>
            <div class="brand-title">منصة الحماية الذكية للمنشآت المصرية</div>
            <div class="subtitle">نظام المراجعة الذكية وفقاً للكود المصري لمكافحة الحريق</div>
          </div>
        </div>
        <div>
          <div class="badge">الحالة: ${project.status}</div>
        </div>
      </div>

      ${approved ? `
      <div class="license-card">
        <h2 class="license-title">شهادة ترخيص حماية من أخطار الحريق</h2>
        <div class="row"><div class="key">رقم الترخيص:</div><div class="value">${licenseNo}</div></div>
        <div class="row"><div class="key">تاريخ الإصدار:</div><div class="value">${issueDate}</div></div>
        <div class="row"><div class="key">تاريخ الانتهاء:</div><div class="value">${expiryDate}</div></div>
        <div class="row"><div class="key">اسم المشروع:</div><div class="value">${project.projectName}</div></div>
        <div class="row"><div class="key">العنوان:</div><div class="value">${project.projectAddress || project.location || '-'}</div></div>
      </div>
      ` : ''}

      <div class="section">
        <h3 class="section-title">بيانات أساسية</h3>
        <div class="row"><div class="key">نوع المبنى:</div><div class="value">${project.buildingType}</div></div>
        <div class="row"><div class="key">المساحة (م²):</div><div class="value">${project.area}</div></div>
        <div class="row"><div class="key">الطوابق:</div><div class="value">${project.floors}</div></div>
        <div class="row"><div class="key">ارتفاع المبنى (م):</div><div class="value">${project.buildingHeight ?? '-'}</div></div>
        <div class="row"><div class="key">إجمالي السعة:</div><div class="value">${project.totalOccupancy ?? '-'}</div></div>
      </div>

      

      ${project.reviewReport ? `
      <div class="section">
        <h3 class="section-title">نتيجة المراجعة</h3>
        <div class="row"><div class="key">الحالة النهائية:</div><div class="value">${project.reviewReport.overallStatus}</div></div>
        <div class="row"><div class="key">درجة الامتثال:</div><div class="value">${project.reviewReport.complianceScore}%</div></div>
        ${project.reviewReport.recommendations?.length ? `<div style="margin-top:8px">
          <div class="key" style="margin-bottom:6px">التوصيات:</div>
          <ul style="margin:0; padding-inline-start:18px">${project.reviewReport.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>` : ''}
      </div>` : ''}

      <div class="footer">
        <div>تم إنشاء التقرير بواسطة النظام الذكي في ${new Date().toLocaleString('ar-EG')}</div>
        <div class="stamp">معتمد</div>
      </div>

      <script>window.onload=()=>{window.print();}</script>
      </body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(reportHtml);
      w.document.close();
    }
  };

  const selectedProject = selectedProjectId ? fireCodeDB.getProjectById(selectedProjectId) : undefined;

  // Handle voice application form filling
  const handleVoiceFormFilled = (data: {
    building: any;
    fileName: string;
    factors: any;
  }) => {
    // Create a new project with voice data
    const newProject = {
      projectName: data.building.name || 'مشروع صوتي',
      projectType: data.building.use || 'غير محدد',
      projectDescription: `تم إنشاء هذا المشروع باستخدام التقديم الصوتي الذكي`,
      projectLocation: data.building.address || 'غير محدد',
      projectLat: parseFloat(data.building.lat) || 30.0444,
      projectLng: parseFloat(data.building.lon) || 31.2357,
      projectAddress: data.building.address || 'غير محدد',
      buildingFloors: parseInt(data.building.floors) || 1,
      buildingArea: parseInt(data.building.area) || 0,
      buildingUse: data.building.use || 'غير محدد',
      occupancyDensity: data.building.occupancyDensity || 'متوسطة',
      fireFactors: data.factors,
      files: [{
        name: data.fileName,
        type: 'voice-application',
        size: 0,
        url: '#'
      }],
      status: 'pending' as const,
      submissionDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    try {
      // Save to database
      fireCodeDB.addProject(user?.id || '', newProject);
      
      // Update stats
      const stats = fireCodeDB.getUserProjectStats(user?.id || '');
      setProjectStats(stats);
      
      // Show success message
      alert('تم إنشاء المشروع بنجاح باستخدام التقديم الصوتي!');
      
      // Navigate to projects page to see the new project
      navigate('/applicant/projects');
    } catch (error) {
      console.error('Error saving voice project:', error);
      alert('حدث خطأ أثناء حفظ المشروع. يرجى المحاولة مرة أخرى.');
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            قيد المراجعة
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            <Upload className="w-3 h-3" />
            تم الإرسال
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            تحت المراجعة
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            موافق عليه
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            مرفوض
          </Badge>
        );
      case 'needs_revision':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
            <Edit className="w-3 h-3" />
            يحتاج تعديل
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'under_review':
        return <Eye className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'needs_revision':
        return <Edit className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                مرحباً، {user?.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                لوحة تحكم مقدم الطلبات - نظام الحماية الذكي
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  window.location.href = '/applicant/submit-project';
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                مشروع جديد
              </Button>
              
              {/* أيقونة الإشعارات */}
              <Button 
                variant="ghost" 
                size="sm"
                className="relative h-10 w-10 rounded-full"
                onClick={() => {
                  navigate('/applicant/notifications');
                }}
                title="الإشعارات"
              >
                <Bell className="h-5 w-5" />
                {/* مؤشر الإشعارات الجديدة */}
                <span className="absolute -top-1 -right-1 min-h-4 px-1 bg-red-600 rounded-full text-[10px] leading-4 text-white flex items-center justify-center">
                  {user ? fireCodeDB.getUnreadCountByUser(user.id) : 0}
                </span>
              </Button>
              
              {/* قائمة المستخدم */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleHelp}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>المساعدة</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.total}</div>
              <p className="text-xs text-muted-foreground">
                جميع المشاريع المقدمة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectStats.underReview}
              </div>
              <p className="text-xs text-muted-foreground">
                مشاريع تحت المراجعة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">موافق عليها</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectStats.approved}
              </div>
              <p className="text-xs text-muted-foreground">
                مشاريع تم قبولها
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectStats.rejected}
              </div>
              <p className="text-xs text-muted-foreground">
                مشاريع مرفوضة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تحتاج تعديل</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectStats.needsRevision}
              </div>
              <p className="text-xs text-muted-foreground">
                مشاريع تحتاج تعديل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Voice Application Section */}
        <VoiceApplication 
          user={user}
          onFormFilled={handleVoiceFormFilled}
        />

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>طلباتي</CardTitle>
            <CardDescription>
              جميع الطلبات المقدمة لحماية المباني من أخطار الحريق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent p-0">
                <TabsTrigger 
                  value="all"
                  className="rounded-md py-2 text-sm font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-yellow-400 hover:text-black transition-colors data-[state=active]:bg-red-600 data-[state=active]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                >
                  الكل
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  className="rounded-md py-2 text-sm font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-yellow-400 hover:text-black transition-colors data-[state=active]:bg-red-600 data-[state=active]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                >
                  قيد المراجعة
                </TabsTrigger>
                <TabsTrigger 
                  value="approved"
                  className="rounded-md py-2 text-sm font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-yellow-400 hover:text-black transition-colors data-[state=active]:bg-red-600 data-[state=active]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                >
                  موافق عليها
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected"
                  className="rounded-md py-2 text-sm font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-yellow-400 hover:text-black transition-colors data-[state=active]:bg-red-600 data-[state=active]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                >
                  مرفوضة
                </TabsTrigger>
                <TabsTrigger 
                  value="needs_revision"
                  className="rounded-md py-2 text-sm font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-yellow-400 hover:text-black transition-colors data-[state=active]:bg-red-600 data-[state=active]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                >
                  تحتاج تعديل
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                    <p className="text-muted-foreground mb-6">
                      لم تقم بإرسال أي طلبات بعد. ابدأ بإنشاء مشروع جديد.
                    </p>
                    <Button 
                      onClick={() => {
                        window.location.href = '/applicant/submit-project';
                      }}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إنشاء مشروع جديد
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application.id} className="hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                                application.status === 'approved' ? 'bg-green-100' :
                                application.status === 'needs_revision' ? 'bg-orange-100' :
                                application.status === 'rejected' ? 'bg-red-100' :
                                'bg-blue-100'
                              }`}>
                                {getStatusIcon(application.status)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{application.projectName}</h3>
                                <p className="text-sm text-gray-600">
                                  تم الإرسال: {new Date(application.submittedDate).toLocaleDateString('ar-EG')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <div className="text-right">
                                {getStatusBadge(application.status)}
                                <p className="text-xs text-gray-500 mt-1">
                                  آخر تحديث: {new Date(application.lastUpdate).toLocaleDateString('ar-EG')}
                                </p>
                              </div>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => viewProject(application.id)}
                                  className="hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  عرض
                                </Button>
                                {application.status === 'approved' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadProjectReport(application.id)}
                                    className="hover:bg-green-50 text-green-700 border-green-200"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    تحميل
                                  </Button>
                                )}
                                {application.status === 'needs_revision' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/applicant/submit-project?projectId=${application.id}`)}
                                    className="hover:bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    تعديل
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                {applications.filter(app => app.status === 'pending' || app.status === 'submitted').length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات قيد المراجعة</h3>
                    <p className="text-muted-foreground mb-6">
                      لا توجد طلبات في حالة قيد المراجعة حالياً.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.filter(app => app.status === 'pending' || app.status === 'submitted').map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{application.projectName}</h3>
                            <p className="text-sm text-muted-foreground">
                              تم الإرسال: {new Date(application.submittedDate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="text-right">
                            {getStatusBadge(application.status)}
                            <p className="text-xs text-muted-foreground mt-1">
                              آخر تحديث: {new Date(application.lastUpdate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewProject(application.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              عرض
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                {applications.filter(app => app.status === 'approved').length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات موافق عليها</h3>
                    <p className="text-muted-foreground mb-6">
                      لا توجد طلبات موافق عليها حالياً.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.filter(app => app.status === 'approved').map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{application.projectName}</h3>
                            <p className="text-sm text-muted-foreground">
                              تم الإرسال: {new Date(application.submittedDate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="text-right">
                            {getStatusBadge(application.status)}
                            <p className="text-xs text-muted-foreground mt-1">
                              آخر تحديث: {new Date(application.lastUpdate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewProject(application.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              عرض
                            </Button>
                            {application.status === 'approved' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadProjectReport(application.id)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                تحميل
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="mt-6">
                {applications.filter(app => app.status === 'rejected').length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات مرفوضة</h3>
                    <p className="text-muted-foreground mb-6">
                      لا توجد طلبات مرفوضة حالياً.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.filter(app => app.status === 'rejected').map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{application.projectName}</h3>
                            <p className="text-sm text-muted-foreground">
                              تم الإرسال: {new Date(application.submittedDate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="text-right">
                            {getStatusBadge(application.status)}
                            <p className="text-xs text-muted-foreground mt-1">
                              آخر تحديث: {new Date(application.lastUpdate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewProject(application.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              عرض
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="needs_revision" className="mt-6">
                {applications.filter(app => app.status === 'needs_revision').length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات تحتاج تعديل</h3>
                    <p className="text-muted-foreground mb-6">
                      لا توجد طلبات تحتاج تعديل حالياً.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.filter(app => app.status === 'needs_revision').map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{application.projectName}</h3>
                            <p className="text-sm text-muted-foreground">
                              تم الإرسال: {new Date(application.submittedDate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="text-right">
                            {getStatusBadge(application.status)}
                            <p className="text-xs text-muted-foreground mt-1">
                              آخر تحديث: {new Date(application.lastUpdate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewProject(application.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              عرض
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/applicant/submit-project?projectId=${application.id}`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              تعديل
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Project Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>تفاصيل المشروع</DialogTitle>
              <DialogDescription>عرض بيانات المشروع والمراجعة</DialogDescription>
            </DialogHeader>
            {!selectedProject ? (
              <div className="text-center text-muted-foreground py-6">لا يوجد مشروع محدد</div>
            ) : (
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">اسم المشروع</div>
                    <div className="font-medium">{selectedProject.projectName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">الحالة</div>
                    <div className="font-medium">{selectedProject.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">نوع المبنى</div>
                    <div className="font-medium">{selectedProject.buildingType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">العنوان</div>
                    <div className="font-medium">{selectedProject.projectAddress || selectedProject.location || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">المساحة (م²)</div>
                    <div className="font-medium">{selectedProject.area}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">عدد الطوابق</div>
                    <div className="font-medium">{selectedProject.floors}</div>
                  </div>
                </div>
                {selectedProject.reviewReport && (
                  <div className="border rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-base font-bold text-gray-900">نتائج المراجعة الذكية</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedProject.reviewReport.overallStatus === 'approved' && (
                          <Badge className="bg-green-100 text-green-800" variant="secondary">موافق عليه</Badge>
                        )}
                        {selectedProject.reviewReport.overallStatus === 'needs_revision' && (
                          <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">يحتاج تعديل</Badge>
                        )}
                        {selectedProject.reviewReport.overallStatus === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800" variant="secondary">مرفوض</Badge>
                        )}
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">{selectedProject.reviewReport.complianceScore}% امتثال</Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">حرجة: {selectedProject.reviewReport.criticalIssues || 0}</Badge>
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">كبيرة: {selectedProject.reviewReport.majorIssues || 0}</Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">صغيرة: {selectedProject.reviewReport.minorIssues || 0}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(selectedProject.reviewReport.generatedDate).toLocaleDateString('ar-EG')}</span>
                    </div>

                    {selectedProject.reviewReport.recommendations?.length ? (
                      <div className="mt-3 text-sm text-gray-700">
                        <span className="font-medium">أهم التوصيات:</span>
                        <ul className="list-disc pr-5 mt-1 space-y-1">
                          {selectedProject.reviewReport.recommendations.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDetailsOpen(false)}>إغلاق</Button>
                  {selectedProject && selectedProject.status === 'approved' && (
                    <Button onClick={() => downloadProjectReport(selectedProject.id)} variant="outline">
                      <Download className="w-4 h-4 mr-2" /> تحميل PDF
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* المساعد الذكي */}
      <DashboardChatBot 
        projectStats={projectStats}
        user={user}
      />
    </div>
  );
};
