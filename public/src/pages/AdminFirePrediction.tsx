import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fireCodeDB, type Project } from '@/data/fireCodeDatabase';
import { AlertTriangle, MapPin, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type ChartPoint = { t: number; risk: number };

const buildBaseline = (n = 24): ChartPoint[] => Array.from({ length: n }, (_, i) => ({ t: i, risk: 5 }));

export const AdminFirePrediction = () => {
  const [data, setData] = useState<ChartPoint[]>(buildBaseline());
  const [modalOpen, setModalOpen] = useState(false);
  const [atRiskProject, setAtRiskProject] = useState<Project | null>(null);

  const projects = useMemo(() => fireCodeDB.getAllProjects(), []);

  useEffect(() => {
    // Ensure there is some seed data so the page is not empty
    if (projects.length === 0) {
      try {
        const seed = {
          applicantId: 'applicant-001',
          projectName: 'مشروع تجريبي - وسط البلد',
          buildingType: 'تجاري',
          location: 'وسط البلد, القاهرة',
          area: 2500,
          floors: 5,
        } as any;
        fireCodeDB.addProject({ ...seed, drawings: [] });
      } catch {}
    }
  }, [projects.length]);

  const simulateRisk = () => {
    // Create a spike at the end
    const base = buildBaseline();
    const idx = base.length - 2;
    base[idx] = { t: idx, risk: 85 };
    base[idx + 1] = { t: idx + 1, risk: 92 };
    setData(base);

    const list = fireCodeDB.getAllProjects();
    const project = list[0] || null;
    setAtRiskProject(project);
    setModalOpen(true);
  };

  const mapSrc = useMemo(() => {
    if (!atRiskProject) return '';
    const lat = atRiskProject.projectLat;
    const lng = atRiskProject.projectLng;
    const q = atRiskProject.projectAddress || atRiskProject.location || atRiskProject.projectName;
    if (lat && lng) {
      return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(q || '')}&z=14&output=embed`;
  }, [atRiskProject]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">التنبؤ بمخاطر الحريق</h1>
            <p className="text-muted-foreground">متابعة مؤشرات الخطر للمشاريع على مدار الوقت</p>
          </div>
          <Button onClick={simulateRisk} className="bg-red-600 hover:bg-red-700">
            <Activity className="w-4 h-4 mr-2" /> محاكاة خطر حريق
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>مؤشر الخطر الزمني</CardTitle>
            <CardDescription>خط الأساس ثابت، وعند اكتشاف خطر يظهر ارتفاع حاد باللون الأحمر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" /> مشروع معرض للخطر
              </DialogTitle>
              <DialogDescription>تم رصد مؤشرات مرتفعة لاحتمالية نشوب حريق</DialogDescription>
            </DialogHeader>

            {!atRiskProject ? (
              <div className="text-center text-muted-foreground py-6">لا توجد بيانات مشروع</div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">اسم المشروع</div>
                    <div className="font-medium">{atRiskProject.projectName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">الموقع</div>
                    <div className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" />{atRiskProject.projectAddress || atRiskProject.location || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">الإحداثيات</div>
                    <div className="font-medium">{atRiskProject.projectLat && atRiskProject.projectLng ? `${atRiskProject.projectLat.toFixed(5)}, ${atRiskProject.projectLng.toFixed(5)}` : '-'}</div>
                  </div>
                </div>

                <div className="aspect-video w-full overflow-hidden rounded-md border">
                  {mapSrc ? (
                    <iframe title="project-map" src={mapSrc} className="w-full h-full border-0" loading="lazy" allowFullScreen />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">لا يمكن تحميل الخريطة</div>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <Button className="bg-red-600 hover:bg-red-700 text-white text-base px-6 py-5">
                    إبلاغ الحماية المدنية
                  </Button>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminFirePrediction;


