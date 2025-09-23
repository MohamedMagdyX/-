import { useEffect, useMemo, useRef, useState } from "react";
import { sensorService } from "@/services/sensorService";
import { sensorEventBus } from "@/services/sensorEventBus";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fireCodeDB } from "@/data/fireCodeDatabase";
import { 
  Activity,
  Bell,
  LogOut,
  ArrowLeft
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  DotProps,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type ProjectEvent = {
  id: string;
  projectName: string;
  owner: string;
  buildingType: string;
  riskLevel: "High" | "Medium" | "Low";
  compliancePercent: number;
  lat: number;
  lng: number;
  timestamp: string;
  severity: number; // value for spike height
  sensorReadings?: {
    temperatureC: number;
    smokePercent: number;
    gasPpm: number;
    humidityPercent?: number;
  };
};

type ChartPoint = {
  time: string;
  value: number;
  event?: ProjectEvent;
  sensorData?: {
    temperatureC: number;
    smokePercent: number;
    gasPpm: number;
    humidityPercent?: number;
  };
};

// Fix Leaflet default icons when bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type AlertHistory = {
  id: string;
  timestamp: string;
  projectName: string;
  riskLevel: "High" | "Medium" | "Low";
  sensorReadings: {
    temperatureC: number;
    smokePercent: number;
    gasPpm: number;
    humidityPercent?: number;
  };
  status: "sent" | "failed";
};

