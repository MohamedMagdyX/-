import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, FilePlus, HelpCircle, CheckCircle, AlertCircle, Building, Upload, FileText } from "lucide-react";

type ChatMessage = { role: "bot" | "user"; text: string };

interface ApplicantChatBotProps {
  currentStep?: number;
  projectData?: any;
  drawings?: File[];
  onStepNavigation?: (step: number) => void;
  user?: {
    name?: string;
    email?: string;
  };
}

const ApplicantChatBot = ({ 
  currentStep = 1, 
  projectData = {}, 
  drawings = [], 
  onStepNavigation,
  user
}: ApplicantChatBotProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [showPrintButton, setShowPrintButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  
  const initialChat: ChatMessage[] = [
    { role: "bot", text: `مرحباً ${user?.name || 'عزيزي'}! أنا المساعد الذكي لمساعدتك في إرسال مشروعك. كيف يمكنني مساعدتك اليوم؟` },
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

  // Handle current step question
  const handleCurrentStepQuestion = () => {
    const question = "أنا في أي خطوة دلوقتي؟";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      const stepNames = {
        1: "البيانات الأساسية للمشروع",
        2: "أنظمة الحماية من الحريق", 
        3: "الرسومات والمخططات",
        4: "مراجعة البيانات",
        5: "إرسال المشروع"
      };
      
      const response = `أنت حالياً في الخطوة ${currentStep}: ${stepNames[currentStep as keyof typeof stepNames]}\n\n` +
        `📋 ما تم إنجازه:\n` +
        `${currentStep > 1 ? '✅ البيانات الأساسية' : '⏳ البيانات الأساسية'}\n` +
        `${currentStep > 2 ? '✅ أنظمة الحريق' : '⏳ أنظمة الحريق'}\n` +
        `${currentStep > 3 ? '✅ الرسومات' : '⏳ الرسومات'}\n` +
        `${currentStep > 4 ? '✅ المراجعة' : '⏳ المراجعة'}\n\n` +
        `🎯 الخطوات المتبقية: ${5 - currentStep}`;
      
      sendBotWithTyping(response);
    }, 300);
  };

  // Handle required fields question
  const handleRequiredFieldsQuestion = () => {
    const question = "إيه الحقول المطلوبة في الخطوة دي؟";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      let response = "";
      
      switch(currentStep) {
        case 1:
          response = `📝 الحقول المطلوبة في الخطوة الأولى:\n\n` +
            `• اسم المشروع\n` +
            `• نوع المبنى\n` +
            `• نوع الاستخدام\n` +
            `• الموقع\n` +
            `• المساحة (متر مربع)\n` +
            `• عدد الطوابق\n` +
            `• ارتفاع المبنى\n` +
            `• إجمالي السعة\n` +
            `• نوع البناء\n\n` +
            `💡 نصائح: تأكد من إدخال بيانات دقيقة لضمان المراجعة السريعة`;
          break;
        case 2:
          response = `🔥 الحقول المطلوبة في الخطوة الثانية:\n\n` +
            `• نظام كشف الحريق\n` +
            `• نظام إنذار الحريق\n` +
            `• نظام إطفاء الحريق\n` +
            `• نظام صنابير الحريق\n` +
            `• مخارج الطوارئ\n` +
            `• سعة الإخلاء\n` +
            `• الإضاءة الطارئة\n\n` +
            `⚠️ هذه الأنظمة ضرورية للامتثال للكود المصري`;
          break;
        case 3:
          response = `📁 متطلبات الخطوة الثالثة:\n\n` +
            `• رفع الرسومات الهندسية\n` +
            `• أنواع الملفات المدعومة: PDF, DWG, JPG, PNG\n` +
            `• يمكن رفع عدة ملفات\n\n` +
            `💡 نصائح: تأكد من وضوح الرسومات وجودتها`;
          break;
        case 4:
          response = `✅ في الخطوة الرابعة:\n\n` +
            `• مراجعة جميع البيانات المدخلة\n` +
            `• التأكد من صحة المعلومات\n` +
            `• مراجعة الرسومات المرفوعة\n\n` +
            `🔍 يمكنك العودة لأي خطوة لتعديل البيانات`;
          break;
        case 5:
          response = `🚀 الخطوة الأخيرة:\n\n` +
            `• إرسال المشروع للمراجعة\n` +
            `• سيتم المراجعة خلال دقائق\n` +
            `• ستتلقى إشعاراً فورياً\n\n` +
            `✨ جاهز للإرسال!`;
          break;
      }
      
      sendBotWithTyping(response);
    }, 300);
  };

  // Handle project progress question
  const handleProjectProgressQuestion = () => {
    const question = "إزاي أعرف تقدمي في المشروع؟";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      const completedFields = Object.values(projectData).filter(value => value && value.toString().trim() !== '').length;
      const totalFields = Object.keys(projectData).length;
      const progressPercent = Math.round((completedFields / totalFields) * 100);
      
      const response = `📊 تقدمك في المشروع:\n\n` +
        `الخطوة الحالية: ${currentStep} من 5\n` +
        `البيانات المكتملة: ${completedFields}/${totalFields} (${progressPercent}%)\n` +
        `الرسومات المرفوعة: ${drawings.length} ملف\n\n` +
        `🎯 الخطوات المتبقية: ${5 - currentStep}\n\n` +
        `${progressPercent >= 80 ? '🎉 ممتاز! أنت قريب من الانتهاء' : 
          progressPercent >= 60 ? '👍 جيد جداً! استمر في التقدم' :
          progressPercent >= 40 ? '📈 تقدم جيد، استمر' : 
          '💪 ابدأ بملء البيانات الأساسية'}`;
      
      sendBotWithTyping(response);
    }, 300);
  };

  // Handle help with current step
  const handleHelpWithCurrentStep = () => {
    const question = "عايز مساعدة في الخطوة دي";
    setChat((c) => [...c, { role: "user", text: question }]);
    
    setTimeout(() => {
      let response = "";
      
      switch(currentStep) {
        case 1:
          response = `🆘 مساعدة في البيانات الأساسية:\n\n` +
            `📋 نصائح مهمة:\n` +
            `• استخدم أسماء واضحة ومفهومة\n` +
            `• تأكد من صحة المساحات والأرقام\n` +
            `• اختر نوع المبنى بدقة\n\n` +
            `💡 مثال:\n` +
            `اسم المشروع: "مجمع سكني النور"\n` +
            `نوع المبنى: "سكني"\n` +
            `المساحة: "2500" متر مربع`;
          break;
        case 2:
          response = `🔥 مساعدة في أنظمة الحريق:\n\n` +
            `⚠️ أنظمة مطلوبة:\n` +
            `• نظام كشف دخان أو حرارة\n` +
            `• نظام إنذار صوتي\n` +
            `• نظام إطفاء مائي\n` +
            `• صنابير حريق داخلية\n\n` +
            `📏 حساب مخارج الطوارئ:\n` +
            `عدد المخارج = إجمالي السعة ÷ 50\n` +
            `مثال: 100 شخص = 2 مخرج طوارئ`;
          break;
        case 3:
          response = `📁 مساعدة في رفع الرسومات:\n\n` +
            `📋 أنواع الرسومات المطلوبة:\n` +
            `• المخططات المعمارية\n` +
            `• مخططات الحريق\n` +
            `• مخططات الكهرباء\n` +
            `• مخططات السباكة\n\n` +
            `💡 نصائح:\n` +
            `• تأكد من وضوح الرسومات\n` +
            `• حجم الملف لا يتجاوز 10 ميجا\n` +
            `• يمكن رفع عدة ملفات معاً`;
          break;
        case 4:
          response = `✅ مساعدة في المراجعة:\n\n` +
            `🔍 تحقق من:\n` +
            `• صحة جميع البيانات\n` +
            `• اكتمال الحقول المطلوبة\n` +
            `• الرسومات المرفوعة\n\n` +
            `🔄 يمكنك العودة لأي خطوة للتعديل\n` +
            `💾 البيانات محفوظة تلقائياً`;
          break;
        case 5:
          response = `🚀 مساعدة في الإرسال:\n\n` +
            `✨ قبل الإرسال:\n` +
            `• تأكد من اكتمال جميع البيانات\n` +
            `• راجع الرسومات المرفوعة\n` +
            `• تحقق من صحة المعلومات\n\n` +
            `⏱️ بعد الإرسال:\n` +
            `• المراجعة ستستغرق دقائق\n` +
            `• ستتلقى إشعاراً فورياً\n` +
            `• يمكنك متابعة الحالة من لوحة التحكم`;
          break;
      }
      
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
                <HelpCircle className="w-5 h-5 text-primary" />
                المساعد الذكي
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
                onClick={handleCurrentStepQuestion}
              >
                <Building className="w-4 h-4 mr-2" />
                أنا في أي خطوة دلوقتي؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={handleRequiredFieldsQuestion}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                إيه الحقول المطلوبة في الخطوة دي؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={handleProjectProgressQuestion}
              >
                <FileText className="w-4 h-4 mr-2" />
                إزاي أعرف تقدمي في المشروع؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={handleHelpWithCurrentStep}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                عايز مساعدة في الخطوة دي
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "إيه أنواع الملفات اللي أقدر أرفعها؟", 
                  "📁 أنواع الملفات المدعومة:\n\n• PDF - للمستندات والرسومات\n• DWG - للمخططات الهندسية\n• JPG/JPEG - للصور\n• PNG - للصور عالية الجودة\n\n💡 نصائح:\n• حجم الملف لا يتجاوز 10 ميجا\n• تأكد من وضوح الرسومات\n• يمكن رفع عدة ملفات معاً"
                )}
              >
                <Upload className="w-4 h-4 mr-2" />
                إيه أنواع الملفات اللي أقدر أرفعها؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "إزاي أحسب مخارج الطوارئ؟", 
                  "📏 حساب مخارج الطوارئ:\n\n🔢 المعادلة:\nعدد المخارج = إجمالي السعة ÷ 50\n\n📋 مثال:\n• مبنى سعة 100 شخص = 2 مخرج\n• مبنى سعة 200 شخص = 4 مخارج\n• مبنى سعة 75 شخص = 2 مخرج (تقريب لأعلى)\n\n⚠️ ملاحظة: الحد الأدنى مخرج واحد لكل طابق"
                )}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                إزاي أحسب مخارج الطوارئ؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "إيه هي أنظمة الحريق المطلوبة؟", 
                  "🔥 أنظمة الحريق المطلوبة:\n\n✅ أنظمة أساسية:\n• نظام كشف دخان أو حرارة\n• نظام إنذار صوتي وبصري\n• نظام إطفاء مائي\n• صنابير حريق داخلية\n• إضاءة طارئة\n• مخارج طوارئ\n\n📋 أنظمة إضافية:\n• نظام رشاشات تلقائي\n• نظام إدارة دخان\n• غرفة تحكم الحريق\n• مضخات الحريق"
                )}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                إيه هي أنظمة الحريق المطلوبة؟
              </Button>
              <Button 
                variant="outline" 
                className="text-[13px] justify-start" 
                onClick={() => ask(
                  "كمدة المراجعة؟", 
                  "⏱️ مدة المراجعة:\n\n🚀 المراجعة الذكية:\n• تستغرق دقائق فقط\n• مراجعة فورية للرسومات\n• تحليل البيانات تلقائياً\n\n📱 الإشعارات:\n• إشعار فوري عند الانتهاء\n• تقرير مفصل بالنتائج\n• إرشادات للتحسين\n\n✨ المميزات:\n• مراجعة على مدار الساعة\n• نتائج دقيقة ومفصلة\n• توفير الوقت والجهد"
                )}
              >
                <FileText className="w-4 h-4 mr-2" />
                كمدة المراجعة؟
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

export default ApplicantChatBot;
