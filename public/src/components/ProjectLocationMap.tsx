import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// إصلاح أيقونات Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}


interface ProjectLocationMapProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

// مكون لتتبع النقرات على الخريطة
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: LocationData) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        // الحصول على العنوان من الإحداثيات
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        onLocationSelect({
          lat,
          lng,
          address
        });
      } catch (error) {
        console.error('Error getting address:', error);
        onLocationSelect({
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    },
  });
  return null;
}

const ProjectLocationMap: React.FC<ProjectLocationMapProps> = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // البحث عن موقع
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=eg`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const location: LocationData = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        };
        
        setSelectedLocation(location);
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // تحديد الموقع الحالي
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            const location: LocationData = {
              lat: latitude,
              lng: longitude,
              address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            };
            
            setSelectedLocation(location);
            onLocationSelect(location);
          } catch (error) {
            console.error('Error getting address:', error);
            const location: LocationData = {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            };
            
            setSelectedLocation(location);
            onLocationSelect(location);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* شريط البحث */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="location-search">البحث عن موقع المشروع</Label>
          <Input
            id="location-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن المدينة أو المنطقة..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="px-4"
          >
            {isSearching ? 'جاري البحث...' : 'بحث'}
          </Button>
          <Button 
            onClick={getCurrentLocation}
            variant="outline"
            className="px-4"
          >
            <Navigation className="w-4 h-4 mr-2" />
            موقعي الحالي
          </Button>
        </div>
      </div>

      {/* الخريطة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            موقع المشروع
          </CardTitle>
          <CardDescription>
            اضغط على الخريطة لتحديد موقع مشروعك أو استخدم البحث أعلاه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full rounded-lg overflow-hidden border">
            <MapContainer
              center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [30.0444, 31.2357]}
              zoom={selectedLocation ? 15 : 6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* موقع المشروع المحدد */}
              {selectedLocation && (
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={L.divIcon({
                    className: 'project-marker',
                    html: `<div class="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">📍</div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-blue-600">موقع المشروع</h3>
                      <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              <MapClickHandler onLocationSelect={(location) => {
                setSelectedLocation(location);
                onLocationSelect(location);
              }} />
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الموقع المحدد */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              الموقع المحدد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">العنوان:</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedLocation.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">خط العرض:</Label>
                  <p className="text-sm text-gray-600">{selectedLocation.lat.toFixed(6)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">خط الطول:</Label>
                  <p className="text-sm text-gray-600">{selectedLocation.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default ProjectLocationMap;
