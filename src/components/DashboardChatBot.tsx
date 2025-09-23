import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, FilePlus, HelpCircle, CheckCircle, AlertCircle, Building, Upload, FileText, BarChart3, Clock, Eye, Download, Edit } from "lucide-react";

type ChatMessage = { role: "bot" | "user"; text: string };

interface DashboardChatBotProps {
  projectStats?: {
    total: number;
    approved: number;
    pending: number;
    underReview: number;
    rejected: number;
    needsRevision: number;
  };
  user?: {
    name?: string;
    email?: string;
  };
  mode?: 'applicant' | 'admin';
}

const DashboardChatBot = ({ 
  projectStats = {
    total: 0,
    approved: 0,
    pending: 0,
    underReview: 0,
    rejected: 0,
    needsRevision: 0
  },
  user,
  mode = 'applicant'
}: DashboardChatBotProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [showPrintButton, setShowPrintButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  
  const initialChat: ChatMessage[] = [
    { role: "bot", text: mode === 'admin'
      ? `مرحباً ${user?.name || 'أدمن'}! أنا مساعد لوحة الإدارة لمساعدتك في متابعة النظام. ماذا تريد أن تفعل الآن؟`
      : `مرحباً ${user?.name || 'عزيزي'}! أنا المساعد الذكي لمساعدتك في إدارة مشاريعك. كيف يمكنني مساعدتك اليوم؟` },
  ];
  const [chat, setChat] = useState<ChatMessage[]>(initialChat);

  // أنيميشن التنبيه كل 3 دقائق
  useEffect(() => {
    // إضافة تنبيه أولي بعد 10 ثوان من تحميل الصفحة
    const initialTimeout = setTimeout(() => {
      if (!chatOpen) {
        setShowNotification(true);
        setLastNotificationTime(Date.now());
        
        // إخفاء التنبيه بعد 5 ثوان
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }, 10000); // 10 ثوان

    // تنبيه ثاني بعد 30 ثانية إضافية (40 ثانية من البداية)
    const secondTimeout = setTimeout(() => {
      if (!chatOpen) {
        setShowNotification(true);
        setLastNotificationTime(Date.now());
        
        // إخفاء التنبيه بعد 5 ثوان
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }, 40000); // 40 ثانية من البداية

    const notificationInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastNotification = now - lastNotificationTime;
      
      // إذا لم يكن الشات مفتوح ولم يمر أقل من 3 دقائق منذ آخر تنبيه
      if (!chatOpen && timeSinceLastNotification > 180000) { // 3 دقائق = 180000 مللي ثانية
        setShowNotification(true);
        setLastNotificationTime(now);
        
        // إخفاء التنبيه بعد 5 ثوان
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }, 60000); // فحص كل دقيقة

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(secondTimeout);
      clearInterval(notificationInterval);
    };
  }, [chatOpen, lastNotificationTime]);

  const sendBot = (text: string) => setChat((c) => [...c, { role: "bot", text }]);
  
  const ask = (text: string, reply: string) => {
    setChat((c) => [...c, { role: "user", text }]);
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        sendBot(reply);
      }, 2000);
    }, 300);
  };

  const sendBotWithTyping = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      sendBot(text);
    }, 2000);
  };

  // Handle project stats question
  const handleProjectStatsQuestion = () => {
    const question = mode === 'admin' ? "عايز أعرف إحصائيات النظام" : "عايز أعرف إحصائيات مشاريعي";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      const rate = projectStats.total > 0 ? Math.round((projectStats.approved / projectStats.total) * 100) : 0;
      const response = mode === 'admin'
        ? `📊 إحصائيات النظام:\n\n` +
          `📁 إجمالي الطلبات: ${projectStats.total}\n` +
          `✅ مقبولة: ${projectStats.approved}\n` +
          `⏳ قيد المراجعة: ${projectStats.underReview}\n` +
          `❌ مرفوضة: ${projectStats.rejected}\n` +
          `✏️ تحتاج تعديل: ${projectStats.needsRevision}\n\n` +
          `📈 معدل القبول: ${rate}%`
        : `📊 إحصائيات مشاريعك:\n\n` +
          `📁 إجمالي المشاريع: ${projectStats.total}\n` +
          `✅ موافق عليها: ${projectStats.approved}\n` +
          `⏳ قيد المراجعة: ${projectStats.underReview}\n` +
          `❌ مرفوضة: ${projectStats.rejected}\n` +
          `✏️ تحتاج تعديل: ${projectStats.needsRevision}\n\n` +
          `📈 معدل القبول: ${rate}%`;
      
      sendBotWithTyping(response);
    }, 300);
  };

  // Applicant: how to create project | Admin: how to filter/search
  const handleCreateProjectQuestion = () => {
    const question = mode === 'admin' ? "إزاي أفلتر وأبحث في الطلبات؟" : "إزاي أقدر أنشئ مشروع جديد؟";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      const response = mode === 'admin'
        ? `🔎 البحث والفلاتر:\n\n` +
          `1️⃣ استخدم مربع البحث للبحث بالاسم أو الموقع\n` +
          `2️⃣ فلتر الحالة: كل الحالات / قيد الانتظار / مقبول / مرفوض\n` +
          `3️⃣ فلتر النوع: اختر نوع المبنى\n` +
          `4️⃣ تصدير CSV من زر "تصدير CSV"\n\n` +
          `💡 تلميح: استخدم الفلاتر أولاً ثم صدّر CSV للحصول على قائمة مفلترة`
        : `🚀 خطوات إنشاء مشروع جديد:\n\n` +
          `1️⃣ اضغط على زر "مشروع جديد" في الأعلى\n` +
          `2️⃣ املأ البيانات الأساسية ثم ارفع الرسومات\n` +
          `3️⃣ راجع البيانات وأرسل للمراجعة`;
      
      sendBotWithTyping(response);
    }, 300);
  };

  // Applicant: status meaning | Admin: KPI meaning
  const handleProjectStatusQuestion = () => {
    const question = mode === 'admin' ? "إيه معنى البطاقات الإحصائية؟" : "إيه معنى حالات المشاريع المختلفة؟";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      const response = mode === 'admin'
        ? `📋 البطاقات الإحصائية:\n\n` +
          `📁 إجمالي المشاريع: عدد كل الطلبات\n` +
          `✅ مقبولة: مشاريع تم اعتمادها\n` +
          `❌ مرفوضة: مشاريع مرفوضة\n` +
          `⏳ قيد الانتظار: لم تُحسم بعد\n\n` +
          `💡 معدل القبول = المقبولة / الإجمالي`
        : `📋 حالات المشاريع:\n\n` +
          `✅ موافق عليها: متوافق ويمكن تحميل التقرير\n` +
          `⏳ قيد المراجعة: تحت المراجعة وستصلك إشعار\n` +
          `❌ مرفوضة: تحتاج تعديلات وفق التقرير\n` +
          `✏️ تحتاج تعديل: تعديلات بسيطة ثم إعادة الإرسال`;
      
      sendBotWithTyping(response);
    }, 300);
  };

  // Applicant: help with rejected | Admin: understanding charts
  const handleRejectedProjectsHelp = () => {
    const question = mode === 'admin' ? "إزاي أقرأ الرسوم التحليلية؟" : "مشروعي اترفض، إزاي أصلحه؟";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      const response = mode === 'admin'
        ? `📈 قراءة الرسوم التحليلية:\n\n` +
          `🟢 دائرة الحالات: توزيع (مقبول/مرفوض/قيد الانتظار)\n` +
          `🔵 أعمدة الأنواع: عدد المشاريع لكل نوع مبنى\n` +
          `🟣 خط شهري: الإرسال مقابل الموافقات لكل شهر\n\n` +
          `💡 استخدمها لتتبع الضغط الشهري ونِسَب الاعتماد`
        : `🔧 إصلاح المشاريع المرفوضة:\n\n` +
          `1️⃣ راجع تقرير الرفض\n2️⃣ عدّل المطلوب\n3️⃣ أعد الإرسال`;
      
      sendBotWithTyping(response);
    }, 300);
  };

  // Reset chat when closed
  const handleChatOpenChange = (open: boolean) => {
    setChatOpen(open);
    if (!open) {
      setChat(initialChat);
      setShowPrintButton(false);
      setShowNotification(false); // إخفاء التنبيه عند إغلاق الشات
    }
  };

  return (
    <Sheet open={chatOpen} onOpenChange={handleChatOpenChange}>
      <SheetTrigger asChild>
        <div className="fixed bottom-6 left-6 z-50">
          {/* تنبيه الشات */}
          {showNotification && (
            <div className="absolute -top-16 left-0 bg-primary text-white px-3 py-2 rounded-lg shadow-lg animate-bounce whitespace-nowrap">
              <div className="text-sm font-medium">💬 هل تحتاج مساعدة؟</div>
              <div className="text-xs opacity-90">اضغط هنا للدردشة معي!</div>
              {/* سهم يشير للزر */}
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
            </div>
          )}
          
          <button 
            aria-label="المساعد الذكي" 
            className={`w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-elegant hover:scale-105 transition-all duration-300 ${
              showNotification ? 'animate-pulse ring-4 ring-primary/30 ring-opacity-50' : ''
            }`}
            onClick={() => {
              setShowNotification(false);
              // اختبار التنبيه عند الضغط المزدوج
              setTimeout(() => {
                if (!chatOpen) {
                  setShowNotification(true);
                  setTimeout(() => setShowNotification(false), 5000);
                }
              }, 100);
            }}
          >
            <MessageSquare className="w-6 h-6 m-auto" />
          </button>
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full sm:max-w-sm">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                المساعد الذكي - لوحة التحكم
              </SheetTitle>
            </SheetHeader>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-auto">
            {chat.map((m, i) => (
              <div 
                key={i} 
                className={`max-w-[85%] ${
                  m.role === "bot" 
                    ? "bg-muted" 
                    : "bg-primary text-primary-foreground ml-auto"
                } px-3 py-2 rounded-lg text-sm whitespace-pre-line`}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div className="max-w-[85%] bg-muted px-3 py-2 rounded-lg text-sm">
                <div className="flex items-center space-x-1">
                  <span>يكتب</span>
                  <div className="flex space-x-1">
                    <div 
                      className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" 
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div 
                      className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" 
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div 
                      className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" 
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t space-y-2">
            <div className="text-[12px] text-muted-foreground">أسئلة سريعة</div>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={handleProjectStatsQuestion}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {mode === 'admin' ? 'عايز أعرف إحصائيات النظام' : 'عايز أعرف إحصائيات مشاريعي'}
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={handleCreateProjectQuestion}
              >
                <Building className="w-4 h-4 mr-2" />
                {mode === 'admin' ? 'إزاي أفلتر وأبحث في الطلبات؟' : 'إزاي أقدر أنشئ مشروع جديد؟'}
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={handleProjectStatusQuestion}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {mode === 'admin' ? 'إيه معنى البطاقات الإحصائية؟' : 'إيه معنى حالات المشاريع المختلفة؟'}
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={handleRejectedProjectsHelp}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {mode === 'admin' ? 'إزاي أقرأ الرسوم التحليلية؟' : 'مشروعي اترفض، إزاي أصلحه؟'}
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "إزاي أتابع حالة مشروعي؟", 
                  "📱 متابعة حالة المشروع:\n\n🔍 طرق المتابعة:\n\n1️⃣ من لوحة التحكم:\n• اضغط على تبويب الحالة المناسبة\n• شوف آخر تحديث للمشروع\n• اضغط \"عرض\" لرؤية التفاصيل\n\n2️⃣ الإشعارات:\n• ستتلقى إشعار فوري عند التحديث\n• اضغط على أيقونة الجرس في الأعلى\n• راجع الإشعارات الجديدة\n\n3️⃣ التقارير:\n• اضغط \"تحميل\" لتحميل التقرير\n• التقرير يحتوي على التفاصيل الكاملة\n• يمكنك طباعة التقرير للاحتفاظ به\n\n⏱️ المراجعة تستغرق دقائق فقط!"
                )}
              >
                <Eye className="w-4 h-4 mr-2" />
                إزاي أتابع حالة مشروعي؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "إزاي أحمل تقرير مشروعي؟", 
                  "📄 تحميل تقارير المشاريع:\n\n💾 خطوات التحميل:\n\n1️⃣ اذهب للمشروع المطلوب\n2️⃣ اضغط على زر \"تحميل\"\n3️⃣ سيتم تحميل التقرير PDF\n\n📋 محتويات التقرير:\n• تفاصيل المشروع الكاملة\n• نتائج المراجعة الذكية\n• نسبة المطابقة للكود المصري\n• التوصيات والملاحظات\n• أسباب الرفض (إن وجدت)\n\n💡 نصائح:\n• احتفظ بنسخة من التقرير\n• استخدمه في التنفيذ\n• راجعه قبل إعادة الإرسال"
                )}
              >
                <Download className="w-4 h-4 mr-2" />
                إزاي أحمل تقرير مشروعي؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "إزاي أعدل مشروع موجود؟", 
                  "✏️ تعديل المشاريع الموجودة:\n\n🔧 خطوات التعديل:\n\n1️⃣ اذهب للمشروع المراد تعديله\n2️⃣ اضغط على زر \"تعديل\"\n3️⃣ قم بالتعديلات المطلوبة\n4️⃣ احفظ التغييرات\n5️⃣ أعد الإرسال للمراجعة\n\n⚠️ ملاحظات مهمة:\n• يمكن تعديل المشاريع المرفوضة\n• يمكن تعديل المشاريع التي تحتاج تعديل\n• لا يمكن تعديل المشاريع الموافق عليها\n• لا يمكن تعديل المشاريع قيد المراجعة\n\n💡 نصائح:\n• احتفظ بنسخة من البيانات الأصلية\n• راجع التعديلات قبل الإرسال\n• استخدم المساعد الذكي للمساعدة"
                )}
              >
                <Edit className="w-4 h-4 mr-2" />
                إزاي أعدل مشروع موجود؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "إيه هي مميزات النظام؟", 
                  "✨ مميزات النظام الذكي:\n\n🚀 المراجعة الذكية:\n• مراجعة فورية خلال دقائق\n• تحليل الرسومات بالذكاء الاصطناعي\n• مطابقة تلقائية مع الكود المصري\n\n📊 التقارير التفصيلية:\n• تقارير شاملة ومفصلة\n• نسبة المطابقة الدقيقة\n• توصيات للتحسين\n\n🔔 الإشعارات الفورية:\n• إشعارات لحظية عند التحديث\n• متابعة حالة المشاريع\n• تنبيهات للمواعيد\n\n💾 إدارة المشاريع:\n• حفظ جميع المشاريع\n• إمكانية التعديل والإعادة\n• سجل كامل للطلبات\n\n🛡️ الأمان والحماية:\n• حماية البيانات الشخصية\n• تشفير آمن للمعلومات\n• نسخ احتياطية تلقائية"
                )}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                إيه هي مميزات النظام؟
              </Button>
            </div>
            {showPrintButton && (
              <div className="pt-3 border-t">
                <Button 
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                  size="sm"
                >
                  <FilePlus className="w-4 h-4" />
                  طباعة آخر طلب
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardChatBot;
