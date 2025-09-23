import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  ArrowRight,
  LogOut,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Users,
  Settings,
  Shield,
  Building2,
  MapPin
} from 'lucide-react';
import FireStationsMap from '@/components/FireStationsMap';

export const ApplicantHelp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // منع الرجوع نهائياً لصفحة تسجيل الدخول أو الصفحة الرئيسية
  React.useEffect(() => {
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // محاكاة إرسال الرسالة
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('تم إرسال رسالتك بنجاح! سنتواصل معك خلال 24 ساعة.');
      setContactForm({ subject: '', message: '', priority: 'medium' });
      
      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
    } catch (error) {
      setSubmitMessage('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      id: 1,
      question: 'كيف يمكنني إرسال مشروع جديد؟',
      answer: 'يمكنك إرسال مشروع جديد من خلال النقر على زر "مشروع جديد" في لوحة التحكم، ثم ملء النموذج بالمعلومات المطلوبة ورفع الملفات المطلوبة.',
      category: 'المشاريع'
    },
    {
      id: 2,
      question: 'ما هي أنواع الملفات المقبولة؟',
      answer: 'نقبل ملفات PDF، DWG، DXF، وملفات الصور (JPG، PNG). يجب أن تكون الملفات واضحة ومقروءة.',
      category: 'الملفات'
    },
    {
      id: 3,
      question: 'كم من الوقت يستغرق مراجعة المشروع؟',
      answer: 'المراجعة تطلب دقائق فقط. فور الإرسال سيتم الرد على الطلب ومراجعة فور الإرسال.',
      category: 'المراجعة'
    },
    {
      id: 4,
      question: 'كيف يمكنني تتبع حالة مشروعي؟',
      answer: 'يمكنك تتبع حالة مشروعك من خلال قسم "طلباتي" في لوحة التحكم، حيث ستجد جميع مشاريعك وحالاتها الحالية.',
      category: 'التتبع'
    },
    {
      id: 5,
      question: 'ماذا أفعل إذا تم رفض مشروعي؟',
      answer: 'إذا تم رفض مشروعك، ستتلقى تقريراً مفصلاً بالأسباب. يمكنك تعديل المشروع وإرساله مرة أخرى بعد حل المشاكل المذكورة.',
      category: 'الرفض'
    },
    {
      id: 6,
      question: 'كيف يمكنني تغيير كلمة المرور؟',
      answer: 'يمكنك تغيير كلمة المرور من خلال الإعدادات في لوحة التحكم، ثم قسم الأمان.',
      category: 'الحساب'
    }
  ];

  const filteredFaq = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <HelpCircle className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">المساعدة والدعم</h1>
                <p className="text-sm text-gray-600">مركز المساعدة والدعم الفني</p>
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
        {/* التبويبات */}
        <div className="flex space-x-1 space-x-reverse mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'faq'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              الأسئلة الشائعة
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fire-stations')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'fire-stations'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              محطات الحماية المدنية
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'contact'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              تواصل معنا
            </div>
          </button>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'faq' && (
          <>
            {/* البحث */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Search className="w-5 h-5" />
                  <span>البحث في الأسئلة الشائعة</span>
                </CardTitle>
                <CardDescription>
                  ابحث عن إجابة لسؤالك في الأسئلة الشائعة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ابحث في الأسئلة الشائعة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* الأسئلة الشائعة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <BookOpen className="w-5 h-5" />
                    <span>الأسئلة الشائعة</span>
                  </CardTitle>
                  <CardDescription>
                    إجابات على الأسئلة الأكثر شيوعاً
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredFaq.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{item.question}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* دليل الاستخدام */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <FileText className="w-5 h-5" />
                    <span>دليل الاستخدام</span>
                  </CardTitle>
                  <CardDescription>
                    خطوات مفصلة لاستخدام النظام
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-blue-600 font-semibold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">إنشاء حساب جديد</h4>
                        <p className="text-xs text-gray-600">سجل بياناتك الشخصية وأنشئ حسابك</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <span className="text-green-600 font-semibold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">إرسال مشروع جديد</h4>
                        <p className="text-xs text-gray-600">املأ النموذج وارفع الملفات المطلوبة</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                        <span className="text-yellow-600 font-semibold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">مراجعة المشروع</h4>
                        <p className="text-xs text-gray-600">سيتم مراجعة مشروعك وفقاً للكود المصري</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                        <span className="text-purple-600 font-semibold text-sm">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">استلام النتيجة</h4>
                        <p className="text-xs text-gray-600">ستتلقى تقريراً مفصلاً بحالة المشروع</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* تبويب محطات الحماية المدنية */}
        {activeTab === 'fire-stations' && (
          <FireStationsMap />
        )}

        {/* تبويب التواصل */}
        {activeTab === 'contact' && (
          <>
            {/* معلومات الاتصال */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-5 h-5" />
                    <span>الهاتف</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">للدعم الفني والاستفسارات</p>
                  <p className="font-medium">+20 2 1234 5678</p>
                  <p className="text-xs text-gray-500 mt-1">الأحد - الخميس: 9:00 ص - 5:00 م</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Mail className="w-5 h-5" />
                    <span>البريد الإلكتروني</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">للاستفسارات والاقتراحات</p>
                  <p className="font-medium">support@safe-egypt.com</p>
                  <p className="text-xs text-gray-500 mt-1">نرد خلال 24 ساعة</p>
                </CardContent>
              </Card>
            </div>

            {/* نموذج التواصل */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <MessageCircle className="w-5 h-5" />
                  <span>تواصل معنا</span>
                </CardTitle>
                <CardDescription>
                  أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    submitMessage.includes('نجاح') 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {submitMessage.includes('نجاح') ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">{submitMessage}</span>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="أدخل موضوع الرسالة"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">الأولوية</Label>
                    <select
                      id="priority"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="اكتب رسالتك هنا..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
