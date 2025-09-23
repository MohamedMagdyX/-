export type SensorReading = {
  id: string;
  temperatureC: number;
  smokePercent: number;
  gasPpm: number;
  humidityPercent?: number;
  status: 'normal' | 'warning' | 'danger';
  timestamp: Date;
};

import { sensorEventBus } from './sensorEventBus';

type SensorSubscription = (reading: SensorReading) => void;

class SensorService {
  private subscriptions: SensorSubscription[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private currentReading: SensorReading | null = null;
  private readingsHistory: SensorReading[] = [];

  constructor() {
    // إيقاف المحاكاة التلقائية - القراءات من محاكاة الحساسات فقط
    // this.startSimulation();
  }

  private startSimulation() {
    // Generate realistic sensor readings every 2-5 seconds
    const generateReading = () => {
      const now = new Date();
      
      // Base values with some randomness
      const baseTemp = 22 + Math.random() * 8; // 22-30°C
      const baseSmoke = Math.random() * 5; // 0-5%
      const baseGas = Math.random() * 50; // 0-50 ppm
      const baseHumidity = 40 + Math.random() * 20; // 40-60%

      // Occasionally generate danger readings (10% chance)
      const isDanger = Math.random() < 0.1;
      
      let temperatureC: number;
      let smokePercent: number;
      let gasPpm: number;
      let status: 'normal' | 'warning' | 'danger';

      if (isDanger) {
        // Danger scenario
        temperatureC = 45 + Math.random() * 20; // 45-65°C
        smokePercent = 15 + Math.random() * 30; // 15-45%
        gasPpm = 200 + Math.random() * 300; // 200-500 ppm
        status = 'danger';
      } else {
        // Normal readings with occasional spikes
        const hasSpike = Math.random() < 0.05; // 5% chance of warning spike
        
        if (hasSpike) {
          temperatureC = baseTemp + Math.random() * 15; // Spike up to +15°C
          smokePercent = baseSmoke + Math.random() * 10; // Spike up to +10%
          gasPpm = baseGas + Math.random() * 100; // Spike up to +100 ppm
          status = 'warning';
        } else {
          temperatureC = baseTemp;
          smokePercent = baseSmoke;
          gasPpm = baseGas;
          status = 'normal';
        }
      }

      const reading: SensorReading = {
        id: `sensor-${Date.now()}`,
        temperatureC: Math.round(temperatureC * 10) / 10,
        smokePercent: Math.round(smokePercent * 10) / 10,
        gasPpm: Math.round(gasPpm),
        humidityPercent: Math.round(baseHumidity),
        status,
        timestamp: now
      };

      this.currentReading = reading;
      this.readingsHistory.unshift(reading); // Add to beginning
      this.readingsHistory = this.readingsHistory.slice(0, 100); // Keep last 100 readings
      this.notifySubscribers(reading);

      // Schedule next reading (2-5 seconds)
      const nextDelay = 2000 + Math.random() * 3000;
      setTimeout(generateReading, nextDelay);
    };

    // Start the simulation
    generateReading();
  }

  private notifySubscribers(reading: SensorReading) {
    this.subscriptions.forEach(callback => {
      try {
        callback(reading);
      } catch (error) {
        console.error('Error in sensor subscription callback:', error);
      }
    });
  }

  subscribe(callback: SensorSubscription): () => void {
    console.log('🔧 إضافة مشترك جديد، العدد الحالي:', this.subscriptions.length);
    this.subscriptions.push(callback);
    
    // If there's a current reading, send it immediately
    if (this.currentReading) {
      console.log('🔧 إرسال القراءة الحالية للمشترك الجديد:', this.currentReading);
      setTimeout(() => callback(this.currentReading!), 0);
    }

    // Return unsubscribe function
    return () => {
      const index = this.subscriptions.indexOf(callback);
      if (index > -1) {
        this.subscriptions.splice(index, 1);
        console.log('🔧 إزالة مشترك، العدد الحالي:', this.subscriptions.length);
      }
    };
  }

  getCurrentReading(): SensorReading | null {
    return this.currentReading;
  }

  getLatest(count: number = 10): SensorReading[] {
    return this.readingsHistory.slice(0, count);
  }

  addReading(reading: Omit<SensorReading, 'id' | 'timestamp' | 'status'>): SensorReading {
    const now = new Date();
    
    // Determine status based on values - منطق محسن
    let status: 'normal' | 'warning' | 'danger' = 'normal';
    
    // الخطر المرتفع - قيم عالية جداً
    if (reading.temperatureC > 60 || reading.smokePercent > 30 || reading.gasPpm > 200) {
      status = 'danger';
    } 
    // تحذير - قيم متوسطة
    else if (reading.temperatureC > 45 || reading.smokePercent > 15 || reading.gasPpm > 100) {
      status = 'warning';
    }

    const newReading: SensorReading = {
      ...reading,
      id: `manual-${Date.now()}`,
      timestamp: now,
      status
    };


    this.currentReading = newReading;
    this.readingsHistory.unshift(newReading);
    this.readingsHistory = this.readingsHistory.slice(0, 100);
    
    console.log('🔧 إضافة قراءة جديدة:', newReading);
    console.log('🔧 عدد المشتركين المحليين:', this.subscriptions.length);
    
    // إرسال عبر EventBus للنشر العالمي
    sensorEventBus.publish(newReading);
    
    // إرسال للمشتركين المحليين أيضاً
    this.notifySubscribers(newReading);
    
    console.log('🔧 تم إرسال القراءة لجميع المشتركين');

    return newReading;
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.subscriptions = [];
  }
}

// Export singleton instance
export const sensorService = new SensorService();
