import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Mic, MicOff, Volume2, Brain, Zap, Clock, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface VoiceApplicationProps {
  user: any;
  onFormFilled: (data: {
    building: any;
    fileName: string;
    factors: any;
  }) => void;
}

const VoiceApplication = ({ user, onFormFilled }: VoiceApplicationProps) => {
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [voiceAnswers, setVoiceAnswers] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<'terms' | 'questions'>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Steps mapping to mirror main submission (6 steps)
  const stepTitles = [
    'الموافقة على الشروط',
    'البيانات الأساسية',
    'أنظمة الحريق',
    'الرسومات',
    'المراجعة',
    'الإرسال',
  ];
  // Determine active step from currentQuestion/progress
  const activeStep = (() => {
    if (!termsAccepted) return 1;
    if (complianceResult) return 5; // after processing → review/submit
    if (currentQuestion <= 0) return 1; // basic intro after terms
    if (currentQuestion > 0 && currentQuestion < 6) return 1; // basic data
    if (currentQuestion >= 6 && currentQuestion < 16) return 2; // fire systems
    return 4; // review
  })();

  // Voice application questions مرتبة لتطابق خطوات "إرسال مشروع جديد"
  const voiceSchema = [
    { key: 'projectName', prompt: 'ما اسم المشروع؟' },
    { key: 'buildingType', prompt: 'ما نوع المبنى؟ (سكني، تجاري، صناعي، تعليمي، صحي، إداري، ترفيهي، ديني، رياضي، ثقافي، نقل، مخازن)'} ,
    { key: 'occupancyType', prompt: 'ما نوع الاستخدام التفصيلي؟ (مثال: سكني عائلي، تجاري كبير، صناعي متوسط...)' },
    { key: 'address', prompt: 'ما العنوان الكامل للمشروع؟' },
    { key: 'area', prompt: 'ما هي المساحة الإجمالية بالمتر المربع؟' },
    { key: 'floors', prompt: 'كم عدد الطوابق؟' },
    { key: 'buildingHeight', prompt: 'ما ارتفاع المبنى (بالأمتار)؟' },
    { key: 'basementFloors', prompt: 'كم عدد الطوابق السفلية؟' },
    { key: 'totalOccupancy', prompt: 'ما إجمالي سعة الإشغال (عدد الأشخاص)؟' },
    { key: 'parkingSpaces', prompt: 'كم عدد أماكن الوقوف؟' },
    { key: 'constructionType', prompt: 'ما نوع البناء؟ (خرسانة مسلحة، طوب وخرسانة، حديد...)' },
    { key: 'description', prompt: 'أدخل وصفاً مختصراً للمشروع.' },
    // أنظمة الحريق
    { key: 'fireDetectionSystem', prompt: 'اختر نظام كشف الحريق (مثال: نظام كشف دخان، كشف حرارة، لا يوجد)' },
    { key: 'fireAlarmSystem', prompt: 'اختر نظام إنذار الحريق (مثال: إنذار صوتي، إنذار بصري، لا يوجد)' },
    { key: 'fireSuppressionSystem', prompt: 'اختر نظام إطفاء الحريق (مثال: مائي، رغوي، غازي، مسحوق، لا يوجد)' },
    { key: 'fireHydrantSystem', prompt: 'اختر نظام صنابير/خراطيم الحريق (داخلية، خارجية، مختلطة، لا يوجد)' },
    { key: 'sprinklerSystem', prompt: 'اختر نظام الرشاشات (رشاشات تلقائية، يدوية، مختلطة، لا يوجد)' },
    { key: 'emergencyExits', prompt: 'كم عدد مخارج الطوارئ؟' },
    { key: 'evacuationCapacity', prompt: 'ما سعة الإخلاء (شخص/دقيقة)؟' },
    { key: 'smokeManagement', prompt: 'اختر نظام إدارة الدخان (تهوية طبيعية، ميكانيكية، مختلطة، لا يوجد)' },
    { key: 'emergencyLighting', prompt: 'اختر نظام الإضاءة الطارئة (تلقائية، يدوية، مختلطة، لا يوجد)' },
    { key: 'firePumpRoom', prompt: 'أين غرفة مضخات الحريق؟ (طابق أرضي، سفلي، علوي، خارج المبنى، لا يوجد)' },
    { key: 'fireControlRoom', prompt: 'أين غرفة التحكم في الحريق؟ (طابق أرضي، سفلي، علوي، خارج المبنى، لا يوجد)' },
  ];
  const voiceQuestions = voiceSchema.map(q => q.prompt);

  // Speech synthesis function - محسن
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // إيقاف أي كلام سابق
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.7; // أبطأ قليلاً للوضوح
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // اختيار صوت عربي إذا كان متاحاً
      const voices = speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => 
        voice.lang.startsWith('ar') || voice.name.includes('Arabic')
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  // Start voice recognition - محسن
  const stopAllAudio = () => {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch {}
    try {
      const rec = recognitionRef.current;
      if (rec && typeof rec.stop === 'function') rec.stop();
      if (rec && typeof rec.abort === 'function') rec.abort();
      recognitionRef.current = null;
    } catch {}
    setIsListening(false);
    setIsConfirming(false);
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('المتصفح لا يدعم التعرف على الصوت. يرجى استخدام Chrome أو Edge');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ar-SA';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLastTranscript(transcript);
      setIsListening(false);
      setIsConfirming(true);
      
      // Ask for confirmation with better feedback
      speak(`سمعت: ${transcript}. هل هذا صحيح؟`);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      let errorMessage = 'حدث خطأ في التعرف على الصوت.';
      
      switch(event.error) {
        case 'no-speech':
          errorMessage = 'لم أسمع أي صوت. حاول مرة أخرى.';
          break;
        case 'audio-capture':
          errorMessage = 'لا يمكن الوصول للميكروفون. تحقق من الإعدادات.';
          break;
        case 'not-allowed':
          errorMessage = 'تم رفض إذن الميكروفون. يرجى السماح بالوصول.';
          break;
        case 'network':
          errorMessage = 'مشكلة في الشبكة. تحقق من الاتصال.';
          break;
      }
      
      speak(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  // Confirm voice answer - محسن
  const confirmVoiceAnswer = () => {
    const newAnswers = [...voiceAnswers];
    newAnswers[currentQuestion] = lastTranscript;
    setVoiceAnswers(newAnswers);
    setIsConfirming(false);
    setLastTranscript("");

    if (currentQuestion < voiceQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setTimeout(() => {
        speak(voiceQuestions[nextQuestion]);
      }, 800);
    } else {
      // Fill the form with voice answers
      setIsProcessing(true);
      setTimeout(() => {
        fillFormWithVoiceData();
        performComplianceCheck();
      }, 1500);
    }
  };

  // Fill form with voice data - محسن
  const fillFormWithVoiceData = () => {
    if (voiceAnswers.length >= voiceQuestions.length) {
      const getAns = (key: string) => {
        const idx = voiceSchema.findIndex(x => x.key === key);
        return idx >= 0 ? (voiceAnswers[idx] || '') : '';
      };
      const buildingData = {
        name: getAns('projectName'),
        use: getAns('buildingType'),
        floors: getAns('floors'),
        area: getAns('area'),
        address: getAns('address'),
        occupancyDensity: getAns('totalOccupancy'),
        lat: "30.0444", // Default Cairo coordinates
        lon: "31.2357"
      };
      
      const fileName = `طلب صوتي - ${buildingData.name || 'مشروع جديد'}`;
      
      // Fill fire factors based on voice answers - محسن
      const fireFactors = {
        extinguishers: { enabled: (getAns('fireSuppressionSystem') || '').length > 0 && !getAns('fireSuppressionSystem').includes('لا يوجد'), count: 0 },
        sprinklers: { enabled: (getAns('sprinklerSystem') || '').includes('رشاشات'), count: 0 },
        alarms: { enabled: (getAns('fireAlarmSystem') || '').length > 0 && !getAns('fireAlarmSystem').includes('لا يوجد'), count: 0 },
        hydrants: { enabled: false, count: 0 },
        smokeDetectors: { enabled: (getAns('fireDetectionSystem') || '').length > 0 && !getAns('fireDetectionSystem').includes('لا يوجد'), count: 0 },
        heatDetectors: { enabled: false, count: 0 },
        manualCallPoints: { enabled: false, count: 0 },
        emergencyLighting: { enabled: (getAns('emergencyLighting') || '').length > 0 && !getAns('emergencyLighting').includes('لا يوجد'), count: 0 },
        exitSigns: { enabled: true, count: 0 },
        hoseReels: { enabled: (getAns('fireHydrantSystem') || '').length > 0 && !getAns('fireHydrantSystem').includes('لا يوجد'), count: 0 },
        firePumps: { enabled: false, count: 0 },
        waterTanks: { enabled: false, count: 0 },
        gasSuppression: { enabled: false, count: 0 },
        kitchenSuppression: { enabled: false, count: 0 },
        smokeControlFans: { enabled: (getAns('smokeManagement') || '').length > 0 && !getAns('smokeManagement').includes('لا يوجد'), count: 0 },
        stairPressurization: { enabled: false, count: 0 },
        controlRoom: { enabled: false, count: 0 },
      };

      // بناء معاينة شاملة مماثلة لخطوتي البيانات الأساسية وأنظمة الحريق
      const preview = {
        projectName: getAns('projectName'),
        buildingType: getAns('buildingType'),
        location: getAns('address'),
        area: getAns('area'),
        floors: getAns('floors'),
        buildingHeight: getAns('buildingHeight') || '-',
        basementFloors: getAns('basementFloors') || '-',
        totalOccupancy: getAns('totalOccupancy') || '-',
        constructionType: getAns('constructionType') || '-',
        description: getAns('description') || '-',
        fireDetectionSystem: getAns('fireDetectionSystem') || 'لا يوجد',
        fireAlarmSystem: getAns('fireAlarmSystem') || 'لا يوجد',
        fireSuppressionSystem: getAns('fireSuppressionSystem') || 'لا يوجد',
        fireHydrantSystem: getAns('fireHydrantSystem') || 'لا يوجد',
        sprinklerSystem: getAns('sprinklerSystem') || 'لا يوجد',
        emergencyLighting: getAns('emergencyLighting') || 'لا يوجد',
        smokeManagement: getAns('smokeManagement') || 'لا يوجد',
        emergencyExits: getAns('emergencyExits') || '-',
        evacuationCapacity: getAns('evacuationCapacity') || '-',
      };
      setPreviewData(preview);

      // Call the callback with filled data
      onFormFilled({
        building: buildingData,
        fileName: fileName,
        factors: fireFactors
      });
    }
  };

  // Enhanced compliance function - محسن
  const performComplianceCheck = () => {
    const compliance = computeCompliance();
    setComplianceResult(compliance);
    
    const resultText = compliance.approved 
      ? `تهانينا! تمت الموافقة المبدئية! نسبة التوافق: ${compliance.percent}%`
      : `تم الرفض مبدئياً. نسبة التوافق: ${compliance.percent}%. الأسباب: ${compliance.reasons.join(', ')}`;
    
    speak(`تم ملء النموذج بنجاح. جاري الفحص... ${resultText}`);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  // Enhanced compliance function - محسن
  const computeCompliance = () => {
    let score = 0;
    let totalChecks = 0;
    const reasons: string[] = [];

    // Check basic requirements
    const basicChecks = [
      { name: 'كاشفات دخان', value: voiceAnswers[6]?.toLowerCase().includes('نعم') },
      { name: 'نظام إنذار', value: voiceAnswers[7]?.toLowerCase().includes('نعم') },
      { name: 'طفايات حريق', value: voiceAnswers[8]?.toLowerCase().includes('نعم') },
      { name: 'خراطيم إطفاء', value: voiceAnswers[9]?.toLowerCase().includes('نعم') },
      { name: 'رشاشات مياه', value: voiceAnswers[10]?.toLowerCase().includes('نعم') },
      { name: 'أبواب طوارئ', value: voiceAnswers[11]?.toLowerCase().includes('نعم') },
      { name: 'سلالم هروب', value: voiceAnswers[12]?.toLowerCase().includes('نعم') },
      { name: 'لوحات إرشادية', value: voiceAnswers[13]?.toLowerCase().includes('نعم') },
      { name: 'تهوية دخان', value: voiceAnswers[14]?.toLowerCase().includes('نعم') },
      { name: 'إضاءة طوارئ', value: voiceAnswers[15]?.toLowerCase().includes('نعم') }
    ];

    basicChecks.forEach(check => {
      totalChecks++;
      if (check.value) {
        score++;
      } else {
        reasons.push(`نقص في ${check.name}`);
      }
    });

    const percent = Math.round((score / totalChecks) * 100);
    const approved = percent >= 70; // 70% minimum for approval

    return {
      percent,
      approved,
      reasons: reasons.slice(0, 3), // Show only top 3 reasons
      score,
      totalChecks
    };
  };

  // Start voice application - محسن
  const startVoiceApplication = () => {
    setVoiceDialogOpen(true);
    setCurrentPhase('terms');
    setTermsAccepted(false);
    setCurrentQuestion(0);
    setVoiceAnswers([]);
    setLastTranscript("");
    setIsConfirming(false);
    setIsProcessing(false);
    setComplianceResult(null);
    
    setTimeout(() => {
      speak(`أهلاً وسهلاً ${user?.name || 'عزيزي'}! قبل البدء، يرجى الموافقة على الشروط والأحكام. قل "أوافق" للمتابعة.`);
    }, 500);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setCurrentPhase('questions');
    setTimeout(() => {
      speak(voiceQuestions[0]);
    }, 400);
  };

  // Close handlers: stop any ongoing TTS/recognition when dialog closes or component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Reset application
  const resetApplication = () => {
    setCurrentQuestion(0);
    setVoiceAnswers([]);
    setLastTranscript("");
    setIsConfirming(false);
    setIsProcessing(false);
    setComplianceResult(null);
    
    setTimeout(() => {
      speak(voiceQuestions[0]);
    }, 500);
  };

  return (
    <>
      {/* Voice Application Card - محسن */}
      <Card className="mb-6 overflow-hidden relative bg-white border-2 border-red-100 rounded-xl hover:border-red-200 transition-colors duration-300 shadow-sm hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-transparent to-yellow-50 opacity-70" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-red-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center ring-2 ring-white">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                  التقديم الصوتي الذكي
                </h3>
                <p className="text-sm text-muted-foreground">
                  ملء النموذج بالذكاء الاصطناعي والتعرف على الصوت
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                    <Zap className="w-3 h-3 mr-1" />
                    سريع
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200">
                    <Brain className="w-3 h-3 mr-1" />
                    ذكي
                  </Badge>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/15 to-primary/15 rounded-full animate-ping" />
              <Button 
                onClick={startVoiceApplication}
                size="lg"
                className="relative bg-gradient-to-r from-primary to-red-600 hover:from-yellow-400 hover:to-yellow-500 text-white hover:text-black shadow-lg hover:shadow-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                ابدأ التقديم الصوتي
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Voice Application Dialog - محسن */}
      <Dialog open={voiceDialogOpen} onOpenChange={(v) => { setVoiceDialogOpen(v); if (!v) { stopAllAudio(); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-t-4 border-t-red-500 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Brain className="w-6 h-6 text-primary" />
              التقديم الصوتي الذكي
            </DialogTitle>
            <DialogDescription className="text-base">
              اتبع التعليمات الصوتية لملء النموذج بالكامل باستخدام الذكاء الاصطناعي
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Steps Bar mirroring main submission */}
            <div className="mb-2">
              <div className="flex items-center">
                {[1,2,3,4,5,6].map((step, idx) => (
                  <div className="flex items-center" key={step}>
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ring-1 ${
                        step === activeStep
                          ? 'bg-red-600 text-white ring-red-300'
                          : step < activeStep
                          ? 'bg-red-100 text-red-800 ring-red-200'
                          : 'bg-white text-gray-700 ring-gray-200'
                      }`}>{step}</div>
                      <span className={`mt-1 text-[10px] leading-none ${
                        step <= activeStep ? 'text-red-700' : 'text-gray-600'
                      }`}>{stepTitles[idx]}</span>
                    </div>
                    {step < 6 && (
                      <div className={`flex-1 h-1 mx-1 rounded ${step < activeStep ? 'bg-red-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Linear Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">التقدم</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-lg">{Math.min(currentQuestion + 1, voiceQuestions.length)} من {voiceQuestions.length}</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-red-600 h-3 rounded-full transition-all duration-700 ease-out" style={{ width: `${((Math.min(currentQuestion + 1, voiceQuestions.length)) / voiceQuestions.length) * 100}%` }} />
              </div>
            </div>

            {/* Terms step */}
            {!termsAccepted && (
              <Card className="bg-red-50 border border-red-200 rounded-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="text-right text-sm text-red-900/90 max-h-56 overflow-auto border border-red-100 rounded p-3 bg-white">
                    <p className="font-semibold mb-2">الشروط والأحكام</p>
                    <p className="mb-2">بالضغط على أوافق، تؤكد قراءة الشروط والأحكام والموافقة عليها لإرسال مشروعك للمراجعة وفقاً للكود المصري للحماية من الحريق.</p>
                    <ul className="list-disc pr-5 space-y-1">
                      <li>دقة وصحة البيانات المدخلة مسؤوليتك.</li>
                      <li>مطابقة الرسومات للمشروع الفعلي.</li>
                      <li>الالتزام بمتطلبات الكود المصري رقم 126 لسنة 2021.</li>
                    </ul>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button onClick={handleAcceptTerms} className="bg-red-600 hover:bg-red-700 text-white">
                      أوافق
                    </Button>
                    <Button variant="outline" onClick={() => speak('قل أوافق للموافقة على الشروط والأحكام والمتابعة')}>سماع التعليمات</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Question - محسن */}
            {termsAccepted && (
              <Card className="bg-gradient-to-r from-red-50 to-yellow-50 border border-red-200 rounded-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Mic className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">السؤال الحالي:</span>
                    </div>
                    <div className="font-semibold text-lg leading-relaxed">
                      {voiceQuestions[currentQuestion]}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Answer Display - محسن */}
            {lastTranscript && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">إجابتك:</span>
                  </div>
                  <div className="font-medium text-green-800 text-lg">{lastTranscript}</div>
                </CardContent>
              </Card>
            )}

            {/* Processing State */}
            {isProcessing && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium text-red-700">جاري معالجة البيانات...</span>
                  </div>
                  <p className="text-sm text-red-600">يتم تحليل الإجابات وإجراء فحص التوافق</p>
                </CardContent>
              </Card>
            )}

            {/* Compliance Result */
            }
            {complianceResult && (
              <Card className={`border-2 ${complianceResult.approved ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded-lg`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      complianceResult.approved ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {complianceResult.approved ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${
                      complianceResult.approved ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {complianceResult.approved ? 'تمت الموافقة المبدئية!' : 'تم الرفض مبدئياً'}
                    </h3>
                    <div className={`text-2xl font-bold mb-3 ${
                      complianceResult.approved ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {complianceResult.percent}%
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {complianceResult.score} من {complianceResult.totalChecks} متطلب متوفر
                    </p>
                    {complianceResult.reasons.length > 0 && (
                      <div className="text-sm text-red-600">
                        <p className="font-medium mb-1">الأسباب:</p>
                        <ul className="list-disc list-inside">
                          {complianceResult.reasons.map((reason: string, index: number) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Structured Preview mirroring form steps */}
            {previewData && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-base">مراجعة البيانات (التقديم الصوتي)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-600">اسم المشروع:</span><span className="font-medium">{previewData.projectName || '-'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">نوع المبنى:</span><span className="font-medium">{previewData.buildingType || '-'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">الموقع:</span><span className="font-medium">{previewData.location || '-'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">المساحة:</span><span className="font-medium">{previewData.area || '-'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">عدد الطوابق:</span><span className="font-medium">{previewData.floors || '-'}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-600">ارتفاع المبنى:</span><span className="font-medium">{previewData.buildingHeight}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">السعة الإجمالية:</span><span className="font-medium">{previewData.totalOccupancy}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">نوع البناء:</span><span className="font-medium">{previewData.constructionType}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">الوصف:</span><span className="font-medium">{previewData.description}</span></div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="font-semibold mb-2">أنظمة الحماية من الحريق</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">كشف الحريق:</span><span className="font-medium">{previewData.fireDetectionSystem}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">إنذار الحريق:</span><span className="font-medium">{previewData.fireAlarmSystem}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">إطفاء الحريق:</span><span className="font-medium">{previewData.fireSuppressionSystem}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">صنابير/خراطيم الحريق:</span><span className="font-medium">{previewData.fireHydrantSystem}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">الرشاشات:</span><span className="font-medium">{previewData.sprinklerSystem}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">إدارة الدخان:</span><span className="font-medium">{previewData.smokeManagement}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">الإضاءة الطارئة:</span><span className="font-medium">{previewData.emergencyLighting}</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Control Buttons - محسن */}
            <div className="flex flex-col items-center space-y-4">
              {isConfirming ? (
                <div className="flex gap-3">
                  <Button onClick={confirmVoiceAnswer} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                    <Check className="w-5 h-5 mr-2" />
                    نعم، صحيح
                  </Button>
                  <Button onClick={startVoiceRecognition} variant="outline" size="lg">
                    <Mic className="w-5 h-5 mr-2" />
                    كرر الإجابة
                  </Button>
                </div>
              ) : !isProcessing && !complianceResult ? (
                <Button 
                  onClick={startVoiceRecognition}
                  disabled={isListening || !termsAccepted}
                  className="flex items-center gap-3 bg-gradient-to-r from-primary to-red-600 hover:from-yellow-400 hover:to-yellow-500 text-white hover:text-black shadow-lg hover:shadow-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                  size="lg"
                >
                  {isListening ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الاستماع...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      اضغط للتحدث
                    </>
                  )}
                </Button>
              ) : complianceResult ? (
                <div className="flex gap-3">
                  <Button onClick={() => setVoiceDialogOpen(false)} size="lg" className="bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500">
                    <Check className="w-5 h-5 mr-2" />
                    تم، إغلاق
                  </Button>
                  <Button onClick={resetApplication} variant="outline" size="lg" className="border-red-300 text-red-700 hover:bg-yellow-50 hover:text-black">
                    <Mic className="w-5 h-5 mr-2" />
                    إعادة المحاولة
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Instructions - محسن */}
            <Card className="bg-red-50 border border-red-200">
              <CardContent className="p-4">
                <div className="text-sm">
                  <div className="font-semibold mb-2 flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    تعليمات مهمة:
                  </div>
                  <ul className="space-y-1 text-red-800/80">
                    <li>• تأكد من وجود ميكروفون وإذن التسجيل</li>
                    <li>• تحدث بوضوح وببطء نسبي</li>
                    <li>• للإجابة على أسئلة نعم/لا، قل "نعم" أو "لا" بوضوح</li>
                    <li>• يمكنك إعادة الإجابة في أي وقت</li>
                    <li>• النظام يستخدم الذكاء الاصطناعي لتحليل إجاباتك</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceApplication;
