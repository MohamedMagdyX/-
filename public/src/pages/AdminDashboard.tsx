import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fireCodeDB, type Project } from '@/data/fireCodeDatabase';
import { mockDB } from '@/data/mockDatabase';
import { 
  Shield, 
  
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Building2,
  Eye,
  Check,
  X,
  Folder,
  LogOut,
  Bell,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, ReferenceLine } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardChatBot from '@/components/DashboardChatBot';

type AdminStatus = 'pending' | 'accepted' | 'rejected';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | AdminStatus>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  // Table-specific filters
  const [tableDateFrom, setTableDateFrom] = useState<string>('');
  const [tableDateTo, setTableDateTo] = useState<string>('');
  const [tableCityQuery, setTableCityQuery] = useState<string>('');
  const [tableApplicantQuery, setTableApplicantQuery] = useState<string>('');
  // Map-specific filters
  const [mapCityQuery, setMapCityQuery] = useState<string>('');
  const [mapStatusFilter, setMapStatusFilter] = useState<'all' | AdminStatus>('all');
  const [mapTypeFilter, setMapTypeFilter] = useState<string>('all');

  // Seed demo projects if empty (once)
  useEffect(() => {
    const all = fireCodeDB.getAllProjects();
    if (all.length === 0) {
      try {
        const seed = [
          {
            applicantId: 'applicant-001',
            projectName: 'مجمع سكني - العاصمة الإدارية',
            buildingType: 'سكني',
            location: 'العاصمة الإدارية الجديدة',
            area: 12000,
            floors: 12,
          },
          {
            applicantId: 'applicant-001',
            projectName: 'مول تجاري - مدينة نصر',
            buildingType: 'تجاري',
            location: 'مدينة نصر',
            area: 8000,
            floors: 6,
          },
          {
            applicantId: 'applicant-001',
      projectName: 'مستشفى خاص - المعادي',
            buildingType: 'صحي',
            location: 'المعادي',
            area: 9000,
            floors: 7,
          },
          {
            applicantId: 'applicant-001',
      projectName: 'مدرسة خاصة - التجمع',
            buildingType: 'تعليمي',
            location: 'التجمع الخامس',
            area: 4000,
            floors: 4,
          },
        ];
        seed.forEach(s => fireCodeDB.addProject({ ...s, drawings: [] } as any));
      } catch {}
    }
    setProjects(fireCodeDB.getAllProjects());
    // تحديث توصيات التقارير القديمة لتظهر التفاصيل الجديدة
    try { fireCodeDB.refreshAllReportsRecommendations(); } catch {}
  }, []);

  const adminStatusOf = (p: Project): AdminStatus => {
    if (p.status === 'approved') return 'accepted';
    if (p.status === 'rejected') return 'rejected';
    return 'pending'; // draft | submitted | under_review | needs_revision
  };

  const stats = useMemo(() => {
    const total = projects.length;
    const accepted = projects.filter(p => adminStatusOf(p) === 'accepted').length;
    const rejected = projects.filter(p => adminStatusOf(p) === 'rejected').length;
    const pending = total - accepted - rejected;
    return { total, accepted, rejected, pending };
  }, [projects]);
  const underReviewCount = useMemo(() => projects.filter(p => p.status === 'under_review').length, [projects]);
  const needsRevisionCount = useMemo(() => projects.filter(p => p.status === 'needs_revision').length, [projects]);

  // Notifications (Admin)
  const [ntfFilter, setNtfFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [notifications, setNotifications] = useState(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  useEffect(() => {
    setNotifications(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  }, [user]);
  const markAllRead = () => {
    fireCodeDB.markAllAsRead(user?.id || 'admin-001');
    setNotifications(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  };
  const deleteNtf = (id: string) => {
    fireCodeDB.deleteNotification(user?.id || 'admin-001', id);
    setNotifications(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = projects;
    if (statusFilter !== 'all') list = list.filter(p => adminStatusOf(p) === statusFilter);
    if (typeFilter !== 'all') list = list.filter(p => (p.buildingType || '') === typeFilter);
    if (tableDateFrom) list = list.filter(p => new Date(p.submissionDate) >= new Date(tableDateFrom));
    if (tableDateTo) list = list.filter(p => new Date(p.submissionDate) <= new Date(tableDateTo + 'T23:59:59'));
    if (tableCityQuery.trim()) {
      const cityQ = tableCityQuery.trim().toLowerCase();
      list = list.filter(p => ((p.projectAddress || p.location || '').toLowerCase().includes(cityQ)));
    }
    if (tableApplicantQuery.trim()) {
      const nameQ = tableApplicantQuery.trim().toLowerCase();
      list = list.filter(p => {
        const user = mockDB.findUserById(p.applicantId);
        const nm = (user?.name || '').toLowerCase();
        return nm.includes(nameQ);
      });
    }
    if (!q) return list;
    return list.filter(p =>
      (p.projectName || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q)
    );
  }, [projects, search, statusFilter, typeFilter, tableDateFrom, tableDateTo, tableCityQuery, tableApplicantQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetails = (id: string) => { setSelectedId(id); setDetailsOpen(true); };
  const selected = selectedId ? projects.find(p => p.id === selectedId) : undefined;

  // قرارات القبول/الرفض غير متاحة للأدمن حسب الطلب
  const exportCSV = () => {
    const rows = filtered.map(p => ({
      id: p.id,
      projectName: p.projectName,
      buildingType: p.buildingType,
      location: p.projectAddress || p.location || '',
      status: adminStatusOf(p),
      submissionDate: new Date(p.submissionDate).toISOString(),
    }));
    const header = Object.keys(rows[0] || { id: '', projectName: '', buildingType: '', location: '', status: '', submissionDate: '' });
    const csv = [header.join(','), ...rows.map(r => header.map(h => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Analytics data
  const statusData = useMemo(() => ([
    { name: 'مقبول', value: stats.accepted, color: '#16a34a' },
    { name: 'مرفوض', value: stats.rejected, color: '#dc2626' },
    { name: 'قيد الانتظار', value: stats.pending, color: '#f59e0b' },
  ]), [stats]);

  const typesData = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach(p => {
      const t = p.buildingType || 'غير محدد';
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; submissions: number; approvals: number }> = {};
    projects.forEach(p => {
      const m = new Date(p.submissionDate).toLocaleDateString('ar-EG', { month: 'short' });
      if (!map[m]) map[m] = { month: m, submissions: 0, approvals: 0 };
      map[m].submissions++;
      if (p.status === 'approved') map[m].approvals++;
    });
    return Object.values(map);
  }, [projects]);

  // تمت إزالة التقارير والتنبؤ بالحريق من لوحة الأدمن بناءً على الطلب

  // Old helper badges removed (no longer needed with new table statuses)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-subtle border-b shadow-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                لوحة تحكم الأدمن
              </h1>
              <p className="text-muted-foreground mt-1">
                مرحباً، {user?.name} - إدارة طلبات الحماية من الحريق
              </p>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              {/* Monitoring button */}
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/monitoring'}
                className="h-10 bg-gradient-primary text-white hover:opacity-90"
                title="مراقبة الأخطار"
              >
                <Activity className="h-5 w-5 ml-2" />
                مراقبة الأخطار
              </Button>
              
              {/* Notifications icon */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="relative h-10 w-10 rounded-full"
                    title="الإشعارات"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute -top-1 -right-1 min-h-4 px-1 bg-red-600 rounded-full text-[10px] leading-4 text-white flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-2 py-2">
                    <div className="flex items-center justify-between">
                      <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                      <Button variant="outline" size="sm" onClick={markAllRead}>تحديد كمقروء</Button>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="max-h-72 overflow-auto">
                    {notifications.slice(0, 8).map(n => (
                      <div key={n.id} className={`px-3 py-2 border-b last:border-b-0 ${!n.read ? 'bg-muted/40' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium">{n.title}</div>
                            <div className="text-xs text-muted-foreground">{n.body}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString('ar-EG')}</div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600" onClick={() => deleteNtf(n.id)}>حذف</Button>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="px-3 py-6 text-center text-muted-foreground text-sm">لا توجد إشعارات</div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-2 text-center">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('admin-notifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>مشاهدة الكل</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              
              <Button 
                variant="ghost" 
                onClick={() => { logout(); window.location.href = '/'; }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                تسجيل خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Card className="bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <Folder className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                جميع المشاريع المقدمة
              </p>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Card className="bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مقبولة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted}</div>
              <p className="text-xs text-muted-foreground">
                مشاريع تم اعتمادها
              </p>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Card className="bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">
                مشاريع تم رفضها
              </p>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Card className="bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                مشاريع لم تُحسم بعد
              </p>
            </CardContent>
          </Card>
          </motion.div>
        </div>

        {/* Projects Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات المشاريع</CardTitle>
            <CardDescription>
              مراجعة وإدارة جميع مشاريع المتقدمين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <Input
                  placeholder="ابحث بالاسم أو الموقع..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="max-w-sm"
                />
                <Input type="date" value={tableDateFrom} onChange={e => { setTableDateFrom(e.target.value); setPage(1); }} className="w-40" />
                <Input type="date" value={tableDateTo} onChange={e => { setTableDateTo(e.target.value); setPage(1); }} className="w-40" />
                <Input
                  placeholder="المدينة/المنطقة"
                  value={tableCityQuery}
                  onChange={e => { setTableCityQuery(e.target.value); setPage(1); }}
                  className="w-40"
                />
                <Input
                  placeholder="اسم مقدم الطلب"
                  value={tableApplicantQuery}
                  onChange={e => { setTableApplicantQuery(e.target.value); setPage(1); }}
                  className="w-48"
                />
                <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="accepted">مقبول</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(v: any) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="نوع المبنى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    {Array.from(new Set(projects.map(p => p.buildingType || 'غير محدد'))).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={exportCSV}>تصدير CSV</Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold">اسم المشروع</th>
                      <th className="px-4 py-3 text-sm font-semibold">الموقع</th>
                      <th className="px-4 py-3 text-sm font-semibold">تاريخ التقديم</th>
                      <th className="px-4 py-3 text-sm font-semibold">الحالة</th>
                      <th className="px-4 py-3 text-sm font-semibold">عرض</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(p => (
                      <tr key={p.id} className="border-t hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 justify-end">
                            <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-full">
                              <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                              <div className="font-medium">{p.projectName}</div>
                              <div className="text-xs text-muted-foreground">{p.buildingType}</div>
                        </div>
                      </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.projectAddress || p.location || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(p.submissionDate).toLocaleDateString('ar-EG')}</td>
                        <td className="px-4 py-3">
                          {adminStatusOf(p) === 'accepted' && (
                            <Badge className="bg-green-100 text-green-700" variant="secondary">مقبول</Badge>
                          )}
                          {adminStatusOf(p) === 'rejected' && (
                            <Badge className="bg-red-100 text-red-700" variant="secondary">مرفوض</Badge>
                          )}
                          {adminStatusOf(p) === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">قيد الانتظار</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => openDetails(p.id)}>
                              <Eye className="w-4 h-4 mr-2" /> عرض
                          </Button>
                        </div>
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">لا توجد بيانات مطابقة</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                      </div>
                    </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
              </div>
                </div>
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المشروع</DialogTitle>
              <DialogDescription>عرض المعلومات الكاملة للمشروع</DialogDescription>
            </DialogHeader>
            {!selected ? (
              <div className="text-center text-muted-foreground py-6">لا يوجد مشروع محدد</div>
            ) : (
              <div className="space-y-5">
                {/* معلومات أساسية */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">اسم المشروع</div>
                    <div className="font-medium">{selected.projectName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">نوع المبنى</div>
                    <div className="font-medium">{selected.buildingType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">الحالة</div>
                    <div className="font-medium">{adminStatusOf(selected)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">تاريخ التقديم</div>
                    <div className="font-medium">{new Date(selected.submissionDate).toLocaleDateString('ar-EG')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">مقدم الطلب</div>
                    <div className="font-medium">{mockDB.findUserById(selected.applicantId)?.name || '-'}</div>
                        </div>
                        <div>
                    <div className="text-sm text-muted-foreground">العنوان</div>
                    <div className="font-medium">{selected.projectAddress || selected.location || '-'}</div>
                  </div>
                </div>

                {/* الأرقام الأساسية */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">المساحة (م²)</div>
                    <div className="text-lg font-semibold">{selected.area ?? '-'}</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">عدد الطوابق</div>
                    <div className="text-lg font-semibold">{selected.floors ?? '-'}</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">ارتفاع المبنى (م)</div>
                    <div className="text-lg font-semibold">{selected.buildingHeight ?? '-'}</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">إجمالي السعة</div>
                    <div className="text-lg font-semibold">{selected.totalOccupancy ?? '-'}</div>
                        </div>
                      </div>

                {/* أنظمة الحريق */}
                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-3">أنظمة الحماية من الحريق</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">كشف الحريق:</span><span className="font-medium">{selected.fireDetectionSystem || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">إنذار الحريق:</span><span className="font-medium">{selected.fireAlarmSystem || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">إطفاء الحريق:</span><span className="font-medium">{selected.fireSuppressionSystem || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">شبكة صنابير الحريق:</span><span className="font-medium">{selected.fireHydrantSystem || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">الرشاشات:</span><span className="font-medium">{selected.sprinklerSystem || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">الإضاءة الطارئة:</span><span className="font-medium">{selected.emergencyLighting || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">مخارج الطوارئ:</span><span className="font-medium">{selected.emergencyExits || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">غرفة طلمبات الحريق:</span><span className="font-medium">{selected.firePumpRoom || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">غرفة التحكم بالحريق:</span><span className="font-medium">{selected.fireControlRoom || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">إدارة الدخان:</span><span className="font-medium">{selected.smokeManagement || '-'}</span></div>
                  </div>
                        </div>

                {/* الترخيص */}
                {selected.license ? (
                  <div className="border rounded-lg p-4 bg-green-50/50">
                    <div className="font-semibold mb-3">بيانات الترخيص</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">رقم الترخيص:</span><span className="font-medium">{selected.license.licenseNumber}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">تاريخ الإصدار:</span><span className="font-medium">{new Date(selected.license.issueDate).toLocaleDateString('ar-EG')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">تاريخ الانتهاء:</span><span className="font-medium">{new Date(selected.license.expiryDate).toLocaleDateString('ar-EG')}</span></div>
                        </div>
                      </div>
                ) : null}

                {/* تقرير المراجعة - مختصر */}
                {selected.reviewReport ? (
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="font-semibold">نتيجة المراجعة</div>
                      <div className="flex items-center gap-2">
                        {selected.reviewReport.overallStatus === 'approved' && (
                          <Badge className="bg-green-100 text-green-700" variant="secondary">موافق عليه</Badge>
                        )}
                        {selected.reviewReport.overallStatus === 'needs_revision' && (
                          <Badge className="bg-yellow-100 text-yellow-700" variant="secondary">يحتاج تعديل</Badge>
                        )}
                        {selected.reviewReport.overallStatus === 'rejected' && (
                          <Badge className="bg-red-100 text-red-700" variant="secondary">مرفوض</Badge>
                        )}
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">{selected.reviewReport.complianceScore}% امتثال</Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap text-sm">
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">حرجة: {selected.reviewReport.criticalIssues || 0}</Badge>
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">كبيرة: {selected.reviewReport.majorIssues || 0}</Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">صغيرة: {selected.reviewReport.minorIssues || 0}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(selected.reviewReport.generatedDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                    {selected.reviewReport.recommendations?.length ? (
                      <div className="mt-3 text-sm">
                        <div className="text-muted-foreground mb-1">أهم التوصيات:</div>
                        <ul className="list-disc pr-5 space-y-1">
                          {selected.reviewReport.recommendations.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* الرسومات */}
                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-3">الرسومات</div>
                  <div className="text-sm text-muted-foreground">عدد الملفات: {selected.drawings?.length || 0}</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* KPI Cards */}
          <Card>
            <CardHeader>
              <CardTitle>معدل القبول</CardTitle>
              <CardDescription>نسبة الموافقات إلى إجمالي المشاريع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0}%</div>
              <p className="text-xs text-muted-foreground">{stats.accepted} من {stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>إجمالي هذا الشهر</CardTitle>
              <CardDescription>عدد الطلبات المقدمة خلال الشهر الحالي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projects.filter(p => new Date(p.submissionDate).getMonth() === new Date().getMonth()).length}</div>
              <p className="text-xs text-muted-foreground">مشاريع جديدة</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>قيد المراجعة</CardTitle>
              <CardDescription>عدد المشاريع التي لم تُحسم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">بانتظار القرار</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Status Distribution Pie */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>توزيع الحالات</CardTitle>
              <CardDescription>نسبة المقبول والمرفوض وقيد الانتظار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="grad-accepted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e"/>
                        <stop offset="100%" stopColor="#16a34a"/>
                      </linearGradient>
                      <linearGradient id="grad-rejected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444"/>
                        <stop offset="100%" stopColor="#dc2626"/>
                      </linearGradient>
                      <linearGradient id="grad-pending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b"/>
                        <stop offset="100%" stopColor="#d97706"/>
                      </linearGradient>
                    </defs>
                    <ReTooltip />
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="#fff" strokeWidth={2}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index===0?"url(#grad-accepted)":index===1?"url(#grad-rejected)":"url(#grad-pending)"} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Building Types Bar */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>أنواع المشاريع</CardTitle>
              <CardDescription>توزيع المشاريع حسب نوع المبنى</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad-bar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa"/>
                        <stop offset="100%" stopColor="#2563eb"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Bar dataKey="value" name="عدد المشاريع" fill="url(#grad-bar)" radius={[6,6,0,0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Submissions vs Approvals Line */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>المشاريع الشهرية</CardTitle>
              <CardDescription>الإرسال مقابل الموافقات لكل شهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <ReferenceLine y={0} stroke="#e5e7eb" />
                    <Line type="monotone" dataKey="submissions" name="الإرسال" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeLinecap="round" />
                    <Line type="monotone" dataKey="approvals" name="الموافقات" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeLinecap="round" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heat Map by City/Region */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>خريطة حرارية حسب المدينة/المنطقة</CardTitle>
            <CardDescription>كثافة المشاريع على مستوى الجمهورية</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Map Filters */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-3">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="ابحث باسم المدينة/المنطقة"
                  value={mapCityQuery}
                  onChange={e => setMapCityQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Select value={mapStatusFilter} onValueChange={(v: any) => setMapStatusFilter(v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="حالة المشروع" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="accepted">مقبول</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={mapTypeFilter} onValueChange={(v: any) => setMapTypeFilter(v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="نوع المبنى" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    {Array.from(new Set(projects.map(p => p.buildingType || 'غير محدد'))).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => { setMapCityQuery(''); setMapStatusFilter('all'); setMapTypeFilter('all'); }}>إعادة ضبط</Button>
              </div>
            </div>
            <div className="h-96 w-full overflow-hidden rounded-md">
              <MapContainer center={[26.8206, 30.8025]} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {
                  (() => {
                    const groups: Record<string, { count: number; latSum: number; lngSum: number; withCoords: number } > = {};
                    const filteredForMap = projects.filter(p => {
                      const statusOk = mapStatusFilter === 'all' ? true : adminStatusOf(p) === mapStatusFilter;
                      const typeOk = mapTypeFilter === 'all' ? true : (p.buildingType || '') === mapTypeFilter;
                      const cityName = (p.projectAddress || p.location || '').toLowerCase();
                      const queryOk = !mapCityQuery.trim() || cityName.includes(mapCityQuery.trim().toLowerCase());
                      return statusOk && typeOk && queryOk;
                    });
                    filteredForMap.forEach(p => {
                      const city = (p.projectAddress || p.location || 'غير معروف').split(/[،,-]/)[0].trim() || 'غير معروف';
                      if (!groups[city]) groups[city] = { count: 0, latSum: 0, lngSum: 0, withCoords: 0 };
                      groups[city].count++;
                      if (typeof p.projectLat === 'number' && typeof p.projectLng === 'number') {
                        groups[city].latSum += p.projectLat as number;
                        groups[city].lngSum += p.projectLng as number;
                        groups[city].withCoords++;
                      }
                    });
                    const entries = Object.entries(groups)
                      .map(([city, g]) => ({ city, count: g.count, lat: g.withCoords ? g.latSum / g.withCoords : null, lng: g.withCoords ? g.lngSum / g.withCoords : null }))
                      .filter(e => e.lat !== null && e.lng !== null);
                    const max = Math.max(1, ...entries.map(e => e.count));
                    const markers = entries.map((e, idx) => {
                      const intensity = e.count / max; // 0..1
                      const r = Math.max(8, Math.sqrt(e.count) * 6);
                      const toColor = (t: number) => {
                        // gradient from yellow (#f59e0b) to red (#dc2626)
                        const c1 = { r: 245, g: 158, b: 11 };
                        const c2 = { r: 220, g: 38, b: 38 };
                        const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
                        return `rgb(${mix(c1.r, c2.r)}, ${mix(c1.g, c2.g)}, ${mix(c1.b, c2.b)})`;
                      };
                      const color = toColor(intensity);
                      return (
                        <CircleMarker key={idx} center={[e.lat as number, e.lng as number]} radius={r} pathOptions={{ color: color, fillColor: color, fillOpacity: 0.35, weight: 1 }}>
                          <LeafletTooltip direction="top" offset={[0, -4]} opacity={1}
                            className="bg-white/90 rounded-md shadow px-2 py-1 text-xs">
                            <div className="font-semibold">{e.city}</div>
                            <div className="text-muted-foreground">عدد المشاريع: {e.count}</div>
                          </LeafletTooltip>
                        </CircleMarker>
                      );
                    });
                    return markers;
                  })()
                }
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>آخر النشاطات</CardTitle>
            <CardDescription>أحدث مشاريع تم تحديثها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects
                .slice()
                .sort((a, b) => new Date(b.reviewDate || b.submissionDate).getTime() - new Date(a.reviewDate || a.submissionDate).getTime())
                .slice(0, 6)
                .map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: adminStatusOf(p) === 'accepted' ? '#16a34a' : adminStatusOf(p) === 'rejected' ? '#dc2626' : '#f59e0b' }} />
                    <div className="font-medium">{p.projectName}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(p.reviewDate || p.submissionDate).toLocaleDateString('ar-EG')} • {p.buildingType}
                      </div>
                    </div>
                  ))}
              {projects.length === 0 && (
                <div className="text-center text-muted-foreground py-6">لا توجد نشاطات بعد</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Center */}
        <Card className="mt-6" id="admin-notifications">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الإشعارات</CardTitle>
                <CardDescription>تنبيهات النظام والتحديثات</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={ntfFilter} onValueChange={(v: any) => setNtfFilter(v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="نوع الإشعارات" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="info">معلومة</SelectItem>
                    <SelectItem value="success">نجاح</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                    <SelectItem value="error">خطأ</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={markAllRead}>تحديد الكل كمقروء</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications
                .filter(n => ntfFilter === 'all' ? true : n.type === ntfFilter)
                .slice(0, 10)
                .map(n => (
                <div key={n.id} className={`flex items-center justify-between p-3 border rounded-md ${!n.read ? 'bg-muted/40' : ''}`}>
                  <div>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.body}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString('ar-EG')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.read && <Badge variant="secondary" className="bg-blue-100 text-blue-700">جديد</Badge>}
                    <Button variant="outline" size="sm" onClick={() => deleteNtf(n.id)}>حذف</Button>
                  </div>
                </div>
              ))}
              {notifications.filter(n => ntfFilter === 'all' ? true : n.type === ntfFilter).length === 0 && (
                <div className="text-center text-muted-foreground py-6">لا توجد إشعارات</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* تم إزالة التنبؤ بالحريق بالكامل */}

        {/* Assistant Chat inside Admin Dashboard */}
        <DashboardChatBot 
          user={{ name: user?.name, email: user?.email }}
          projectStats={{
            total: stats.total,
            approved: stats.accepted,
            pending: stats.pending,
            underReview: underReviewCount,
            rejected: stats.rejected,
            needsRevision: needsRevisionCount
          }}
          mode="admin"
        />
      </div>
    </div>
  );
};
