import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // محاكاة إرسال الرسالة
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">تواصل معنا</h1>
              <p className="text-muted-foreground mt-1">
                نحن هنا لمساعدتك في جميع استفساراتك حول نظام الحماية الذكي
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowRight className="w-4 h-4 mr-2" />
                العودة للصفحة الرئيسية
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                أرسل لنا رسالة
              </CardTitle>
              <CardDescription>
                املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <Alert className="mb-6">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت ممكن.
                  </AlertDescription>
                </Alert>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+20 10 1234 5678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="موضوع الرسالة"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">الرسالة</Label>
                  <Textarea
                    id="message"
                    placeholder="اكتب رسالتك هنا..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                    className="text-right min-h-[120px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  <Send className="w-4 h-4 mr-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  معلومات التواصل
                </CardTitle>
                <CardDescription>
                  يمكنك التواصل معنا عبر الطرق التالية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">البريد الإلكتروني</p>
                    <p className="text-sm text-muted-foreground">info@safeegypt.ai</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">الهاتف</p>
                    <p className="text-sm text-muted-foreground">+20 2 1234 5678</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">العنوان</p>
                    <p className="text-sm text-muted-foreground">
                      القاهرة، مصر<br />
                      العاصمة الإدارية الجديدة
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>ساعات العمل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الأحد - الخميس:</span>
                  <span className="font-medium">9:00 ص - 5:00 م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الجمعة:</span>
                  <span className="font-medium">9:00 ص - 1:00 م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">السبت:</span>
                  <span className="font-medium">مغلق</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
