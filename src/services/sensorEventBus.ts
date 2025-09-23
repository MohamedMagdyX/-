import { type SensorReading } from './sensorService';

type SensorEventCallback = (reading: SensorReading) => void;

class SensorEventBus {
  private subscribers: SensorEventCallback[] = [];

  subscribe(callback: SensorEventCallback): () => void {
    this.subscribers.push(callback);
    console.log('🔧 إضافة مشترك جديد في EventBus، العدد:', this.subscribers.length);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
        console.log('🔧 إزالة مشترك من EventBus، العدد:', this.subscribers.length);
      }
    };
  }

  publish(reading: SensorReading): void {
    console.log('🔧 نشر قراءة جديدة في EventBus:', reading);
    console.log('🔧 عدد المشتركين:', this.subscribers.length);
    
    this.subscribers.forEach((callback, index) => {
      try {
        console.log(`🔧 إرسال للمشترك ${index + 1}`);
        callback(reading);
      } catch (error) {
        console.error(`🔧 خطأ في المشترك ${index + 1}:`, error);
      }
    });
  }
}

// Export singleton instance
export const sensorEventBus = new SensorEventBus();
