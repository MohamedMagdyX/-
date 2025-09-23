import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, AlertTriangle, Phone, Clock, Users, Search, Map } from 'lucide-react';

interface FireStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  phone: string;
  responseTime: string;
  personnel: number;
  address: string;
  governorate: string;
  workingHours: string;
  services: string[];
}

const FireStationsMap: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<FireStation | null>(null);

  // محطات الحماية المدنية في مصر
  const fireStations: FireStation[] = [
    {
      id: '1',
      name: 'محطة الحماية المدنية - القاهرة',
      lat: 30.0444,
      lng: 31.2357,
      phone: '180',
      responseTime: '5-8 دقائق',
      personnel: 25,
      address: 'شارع التحرير، القاهرة',
      governorate: 'القاهرة',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف', 'مواد خطرة']
    },
    {
      id: '2',
      name: 'محطة الحماية المدنية - الجيزة',
      lat: 30.0131,
      lng: 31.2089,
      phone: '180',
      responseTime: '6-10 دقائق',
      personnel: 20,
      address: 'شارع الهرم، الجيزة',
      governorate: 'الجيزة',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف']
    },
    {
      id: '3',
      name: 'محطة الحماية المدنية - الإسكندرية',
      lat: 31.2001,
      lng: 29.9187,
      phone: '180',
      responseTime: '7-12 دقائق',
      personnel: 18,
      address: 'كورنيش الإسكندرية',
      governorate: 'الإسكندرية',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف', 'مواد خطرة']
    },
    {
      id: '4',
      name: 'محطة الحماية المدنية - الأقصر',
      lat: 25.6872,
      lng: 32.6396,
      phone: '180',
      responseTime: '10-15 دقائق',
      personnel: 15,
      address: 'شارع الكورنيش، الأقصر',
      governorate: 'الأقصر',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف']
    },
    {
      id: '5',
      name: 'محطة الحماية المدنية - أسوان',
      lat: 24.0889,
      lng: 32.8998,
      phone: '180',
      responseTime: '12-18 دقائق',
      personnel: 12,
      address: 'شارع الكورنيش، أسوان',
      governorate: 'أسوان',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف']
    },
    {
      id: '6',
      name: 'محطة الحماية المدنية - بورسعيد',
      lat: 31.2653,
      lng: 32.3019,
      phone: '180',
      responseTime: '8-12 دقائق',
      personnel: 16,
      address: 'شارع فلسطين، بورسعيد',
      governorate: 'بورسعيد',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف', 'مواد خطرة']
    },
    {
      id: '7',
      name: 'محطة الحماية المدنية - السويس',
      lat: 29.9668,
      lng: 32.5498,
      phone: '180',
      responseTime: '9-14 دقائق',
      personnel: 14,
      address: 'شارع الجلاء، السويس',
      governorate: 'السويس',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف']
    },
    {
      id: '8',
      name: 'محطة الحماية المدنية - الإسماعيلية',
      lat: 30.6043,
      lng: 32.2723,
      phone: '180',
      responseTime: '10-15 دقائق',
      personnel: 13,
      address: 'شارع محمد علي، الإسماعيلية',
      governorate: 'الإسماعيلية',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف']
    },
    {
      id: '9',
      name: 'محطة الحماية المدنية - المنيا',
      lat: 28.1099,
      lng: 30.7503,
      phone: '180',
      responseTime: '12-18 دقائق',
      personnel: 11,
      address: 'شارع الجلاء، المنيا',
      governorate: 'المنيا',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف']
    },
    {
      id: '10',
      name: 'محطة الحماية المدنية - أسيوط',
      lat: 27.1828,
      lng: 31.1828,
      phone: '180',
      responseTime: '15-20 دقائق',
      personnel: 10,
      address: 'شارع الجمهورية، أسيوط',
      governorate: 'أسيوط',
      workingHours: '24/7',
      services: ['إطفاء الحرائق', 'إنقاذ', 'إسعاف']
    }
  ];

  const filteredStations = fireStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.governorate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStationSelect = (station: FireStation) => {
    setSelectedStation(station);
  };

  const handleCallStation = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">محطات الحماية المدنية في مصر</h2>
        <p className="text-lg text-gray-600">دليل شامل لجميع محطات الحماية المدنية في أنحاء الجمهورية</p>
      </div>

      {/* شريط البحث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            البحث في محطات الحماية المدنية
          </CardTitle>
          <CardDescription>
            ابحث عن محطة الحماية المدنية في مدينتك أو منطقتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث بالاسم أو المحافظة أو العنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* قائمة المحطات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStations.map((station) => (
          <Card 
            key={station.id} 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedStation?.id === station.id ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => handleStationSelect(station)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                {station.name}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{station.governorate}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{station.address}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>وقت الاستجابة: {station.responseTime}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{station.personnel} فرد</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>ساعات العمل: {station.workingHours}</span>
                </div>
              </div>

              {/* الخدمات */}
              <div>
                <Label className="text-sm font-medium">الخدمات المتاحة:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {station.services.map((service, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* أزرار العمل */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCallStation(station.phone);
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  اتصل {station.phone}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/maps?q=${station.lat},${station.lng}`, '_blank');
                  }}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            معلومات مهمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">في حالة الطوارئ:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• اتصل برقم الطوارئ: <span className="font-bold text-red-600">180</span></p>
                <p>• اذكر موقعك بدقة</p>
                <p>• اتبع تعليمات المشغل</p>
                <p>• لا تطفئ الهاتف حتى وصول المساعدة</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">نصائح السلامة:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• تأكد من وجود طفايات حريق في منزلك</p>
                <p>• افحص أجهزة الإنذار بانتظام</p>
                <p>• تعلم خطط الإخلاء</p>
                <p>• احتفظ بأرقام الطوارئ في مكان واضح</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            إحصائيات محطات الحماية المدنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{fireStations.length}</div>
              <div className="text-sm text-gray-600">محطة حماية مدنية</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{fireStations.reduce((sum, station) => sum + station.personnel, 0)}</div>
              <div className="text-sm text-gray-600">فرد حماية مدنية</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">24/7</div>
              <div className="text-sm text-gray-600">خدمة على مدار الساعة</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">180</div>
              <div className="text-sm text-gray-600">رقم الطوارئ</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FireStationsMap;
