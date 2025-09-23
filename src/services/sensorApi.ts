import { sensorService, type SensorReading } from './sensorService';

// API endpoints for sensor management
export class SensorAPI {
  private static readonly API_KEY = 'sensor_admin_key_2024'; // This should be from environment in production
  private static readonly BASE_URL = '/api/sensors';

  // Validate API access
  private static validateAccess(): boolean {
    // In a real application, this would validate against backend authentication
    // For now, we'll check if user is admin (this should be enhanced with proper API key validation)
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
  }

  // Get current sensor reading
  static getCurrentReading(): SensorReading | null {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }
    return sensorService.getCurrentReading();
  }

  // Get latest sensor readings
  static getLatestReadings(count: number = 10): SensorReading[] {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }
    return sensorService.getLatest(count);
  }

  // Add manual sensor reading
  static addSensorReading(reading: {
    temperatureC: number;
    smokePercent: number;
    gasPpm: number;
    humidityPercent?: number;
  }): SensorReading {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Validate input data
    if (reading.temperatureC < -50 || reading.temperatureC > 200) {
      throw new Error('Invalid temperature: Must be between -50°C and 200°C');
    }
    if (reading.smokePercent < 0 || reading.smokePercent > 100) {
      throw new Error('Invalid smoke percentage: Must be between 0% and 100%');
    }
    if (reading.gasPpm < 0 || reading.gasPpm > 10000) {
      throw new Error('Invalid gas PPM: Must be between 0 and 10000');
    }
    if (reading.humidityPercent && (reading.humidityPercent < 0 || reading.humidityPercent > 100)) {
      throw new Error('Invalid humidity percentage: Must be between 0% and 100%');
    }

    return sensorService.addReading(reading);
  }

  // Subscribe to sensor updates
  static subscribeToUpdates(callback: (reading: SensorReading) => void): () => void {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }
    return sensorService.subscribe(callback);
  }

  // Get sensor statistics
  static getSensorStats(): {
    totalReadings: number;
    dangerReadings: number;
    warningReadings: number;
    normalReadings: number;
    lastUpdate: Date | null;
  } {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const readings = sensorService.getLatest(100);
    const totalReadings = readings.length;
    const dangerReadings = readings.filter(r => r.status === 'danger').length;
    const warningReadings = readings.filter(r => r.status === 'warning').length;
    const normalReadings = readings.filter(r => r.status === 'normal').length;
    const lastUpdate = readings.length > 0 ? readings[0].timestamp : null;

    return {
      totalReadings,
      dangerReadings,
      warningReadings,
      normalReadings,
      lastUpdate
    };
  }

  // Clear all sensor readings (for testing/reset purposes)
  static clearAllReadings(): void {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // This would clear the history in a real implementation
    // For now, we'll just log it
    console.log('Sensor readings cleared by admin');
  }

  // Generate test readings (for development/testing)
  static generateTestReadings(count: number = 5): SensorReading[] {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const testReadings: SensorReading[] = [];
    
    for (let i = 0; i < count; i++) {
      const reading = this.addSensorReading({
        temperatureC: 20 + Math.random() * 30,
        smokePercent: Math.random() * 10,
        gasPpm: Math.random() * 100,
        humidityPercent: 40 + Math.random() * 20
      });
      testReadings.push(reading);
      
      // Small delay between readings
      if (i < count - 1) {
        setTimeout(() => {}, 100);
      }
    }

    return testReadings;
  }

  // Export sensor data as JSON
  static exportSensorData(format: 'json' | 'csv' = 'json'): string {
    if (!this.validateAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }

    const readings = sensorService.getLatest(1000);
    
    if (format === 'json') {
      return JSON.stringify(readings, null, 2);
    } else {
      // CSV format
      const headers = ['ID', 'Timestamp', 'Temperature (°C)', 'Smoke (%)', 'Gas (ppm)', 'Humidity (%)', 'Status'];
      const csvRows = [headers.join(',')];
      
      readings.forEach(reading => {
        const row = [
          reading.id,
          reading.timestamp.toISOString(),
          reading.temperatureC.toString(),
          reading.smokePercent.toString(),
          reading.gasPpm.toString(),
          (reading.humidityPercent || '').toString(),
          reading.status
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }
  }
}

// Export singleton instance for easy access
export const sensorAPI = SensorAPI;
