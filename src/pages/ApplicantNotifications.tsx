import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fireCodeDB } from '@/data/fireCodeDatabase';
import { 
  Bell, 
  ArrowRight,
  LogOut,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  FileText,
  Building2,
  Settings,
  Trash2,
  CheckCheck
} from 'lucide-react';

export const ApplicantNotifications = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  const [filter, setFilter] = useState('all'); // all, unread, read

  // منع الرجوع نهائياً لصفحة تسجيل الدخول أو الصفحة الرئيسية
  useEffect(() => {
    const preventBack = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', preventBack);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const reload = () => {
    if (!user) return;
    const list = fireCodeDB.getNotificationsByUser(user.id);
    setNotifications(list);
  };

  useEffect(() => { reload(); }, [user]);

  const handleMarkAsRead = (notificationId: string) => {
    if (!user) return;
    fireCodeDB.markAsRead(user.id, notificationId);
    reload();
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    fireCodeDB.markAllAsRead(user.id);
    reload();
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (!user) return;
    fireCodeDB.deleteNotification(user.id, notificationId);
    reload();
  };

  const handleDeleteAllRead = () => {
    if (!user) return;
    fireCodeDB.deleteAllRead(user.id);
    reload();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const filteredNotifications = notifications.filter((notif: any) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((notif: any) => !notif.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Bell className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للوحة التحكم</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2 space-x-reverse text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Settings className="w-5 h-5" />
                <span>إدارة الإشعارات</span>
              </CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  تعيين الكل كمقروء
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAllRead}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف المقروءة
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                الكل ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                غير مقروء ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                مقروء ({notifications.length - unreadCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 space-x-reverse flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <Badge className={getNotificationBadgeColor(notification.type)}>
                            {notification.type === 'success' && 'نجاح'}
                            {notification.type === 'warning' && 'تحذير'}
                            {notification.type === 'error' && 'خطأ'}
                            {notification.type === 'info' && 'معلومات'}
                          </Badge>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {notification.body}
                        </p>
                        <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notification.createdAt)}</span>
                          </div>
                          {notification.projectId && (
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Building2 className="w-3 h-3" />
                              <span>مشروع</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'unread' && 'لا توجد إشعارات غير مقروءة'}
                  {filter === 'read' && 'لا توجد إشعارات مقروءة'}
                  {filter === 'all' && 'لا توجد إشعارات'}
                </h3>
                <p className="text-gray-600">
                  {filter === 'unread' && 'جميع إشعاراتك مقروءة'}
                  {filter === 'read' && 'لم تقرأ أي إشعارات بعد'}
                  {filter === 'all' && 'ستظهر إشعاراتك هنا عند توفرها'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