export default function MonitoringPage() {
  const { user, logout } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<ProjectEvent | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  
  // Notifications state
  const [notifications, setNotifications] = useState(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  const [data, setData] = useState<ChartPoint[]>(() => {
    // Initialize with 60 baseline points (last minute)
    const now = new Date();
    return Array.from({ length: 60 }).map((_, i) => {
      const t = new Date(now.getTime() - (59 - i) * 1000);
      return { time: t.toLocaleTimeString('ar-EG', { hour12: false }), value: 0 };
    });
  });
  const incomingEventRef = useRef<ProjectEvent | null>(null);
  const lastSeverityRef = useRef<number>(0);
  const lastSensorDataRef = useRef<{ temperatureC: number; smokePercent: number; gasPpm: number; humidityPercent?: number } | null>(null);
  const spikeDecayRef = useRef<number>(0);

  // Load alert history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('alert_history');
      if (stored) {
        setAlertHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load alert history:', e);
    }
  }, []);

  // Update notifications when user changes
  useEffect(() => {
    setNotifications(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  }, [user]);

  // Notification functions
  const markAllRead = () => {
    fireCodeDB.markAllAsRead(user?.id || 'admin-001');
    setNotifications(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  };
  
  const deleteNtf = (id: string) => {
    fireCodeDB.deleteNotification(user?.id || 'admin-001', id);
    setNotifications(fireCodeDB.getNotificationsByUser(user?.id || 'admin-001'));
  };

  // Live ticker (1 Hz): plot latest severity with decay; attach event only when danger
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const label = now.toLocaleTimeString('ar-EG', { hour12: false });
      const incoming = incomingEventRef.current;
     
      // Apply decay to spike (reduce by 10% each second)
      if (spikeDecayRef.current > 0) {
        spikeDecayRef.current = Math.max(0, spikeDecayRef.current * 0.9);
      }
     
      const currentSeverity = Math.max(0, Math.min(100, lastSeverityRef.current || 0));
      const value = Math.max(spikeDecayRef.current, currentSeverity);
     
      const point: ChartPoint = {
        time: label,
        value,
        event: incoming,
        sensorData: lastSensorDataRef.current || undefined
      };
     
      setData(prev => {
        const next = [...prev, point];
        // keep last 120 seconds
        return next.slice(Math.max(0, next.length - 120));
      });
     
      if (incoming) {
        // فتح البوب أب والإبلاغ فقط عند الحالة خطر
        if (incoming.riskLevel === 'High') {
          setSelectedEvent(incoming);
          autoNotifyCivilDefense(incoming);
        }
        incomingEventRef.current = null;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to sensor events via multiple methods
  useEffect(() => {
    console.log('🔧 بدء الاشتراك في خدمة الحساسات مباشرة');
    
    // Method 1: Direct service subscription
    const unsubscribe = sensorService.subscribe((r) => {
      console.log('🔧 تم استلام قراءة جديدة مباشرة:', r);
      handleSensorReading(r);
    });
    
    // Method 2: Custom event listener
    const handleCustomEvent = (event: CustomEvent) => {
      console.log('🔧 تم استلام قراءة جديدة عبر CustomEvent:', event.detail);
      handleSensorReading(event.detail);
    };
    
    window.addEventListener('sensorReading', handleCustomEvent as EventListener);
    
    // Method 3: localStorage polling (backup)
    const pollInterval = setInterval(() => {
      try {
        const eventData = localStorage.getItem('sensorEvent');
        if (eventData) {
          const event = JSON.parse(eventData);
          if (event.type === 'NEW_SENSOR_READING') {
            console.log('🔧 تم استلام قراءة جديدة عبر localStorage:', event.data);
            handleSensorReading(event.data);
            localStorage.removeItem('sensorEvent'); // Remove after processing
          }
        }
      } catch (e) {
        console.error('Error reading sensor event from localStorage:', e);
      }
    }, 1000);
    
    return () => {
      unsubscribe();
      window.removeEventListener('sensorReading', handleCustomEvent as EventListener);
      clearInterval(pollInterval);
    };
  }, []);
  
  // Handle sensor reading
  const handleSensorReading = (r: any) => {
    console.log('🔧 معالجة قراءة الحساسات:', r);
    // حساب قيمة المؤشر حسب الحالة
    let maxValue = 0;
    
    if (r.status === 'danger') {
      // خطر مرتفع - ارتفاع عالي (70-100%)
      const tempRisk = Math.min((r.temperatureC - 20) / 40 * 100, 100);
      const smokeRisk = Math.min(r.smokePercent * 2, 100);
      const gasRisk = Math.min(r.gasPpm / 2, 100);
      maxValue = Math.max(tempRisk, smokeRisk, gasRisk);
      maxValue = Math.max(maxValue, 70); // الحد الأدنى للخطر المرتفع
    } else if (r.status === 'warning') {
      // تحذير - ارتفاع متوسط (30-70%)
      const tempRisk = Math.min((r.temperatureC - 20) / 40 * 100, 100);
      const smokeRisk = Math.min(r.smokePercent * 2, 100);
      const gasRisk = Math.min(r.gasPpm / 2, 100);
      maxValue = Math.max(tempRisk, smokeRisk, gasRisk);
      maxValue = Math.min(Math.max(maxValue, 30), 70); // بين 30-70%
    } else {
      // عادي - ارتفاع بسيط (5-30%)
      const tempRisk = Math.min((r.temperatureC - 20) / 40 * 100, 100);
      const smokeRisk = Math.min(r.smokePercent * 2, 100);
      const gasRisk = Math.min(r.gasPpm / 2, 100);
      maxValue = Math.max(tempRisk, smokeRisk, gasRisk);
      maxValue = Math.min(Math.max(maxValue, 5), 30); // بين 5-30%
    }
   
    lastSeverityRef.current = isFinite(maxValue) ? maxValue : 0;
   
    // Store sensor data for display
    lastSensorDataRef.current = {
      temperatureC: r.temperatureC,
      smokePercent: r.smokePercent,
      gasPpm: r.gasPpm,
      humidityPercent: r.humidityPercent
    };
   
    // Create spike effect with real value
    spikeDecayRef.current = maxValue;
   
    // إنشاء حدث مع بيانات المشروع حسب الحالة
    incomingEventRef.current = {
      id: `sensor-${r.id}`,
      projectName: `مشروع محاكاة الحساسات - ${r.status === 'danger' ? 'خطر مرتفع' : r.status === 'warning' ? 'تحذير' : 'حالة عادية'}`,
      owner: 'نظام محاكاة الحساسات',
      buildingType: 'مبنى تجريبي للاختبار',
      riskLevel: r.status === 'danger' ? 'High' : r.status === 'warning' ? 'Medium' : 'Low',
      compliancePercent: r.status === 'danger' ? 20 : r.status === 'warning' ? 60 : 95,
      lat: 30.0444, // القاهرة
      lng: 31.2357,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour12: false }),
      severity: maxValue,
      sensorReadings: {
        temperatureC: r.temperatureC,
        smokePercent: r.smokePercent,
        gasPpm: r.gasPpm,
        humidityPercent: r.humidityPercent
      }
    };
  };

  // Auto-notify civil defense when danger detected
  const autoNotifyCivilDefense = async (evt: ProjectEvent) => {
    try {
      // TODO: replace with real endpoint
      await new Promise((res) => setTimeout(res, 500));
      console.log("Auto-alert sent:", evt);
     
      // Add to alert history
      const newAlert: AlertHistory = {
        id: `alert-${Date.now()}`,
        timestamp: new Date().toISOString(),
        projectName: evt.projectName,
        riskLevel: evt.riskLevel,
        sensorReadings: evt.sensorReadings || {
          temperatureC: 0,
          smokePercent: 0,
          gasPpm: 0,
        },
        status: "sent"
      };
     
      const updatedHistory = [newAlert, ...alertHistory].slice(0, 20); // Keep last 20 alerts
      setAlertHistory(updatedHistory);
      localStorage.setItem('alert_history', JSON.stringify(updatedHistory));
     
      // Show notification
      alert(`🚨 تحذير: خطر مرتفع تم اكتشافه!\n\nتم الإبلاغ التلقائي للحماية المدنية\n\n📍 الموقع: ${evt.projectName}\n🏢 نوع المبنى: ${evt.buildingType}\n⚠️ مستوى الخطر: ${evt.riskLevel}\n📊 نسبة الامتثال: ${evt.compliancePercent}%\n🕐 الوقت: ${new Date().toLocaleTimeString('ar-EG')}\n\n📈 تفاصيل القراءات:\n🌡️ الحرارة: ${evt.sensorReadings?.temperatureC}°C\n💨 الدخان: ${evt.sensorReadings?.smokePercent}%\n⛽ الغاز: ${evt.sensorReadings?.gasPpm} ppm\n💧 الرطوبة: ${evt.sensorReadings?.humidityPercent}%`);
    } catch (e) {
      console.error("Auto-alert failed:", e);
      // Add failed alert to history
      const failedAlert: AlertHistory = {
        id: `alert-failed-${Date.now()}`,
        timestamp: new Date().toISOString(),
        projectName: evt.projectName,
        riskLevel: evt.riskLevel,
        sensorReadings: evt.sensorReadings || {
          temperatureC: 0,
          smokePercent: 0,
          gasPpm: 0,
        },
        status: "failed"
      };
     
      const updatedHistory = [failedAlert, ...alertHistory].slice(0, 20);
      setAlertHistory(updatedHistory);
      localStorage.setItem('alert_history', JSON.stringify(updatedHistory));
    }
  };

  // Manual notify civil defense (for button click)
  const notifyCivilDefense = async (evt: ProjectEvent) => {
    setIsSending(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      console.log("Manual alert sent:", evt);
      alert("تم إرسال البلاغ إلى الحماية المدنية بنجاح.");
    } catch (e) {
      alert("حدث خطأ أثناء إرسال البلاغ. حاول مرة أخرى.");
    } finally {
      setIsSending(false);
    }
  };

  const chartConfig = {
    risk: {
      label: "Risk",
      color: "hsl(var(--destructive))",
    },
  } as const;

  const renderSpikeDot = (props: DotProps & { payload?: any }) => {
    const { cx, cy, payload } = props as any;
    const hasEvent = !!payload?.event;
    const hasSensorData = !!payload?.sensorData && payload.value > 0;
    const isClickable = hasEvent || hasSensorData;
   
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isClickable ? 5 : 3}
        fill={hasEvent ? "hsl(var(--destructive))" : hasSensorData ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        stroke="white"
        strokeWidth={1}
        style={{ cursor: isClickable ? "pointer" : "default" }}
        onClick={() => {
          if (hasEvent) {
            setSelectedEvent(payload.event as ProjectEvent);
          } else if (hasSensorData) {
            // Show sensor data in alert
            const data = payload.sensorData;
            alert(`قراءة الحساسات:\n\nالحرارة: ${data.temperatureC}°C\nالدخان: ${data.smokePercent}%\nالغاز: ${data.gasPpm} ppm${data.humidityPercent ? `\nالرطوبة: ${data.humidityPercent}%` : ''}\n\nمستوى الخطر: ${payload.value}%`);
          }
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-subtle border-b shadow-primary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                مراقبة الأخطار
              </h1>
              <p className="text-muted-foreground mt-1">
                مرحباً، {user?.name} - نظام مراقبة الحساسات والإنذارات
              </p>
              <p className="text-sm text-blue-600 mt-1">
                💡 القراءات تأتي من محاكاة الحساسات فقط
              </p>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              {/* Back to Admin Dashboard button */}
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="h-10"
                title="العودة للوحة التحكم"
              >
                <ArrowLeft className="h-5 w-5 ml-2" />
                لوحة التحكم
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>مراقبة الأخطار</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[360px]">
              <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} label={{ value: 'قيمة الحساسات', angle: -90, position: 'insideLeft' }} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-risk)"
                  strokeWidth={2}
                  dot={renderSpikeDot}
                  isAnimationActive={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader>
            <CardTitle>تاريخ الإبلاغات للحماية المدنية</CardTitle>
          </CardHeader>
          <CardContent>
            {alertHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                لا توجد إبلاغات سابقة
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alertHistory.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.status === 'sent'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{alert.projectName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString('ar-EG')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.riskLevel === 'High'
                            ? 'bg-red-100 text-red-800'
                            : alert.riskLevel === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.riskLevel}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {alert.status === 'sent' ? 'تم الإرسال ✅' : 'فشل الإرسال ❌'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">الحرارة:</span>
                        <span className="font-semibold ml-1">{alert.sensorReadings.temperatureC}°C</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الدخان:</span>
                        <span className="font-semibold ml-1">{alert.sensorReadings.smokePercent}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الغاز:</span>
                        <span className="font-semibold ml-1">{alert.sensorReadings.gasPpm} ppm</span>
                      </div>
                      {alert.sensorReadings.humidityPercent && (
                        <div>
                          <span className="text-muted-foreground">الرطوبة:</span>
                          <span className="font-semibold ml-1">{alert.sensorReadings.humidityPercent}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الإنذار</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">اسم المشروع:</span>
                      <div className="font-semibold">{selectedEvent.projectName}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">المالك / الشركة المنفذة:</span>
                      <div className="font-semibold">{selectedEvent.owner}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">نوع المبنى:</span>
                      <div className="font-semibold">{selectedEvent.buildingType}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">مستوى الخطر:</span>
                      <div className="font-semibold">{selectedEvent.riskLevel}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">نسبة الالتزام بالكود المصري:</span>
                      <div className="font-semibold">{selectedEvent.compliancePercent}%</div>
                    </div>
                   
                    {/* عرض قراءات الحساسات */}
                    {selectedEvent.sensorReadings && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">قراءات الحساسات:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-red-700">الحرارة:</span>
                            <span className="font-semibold text-red-800 ml-1">{selectedEvent.sensorReadings.temperatureC}°C</span>
                          </div>
                          <div>
                            <span className="text-red-700">الدخان:</span>
                            <span className="font-semibold text-red-800 ml-1">{selectedEvent.sensorReadings.smokePercent}%</span>
                          </div>
                          <div>
                            <span className="text-red-700">الغاز:</span>
                            <span className="font-semibold text-red-800 ml-1">{selectedEvent.sensorReadings.gasPpm} ppm</span>
                          </div>
                          {selectedEvent.sensorReadings.humidityPercent && (
                            <div>
                              <span className="text-red-700">الرطوبة:</span>
                              <span className="font-semibold text-red-800 ml-1">{selectedEvent.sensorReadings.humidityPercent}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="h-64 w-full rounded-lg overflow-hidden border">
                      <MapContainer center={[selectedEvent.lat, selectedEvent.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                        <Marker position={[selectedEvent.lat, selectedEvent.lng]}>
                          <Popup>
                            <div className="text-sm">
                              {selectedEvent.projectName}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                </div>

                {/* زر الإبلاغ اليدوي تمت إزالته بناءً على الطلب */}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
