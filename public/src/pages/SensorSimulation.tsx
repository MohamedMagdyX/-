import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sensorService, type SensorReading } from '@/services/sensorService';

export default function SensorSimulation() {
  const { user } = useAuth();
  const [temperatureC, setTemperatureC] = useState<string>('');
  const [smokePercent, setSmokePercent] = useState<string>('');
  const [gasPpm, setGasPpm] = useState<string>('');
  const [humidityPercent, setHumidityPercent] = useState<string>('');
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [subStatus, setSubStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load initial data
    setHistory(sensorService.getLatest(10));

    // Subscribe to updates
    const unsub = sensorService.subscribe(() => {
      setHistory(sensorService.getLatest(10));
    });
    return () => unsub();
  }, []);

  const sendReading = async () => {
    setSubStatus('sending');
    setError('');
    
    try {
      const temp = parseFloat(temperatureC || '0');
      const smoke = parseFloat(smokePercent || '0');
      const gas = parseFloat(gasPpm || '0');
      const humidity = humidityPercent ? parseFloat(humidityPercent) : undefined;
      
      // Determine status based on values
      let status: 'normal' | 'warning' | 'danger' = 'normal';
      if (temp > 60 || smoke > 30 || gas > 200) {
        status = 'danger';
      } else if (temp > 45 || smoke > 15 || gas > 100) {
        status = 'warning';
      }

      const reading = {
        id: `manual-${Date.now()}`,
        temperatureC: temp,
        smokePercent: smoke,
        gasPpm: gas,
        humidityPercent: humidity,
        status,
        timestamp: new Date().toISOString()
      };

      console.log('🔧 إرسال قراءة جديدة:', reading);
      
      // إرسال عبر localStorage كبديل بسيط
      const sensorEvent = {
        type: 'NEW_SENSOR_READING',
        data: reading,
        timestamp: Date.now()
      };
      
      localStorage.setItem('sensorEvent', JSON.stringify(sensorEvent));
      
      // إرسال إشعار مخصص
      window.dispatchEvent(new CustomEvent('sensorReading', { detail: reading }));
      
      // إضافة للخدمة أيضاً
      sensorService.addReading({
        temperatureC: temp,
        smokePercent: smoke,
        gasPpm: gas,
        humidityPercent: humidity,
      });
      
      console.log('🔧 تم إرسال القراءة عبر localStorage و CustomEvent');
      setSubStatus('done');
      setTimeout(() => setSubStatus('idle'), 800);
      setTemperatureC(''); setSmokePercent(''); setGasPpm(''); setHumidityPercent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setSubStatus('idle');
    }
  };

  const statusBadge = (s: 'normal' | 'warning' | 'danger') => {
    const config = {
      normal: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ عادي' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⚠️ تحذير' },
      danger: { bg: 'bg-red-100', text: 'text-red-700', label: '🚨 خطر مرتفع' }
    };
    const { bg, text, label } = config[s];
    return (
      <span className={`px-2 py-1 rounded text-xs ${bg} ${text}`}>
        {label}
      </span>
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
                محاكاة الحساسات
              </h1>
              <p className="text-muted-foreground mt-1">
                مرحباً، {user?.name} - إدخال قراءات الحساسات يدوياً
              </p>
              <p className="text-sm text-green-600 mt-1">
                ✅ المصدر الوحيد للقراءات في النظام
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>إدخال قراءات الحساسات</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              المصدر الوحيد للقراءات في النظام - لا توجد قراءات تلقائية
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>درجة الحرارة (°C)</Label>
                <Input 
                  value={temperatureC} 
                  onChange={(e) => setTemperatureC(e.target.value)} 
                  placeholder="خطر مرتفع: &gt;60°C" 
                  type="number" 
                />
                <p className="text-xs text-muted-foreground">عادي: &lt;45°C | تحذير: 45-60°C | خطر: &gt;60°C</p>
              </div>
              <div className="space-y-1">
                <Label>نسبة الدخان (%)</Label>
                <Input 
                  value={smokePercent} 
                  onChange={(e) => setSmokePercent(e.target.value)} 
                  placeholder="خطر مرتفع: &gt;30%" 
                  type="number" 
                />
                <p className="text-xs text-muted-foreground">عادي: &lt;15% | تحذير: 15-30% | خطر: &gt;30%</p>
              </div>
              <div className="space-y-1">
                <Label>نسبة الغاز (ppm)</Label>
                <Input 
                  value={gasPpm} 
                  onChange={(e) => setGasPpm(e.target.value)} 
                  placeholder="خطر مرتفع: &gt;200 ppm" 
                  type="number" 
                />
                <p className="text-xs text-muted-foreground">عادي: &lt;100 ppm | تحذير: 100-200 ppm | خطر: &gt;200 ppm</p>
              </div>
              <div className="space-y-1">
                <Label>نسبة الرطوبة (%)</Label>
                <Input 
                  value={humidityPercent} 
                  onChange={(e) => setHumidityPercent(e.target.value)} 
                  placeholder="اختياري" 
                  type="number" 
                />
              </div>
            </div>

            <div className="mt-4">
              <Button 
                onClick={sendReading} 
                disabled={subStatus === 'sending'} 
                className="px-6 bg-gradient-primary text-white hover:opacity-90 shadow-primary"
              >
                {subStatus === 'sending' ? 'جاري الإرسال...' : 'إرسال القراءة'}
              </Button>
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-3">آخر 10 قراءات (من محاكاة الحساسات فقط)</h3>
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-right text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">الوقت</th>
                      <th className="px-3 py-2">الحرارة</th>
                      <th className="px-3 py-2">الدخان</th>
                      <th className="px-3 py-2">الغاز</th>
                      <th className="px-3 py-2">الرطوبة</th>
                      <th className="px-3 py-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(r => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2">{new Date(r.timestamp).toLocaleString('ar-EG')}</td>
                        <td className="px-3 py-2">{r.temperatureC} °C</td>
                        <td className="px-3 py-2">{r.smokePercent} %</td>
                        <td className="px-3 py-2">{r.gasPpm} ppm</td>
                        <td className="px-3 py-2">{r.humidityPercent || '-'} %</td>
                        <td className="px-3 py-2">{statusBadge(r.status)}</td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                          لا توجد قراءات بعد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
