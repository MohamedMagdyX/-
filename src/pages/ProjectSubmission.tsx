import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fireCodeDB } from '../data/fireCodeDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, FileText, Building, MapPin, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApplicantChatBot from '../components/ApplicantChatBot';
import ProjectLocationMap from '../components/ProjectLocationMap';
import { backgroundAnalysisService } from '../services/backgroundAnalysisService';

const ProjectSubmission: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitVisualState, setSubmitVisualState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [submitTriggered, setSubmitTriggered] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [existingDrawingsCount, setExistingDrawingsCount] = useState<number>(0);
  
  
  const [projectData, setProjectData] = useState({
    projectName: '',
    buildingType: '',
    location: '',
    area: '',
    floors: '',
    description: '',
    // بيانات الموقع الجديدة
    projectLat: '',
    projectLng: '',
    projectAddress: '',
    // بيانات إضافية
    occupancyType: '', // نوع الاستخدام
    buildingHeight: '', // ارتفاع المبنى
    basementFloors: '', // عدد الطوابق السفلية
    parkingSpaces: '', // عدد أماكن الوقوف
    totalOccupancy: '', // إجمالي السعة
    constructionType: '', // نوع البناء
  });

  const [drawings, setDrawings] = useState<File[]>([]);
  const [existingDrawings, setExistingDrawings] = useState<Array<{ fileName: string; fileSize: number }>>([]);
  const [drawingTypes, setDrawingTypes] = useState<string[]>([]);
  // وضع التحرير: التحميل التمهيدي للمشروع إذا تم تمرير projectId في الاستعلام
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('projectId');
    if (!projectId) return;
    const existing = fireCodeDB.getProjectById(projectId);
    if (!existing) return;
    setIsEditMode(true);
    setEditingProjectId(projectId);
    // ملء الحقول من المشروع القائم
    setProjectData(prev => ({
      ...prev,
      projectName: existing.projectName || '',
      buildingType: existing.buildingType || '',
      location: existing.location || '',
      area: String(existing.area ?? ''),
      floors: String(existing.floors ?? ''),
      description: existing.reviewReport?.recommendations?.join('؛ ') || prev.description,
      projectLat: existing.projectLat != null ? String(existing.projectLat) : '',
      projectLng: existing.projectLng != null ? String(existing.projectLng) : '',
      projectAddress: existing.projectAddress || '',
      occupancyType: existing.occupancyType || '',
      buildingHeight: existing.buildingHeight != null ? String(existing.buildingHeight) : '',
      basementFloors: existing.basementFloors != null ? String(existing.basementFloors) : '',
      parkingSpaces: existing.parkingSpaces != null ? String(existing.parkingSpaces) : '',
      totalOccupancy: existing.totalOccupancy != null ? String(existing.totalOccupancy) : '',
      constructionType: existing.constructionType || '',
    }));
    // عرض الرسومات الموجودة بالفعل بالمشروع
    setExistingDrawingsCount((existing.drawings || []).length);
    setExistingDrawings((existing.drawings || []).map(d => ({ fileName: d.fileName, fileSize: d.fileSize })));
    setCurrentStep(5); // نقل المستخدم مباشرة للمراجعة قبل الإرسال
  }, []);

  const [uploadMessage, setUploadMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [missingFields, setMissingFields] = useState<Record<string, boolean>>({});

  const buildingTypes = [
    'سكني',
    'تجاري',
    'صناعي',
    'تعليمي',
    'صحي',
    'إداري',
    'ترفيهي',
    'ديني',
    'رياضي',
    'ثقافي',
    'نقل ومواصلات',
    'مخازن ومستودعات'
  ];

  const occupancyTypes = [
    'سكني عائلي',
    'سكني جماعي',
    'تجاري صغير',
    'تجاري كبير',
    'صناعي خفيف',
    'صناعي متوسط',
    'صناعي ثقيل',
    'تعليمي أساسي',
    'تعليمي ثانوي',
    'تعليمي جامعي',
    'صحي عيادات',
    'صحي مستشفيات',
    'إداري مكاتب',
    'إداري حكومي',
    'ترفيهي مطاعم',
    'ترفيهي ملاهي',
    'ديني مساجد',
    'ديني كنائس',
    'رياضي صالات',
    'رياضي ملاعب',
    'ثقافي متاحف',
    'ثقافي مكتبات',
    'نقل محطات',
    'نقل مواقف',
    'مخازن مواد',
    'مخازن وقود'
  ];

  const constructionTypes = [
    'خرسانة مسلحة',
    'خرسانة مسبقة الصنع',
    'حديد وخرسانة',
    'حديد فقط',
    'طوب وخرسانة',
    'طوب فقط',
    'خشب',
    'مختلط'
  ];


  const drawingTypeOptions = [
    'المخططات المعمارية',
    'المخططات الإنشائية',
    'مخططات الكهرباء',
    'مخططات السباكة',
    'مخططات التكييف',
    'مخططات الحريق',
    'مخططات Revit',
    'مخططات AutoCAD',
    'مخططات ثلاثية الأبعاد',
    'المخططات الطبوغرافية',
    'مخططات الموقع',
    'ملفات BIM',
    'مخططات أخرى'
  ];

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setProjectData(prev => ({
      ...prev,
      projectLat: location.lat.toString(),
      projectLng: location.lng.toString(),
      projectAddress: location.address,
      location: location.address // تحديث حقل الموقع التقليدي أيضاً
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setDrawings(prev => [...prev, ...files]);
      
      // إضافة أنواع الرسومات تلقائياً
      const newTypes = files.map(() => '');
      setDrawingTypes(prev => [...prev, ...newTypes]);
      
      // رسالة تأكيد
      setUploadMessage(`تم رفع ${files.length} ملف بنجاح`);
      setTimeout(() => setUploadMessage(''), 3000);

      // تحليل الرسومات في الخلفية
      files.forEach(file => {
        backgroundAnalysisService.addDrawingForAnalysis(file);
      });
    }
  };

  const handleDropZoneClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const supportedExtensions = [
        'pdf', 'dwg', 'rvt', 'rfa', 'dgn', 'dxf', 'dwt', 'sat', 'step', 'stp', 'iges', 'igs',
        'obj', '3ds', 'fbx', 'skp', 'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'gif'
      ];
      return supportedExtensions.includes(extension || '');
    });
    
    if (validFiles.length > 0) {
      setDrawings(prev => [...prev, ...validFiles]);
      const newTypes = validFiles.map(() => '');
      setDrawingTypes(prev => [...prev, ...newTypes]);
      
      // رسالة تأكيد
      setUploadMessage(`تم رفع ${validFiles.length} ملف بنجاح`);
      setTimeout(() => setUploadMessage(''), 3000);
    } else {
      setUploadMessage('نوع الملف غير مدعوم. يرجى اختيار ملفات رسومات هندسية صحيحة');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const handleDrawingTypeChange = (index: number, type: string) => {
    const newTypes = [...drawingTypes];
    newTypes[index] = type;
    setDrawingTypes(newTypes);
  };

  const removeDrawing = (index: number) => {
    setDrawings(prev => prev.filter((_, i) => i !== index));
    setDrawingTypes(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    // فرض اكتمال جميع خانات "البيانات الأساسية" قبل الانتقال
    if (currentStep === 2) {
      const requiredMap: Record<string, string> = {
        projectName: projectData.projectName,
        buildingType: projectData.buildingType,
        occupancyType: projectData.occupancyType,
        location: projectData.location,
        area: projectData.area,
        floors: projectData.floors,
        buildingHeight: projectData.buildingHeight,
        basementFloors: projectData.basementFloors,
        totalOccupancy: projectData.totalOccupancy,
        parkingSpaces: projectData.parkingSpaces,
        constructionType: projectData.constructionType,
        description: projectData.description,
      };
      const missing: Record<string, boolean> = {};
      Object.entries(requiredMap).forEach(([key, value]) => {
        if (!String(value ?? '').trim()) missing[key] = true;
      });
      const missingMap = !String(projectData.projectLat ?? '').trim() || !String(projectData.projectLng ?? '').trim();
      if (missingMap) missing.map = true;
      const hasAnyMissing = Object.keys(missing).length > 0;
      if (hasAnyMissing) {
        setMissingFields(missing);
        setError('يرجى ملء الحقول المطلوبة في البيانات الأساسية قبل المتابعة');
        return;
      } else {
        setMissingFields({});
      }
    }


    // التحقق من خطوة الرسومات قبل المتابعة
    if (currentStep === 3) {
      const totalDrawings = (existingDrawingsCount || 0) + drawings.length;
      if (totalDrawings === 0) {
        setError('يرجى رفع الرسومات المطلوبة قبل المتابعة');
        return;
      }
    }

    if (currentStep < 5) {
      setError('');
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // لا نسمح بالإرسال إلا عند الضغط على زر "إرسال المشروع" في الخطوة 5
    if (currentStep !== 5 || !submitTriggered) {
      return;
    }
    setSubmitTriggered(false);
    setIsLoading(true);

    try {
      // التحقق من جميع البيانات الأساسية
      if (!projectData.projectName || !projectData.buildingType || !projectData.occupancyType || 
          !projectData.location || !projectData.area || !projectData.floors || 
          !projectData.buildingHeight || !projectData.basementFloors || 
          !projectData.totalOccupancy || !projectData.parkingSpaces || 
          !projectData.constructionType || !projectData.description) {
        setError('يرجى ملء جميع البيانات الأساسية المطلوبة');
        return;
      }

      const totalDrawings = (existingDrawingsCount || 0) + drawings.length;
      if (totalDrawings === 0) {
        setError('الرسومات مطلوبة لإتمام المراجعة. يرجى رفع الرسومات الهندسية للمشروع');
        return;
      }

      // إظهار حالة التحميل في صندوق خطوة الإرسال
      setSubmitVisualState('loading');

      // وضع إنشاء/تعديل المشروع
      const params = new URLSearchParams(window.location.search);
      const editProjectId = params.get('projectId');
      let project = editProjectId ? fireCodeDB.getProjectById(editProjectId) : undefined;
      if (!project) {
        project = fireCodeDB.addProject({
          applicantId: user?.id || '',
          projectName: projectData.projectName,
          buildingType: projectData.buildingType,
          location: projectData.location,
          area: parseFloat(projectData.area),
          floors: parseInt(projectData.floors),
          drawings: [],
          // بيانات الموقع الجديدة
          projectLat: parseFloat(projectData.projectLat || '0'),
          projectLng: parseFloat(projectData.projectLng || '0'),
          projectAddress: projectData.projectAddress,
          // البيانات الإضافية
          occupancyType: projectData.occupancyType,
          buildingHeight: parseFloat(projectData.buildingHeight),
          basementFloors: parseInt(projectData.basementFloors || '0'),
          parkingSpaces: parseInt(projectData.parkingSpaces || '0'),
          totalOccupancy: parseInt(projectData.totalOccupancy),
          constructionType: projectData.constructionType,
        });
      } else {
        fireCodeDB.updateProject(project.id, {
          projectName: projectData.projectName,
          buildingType: projectData.buildingType,
          location: projectData.location,
          area: parseFloat(projectData.area),
          floors: parseInt(projectData.floors),
          projectLat: parseFloat(projectData.projectLat || '0'),
          projectLng: parseFloat(projectData.projectLng || '0'),
          projectAddress: projectData.projectAddress,
          occupancyType: projectData.occupancyType,
          buildingHeight: parseFloat(projectData.buildingHeight),
          basementFloors: parseInt(projectData.basementFloors || '0'),
          parkingSpaces: parseInt(projectData.parkingSpaces || '0'),
          totalOccupancy: parseInt(projectData.totalOccupancy),
          constructionType: projectData.constructionType,
        });
      }

      // إضافة الرسومات الجديدة فقط (إن وُجدت)
      if (drawings.length > 0) {
        drawings.forEach((drawing) => {
          fireCodeDB.addDrawing(project.id, {
            projectId: project.id,
            fileName: drawing.name,
            fileType: drawing.type,
            fileSize: drawing.size
          });
        });
      }

      // المراجعة ستعتمد على الرسومات فقط
      // سيتم تحديد الحالة بناءً على تحليل الرسومات في الخدمة المخصصة

      // إعادة التقديم للمراجعة فقط: تقييم شامل وتحديث التقرير والحالة
      await fireCodeDB.evaluateProjectCompliance(project.id);
      // إشعار فوري بالحالة الحالية لضمان الظهور للمستخدم
      try {
        const updated = fireCodeDB.getProjectById(project.id);
        if (updated && user) {
          fireCodeDB.addNotification({
            userId: user.id,
            type: updated.status === 'approved' ? 'success' : updated.status === 'rejected' ? 'error' : 'warning',
            title: 'تحديث حالة الطلب',
            body: `الحالة الحالية: ${updated.status}${updated.reviewReport ? ` – درجة الامتثال: ${updated.reviewReport.complianceScore}%` : ''}`,
            projectId: updated.id
          });
        }
      } catch {}

      // بعد الإضافة: إظهار نجاح داخل نفس الخطوة
      setTimeout(() => {
        setSubmitVisualState('success');
        setIsLoading(false);
      }, 2000);
      setTimeout(() => {
        navigate('/dashboard');
      }, 4000);

    } catch (error) {
      setError('حدث خطأ أثناء إرسال المشروع');
    } finally {
      setIsLoading(false);
    }
  };

  // لا شاشة نجاح منفصلة؛ العرض داخل الخطوة 6

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">إرسال مشروع جديد</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            أرسل مشروعك للمراجعة الذكية وفقاً للكود المصري للحريق رقم 126 لسنة 2021. سيتم تحليل الرسومات الهندسية لتقييم امتثال المشروع للمعايير المطلوبة
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>الكود المصري</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>تحليل الرسومات</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>نتائج فورية</span>
            </div>
          </div>
        </div>

        {/* شريط التقدم */}
        <Card className="mb-6 shadow-lg border border-red-100 bg-white/90 backdrop-blur-sm rounded-xl">
          <CardContent className="p-6">
            {isEditMode && (
              <div className="mb-4 p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-900 text-sm">
                أنت حالياً في وضع التعديل على مشروع سابق. عند الإرسال سيتم إعادة التقديم للمراجعة.
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">خطوات إرسال المشروع</h3>
              <span className="text-sm text-gray-500">الخطوة {currentStep} من 5</span>
            </div>
            {/* Circles with labels directly under; connectors between steps */}
            <div className="flex items-center">
              {([1, 2, 3, 4, 5] as const).map((step, idx) => {
                const labels = [
                  'الموافقة على الشروط',
                  'البيانات الأساسية',
                  'الرسومات',
                  'المراجعة',
                  'الإرسال',
                ] as const;
                const label = labels[idx];
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center select-none" aria-hidden>
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm md:text-base font-semibold ring-1 ${
                            step === currentStep
                              ? 'bg-red-600 text-white ring-red-300 shadow-lg'
                              : completedSteps.includes(step)
                              ? 'bg-red-100 text-red-800 ring-red-200'
                              : 'bg-white text-gray-700 ring-gray-200'
                          }`}
                        >
                          {step === currentStep ? (
                            step
                          ) : completedSteps.includes(step) ? (
                            <CheckCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            step
                          )}
                        </div>
                      </div>
                      <span
                        className={`mt-1 text-[11px] leading-none font-medium whitespace-nowrap ${
                          currentStep === step
                            ? 'text-red-700'
                            : completedSteps.includes(step) || currentStep > step
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {step < 5 && (
                      <div className={`flex-1 h-1 mx-0 rounded ${
                        completedSteps.includes(step) ? 'bg-red-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border border-red-100 bg-white/80 backdrop-blur-sm rounded-xl">
          <CardHeader className="bg-gradient-to-r from-red-50 to-yellow-50 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-red-100 rounded-lg ring-1 ring-red-200">
                <Building className="h-6 w-6 text-red-600" />
              </div>
              {currentStep === 1 && 'الموافقة على الشروط'}
              {currentStep === 2 && 'البيانات الأساسية للمشروع'}
              {currentStep === 3 && 'الرسومات والمخططات'}
              {currentStep === 4 && 'مراجعة البيانات'}
              {currentStep === 5 && 'إرسال المشروع'}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 && 'اقرأ ووافق على الشروط والأحكام'}
              {currentStep === 2 && 'أدخل المعلومات الأساسية لمشروعك'}
              {currentStep === 3 && 'ارفع الرسومات الهندسية المطلوبة'}
              {currentStep === 4 && 'راجع جميع البيانات قبل الإرسال'}
              {currentStep === 5 && 'أرسل مشروعك للمراجعة الذكية'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* الخطوة 1: الموافقة على الشروط */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        الشروط والأحكام
                      </h4>
                      <div className="space-y-4 text-sm text-red-900/80">
                        <p className="font-medium">يرجى قراءة الشروط والأحكام التالية بعناية:</p>
                        
                        <div className="bg-white rounded-lg p-4 border border-red-100 max-h-96 overflow-y-auto">
                          <h5 className="font-semibold mb-3 text-gray-900">1. قبول الشروط</h5>
                          <p className="mb-3 text-gray-700">
                            بموافقتك على هذه الشروط، فإنك تؤكد أنك قد قرأت وفهمت جميع الشروط والأحكام المتعلقة بإرسال مشروعك للمراجعة وفقاً للكود المصري للحماية من الحريق.
                          </p>
                          
                          <h5 className="font-semibold mb-3 text-gray-900">2. دقة المعلومات</h5>
                          <p className="mb-3 text-gray-700">
                            تؤكد أن جميع المعلومات والبيانات المقدمة صحيحة ودقيقة، وأنك مسؤول عن أي أخطاء أو معلومات خاطئة قد تؤثر على عملية المراجعة.
                          </p>
                          
                          <h5 className="font-semibold mb-3 text-gray-900">3. الرسومات والمخططات</h5>
                          <p className="mb-3 text-gray-700">
                            تؤكد أن جميع الرسومات والمخططات المرفوعة مطابقة للمشروع الفعلي وأنها تحتوي على جميع التفاصيل المطلوبة وفقاً للمعايير الهندسية.
                          </p>
                          
                          <h5 className="font-semibold mb-3 text-gray-900">4. الالتزام بالكود المصري</h5>
                          <p className="mb-3 text-gray-700">
                            تتعهد بالالتزام بجميع متطلبات الكود المصري للحماية من الحريق رقم 126 لسنة 2021 وجميع التعديلات والملاحق الخاصة به.
                          </p>
                          
                          <h5 className="font-semibold mb-3 text-gray-900">5. المراجعة والموافقة</h5>
                          <p className="mb-3 text-gray-700">
                            تفهم أن عملية المراجعة قد تستغرق وقتاً وأن الموافقة على المشروع تعتمد على مدى توافقه مع متطلبات الكود المصري.
                          </p>
                          
                          <h5 className="font-semibold mb-3 text-gray-900">6. التعديلات المطلوبة</h5>
                          <p className="mb-3 text-gray-700">
                            في حالة طلب تعديلات على المشروع، تتعهد بتنفيذها وفقاً للمعايير المطلوبة وإعادة إرسال المشروع للمراجعة.
                          </p>
                          
                          <h5 className="font-semibold mb-3 text-gray-900">7. المسؤولية القانونية</h5>
                          <p className="mb-3 text-gray-700">
                            تتحمل المسؤولية الكاملة عن أي مخالفات أو عدم التزام بالمعايير المطلوبة، وأن النظام لا يتحمل أي مسؤولية قانونية عن ذلك.
                          </p>
                          
                          <h5 className="font-semibold mb-3 text-gray-900">8. الخصوصية والأمان</h5>
                          <p className="mb-3 text-gray-700">
                            تؤكد أن جميع البيانات المقدمة ستتم معالجتها بسرية تامة ولن يتم استخدامها إلا لأغراض المراجعة المطلوبة.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* مربع الموافقة */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="termsAcceptance"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <label htmlFor="termsAcceptance" className="text-sm font-medium text-gray-900 cursor-pointer">
                            أوافق على الشروط والأحكام أعلاه
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            يجب الموافقة على الشروط والأحكام للمتابعة إلى الخطوة التالية
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* تحذير في حالة عدم الموافقة */}
                    {!termsAccepted && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          يجب الموافقة على الشروط والأحكام للمتابعة
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* الخطوة 2: البيانات الأساسية */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectName">اسم المشروع *</Label>
                        <Input
                          id="projectName"
                          value={projectData.projectName}
                          onChange={(e) => handleInputChange('projectName', e.target.value)}
                          placeholder="أدخل اسم المشروع"
                          className={missingFields.projectName ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.projectName && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buildingType">نوع المبنى *</Label>
                        <Select value={projectData.buildingType} onValueChange={(value) => handleInputChange('buildingType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المبنى" />
                          </SelectTrigger>
                          <SelectContent>
                            {buildingTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {missingFields.buildingType && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupancyType">نوع الاستخدام *</Label>
                        <Select value={projectData.occupancyType} onValueChange={(value) => handleInputChange('occupancyType', value)}>
                          <SelectTrigger className={missingFields.occupancyType ? 'border-red-300 focus-visible:ring-red-500' : ''}>
                            <SelectValue placeholder="اختر نوع الاستخدام" />
                          </SelectTrigger>
                          <SelectContent>
                            {occupancyTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {missingFields.occupancyType && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">الموقع *</Label>
                        <Input
                          id="location"
                          value={projectData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="أدخل موقع المشروع"
                          className={missingFields.location ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.location && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="area">المساحة (متر مربع) *</Label>
                        <Input
                          id="area"
                          type="number"
                          value={projectData.area}
                          onChange={(e) => handleInputChange('area', e.target.value)}
                          placeholder="أدخل المساحة"
                          className={missingFields.area ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.area && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="floors">عدد الطوابق *</Label>
                        <Input
                          id="floors"
                          type="number"
                          value={projectData.floors}
                          onChange={(e) => handleInputChange('floors', e.target.value)}
                          placeholder="أدخل عدد الطوابق"
                          className={missingFields.floors ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.floors && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buildingHeight">ارتفاع المبنى (متر) *</Label>
                        <Input
                          id="buildingHeight"
                          type="number"
                          value={projectData.buildingHeight}
                          onChange={(e) => handleInputChange('buildingHeight', e.target.value)}
                          placeholder="أدخل ارتفاع المبنى"
                          className={missingFields.buildingHeight ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.buildingHeight && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="basementFloors">عدد الطوابق السفلية *</Label>
                        <Input
                          id="basementFloors"
                          type="number"
                          value={projectData.basementFloors}
                          onChange={(e) => handleInputChange('basementFloors', e.target.value)}
                          placeholder="أدخل عدد الطوابق السفلية"
                          className={missingFields.basementFloors ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.basementFloors && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalOccupancy">إجمالي السعة (شخص) *</Label>
                        <Input
                          id="totalOccupancy"
                          type="number"
                          value={projectData.totalOccupancy}
                          onChange={(e) => handleInputChange('totalOccupancy', e.target.value)}
                          placeholder="أدخل إجمالي السعة"
                          className={missingFields.totalOccupancy ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.totalOccupancy && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parkingSpaces">عدد أماكن الوقوف *</Label>
                        <Input
                          id="parkingSpaces"
                          type="number"
                          value={projectData.parkingSpaces}
                          onChange={(e) => handleInputChange('parkingSpaces', e.target.value)}
                          placeholder="أدخل عدد أماكن الوقوف"
                          className={missingFields.parkingSpaces ? 'border-red-300 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {missingFields.parkingSpaces && (
                          <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                        )}
                      </div>

                       <div className="space-y-2">
                         <Label htmlFor="constructionType">نوع البناء *</Label>
                         <Select value={projectData.constructionType} onValueChange={(value) => handleInputChange('constructionType', value)}>
                           <SelectTrigger className={missingFields.constructionType ? 'border-red-300 focus-visible:ring-red-500' : ''}>
                             <SelectValue placeholder="اختر نوع البناء" />
                           </SelectTrigger>
                           <SelectContent>
                             {constructionTypes.map((type) => (
                               <SelectItem key={type} value={type}>{type}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         {missingFields.constructionType && (
                           <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                         )}
                       </div>
                     </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">وصف المشروع *</Label>
                      <Textarea
                        id="description"
                        value={projectData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="أدخل وصفاً مختصراً للمشروع"
                        className={missingFields.description ? 'border-red-300 focus-visible:ring-red-500' : ''}
                        rows={3}
                      />
                      {missingFields.description && (
                        <p className="text-xs text-red-600">هذا الحقل مطلوب</p>
                      )}
                    </div>


                    {/* الخريطة التفاعلية */}
                    <div className="mt-8">
                      <ProjectLocationMap 
                        onLocationSelect={handleLocationSelect}
                        initialLocation={projectData.projectLat && projectData.projectLng ? {
                          lat: parseFloat(projectData.projectLat),
                          lng: parseFloat(projectData.projectLng),
                          address: projectData.projectAddress
                        } : undefined}
                      />
                      {missingFields.map && (
                        <p className="mt-2 text-xs text-red-600">يرجى اختيار موقع المشروع من الخريطة</p>
                      )}
                    </div>
                  </div>
                )}

                {/* الخطوة 3: الرسومات والمخططات */}
                {currentStep === 3 && (

                  <div className="space-y-4">
                    

                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-lg"
                        onClick={handleDropZoneClick}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-500" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">رفع الرسومات</h4>
                        <p className="text-gray-600 mb-4">اسحب وأفلت الرسومات هنا أو اضغط للاختيار</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                          <span>يدعم جميع التنسيقات:</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">DWG</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">RVT</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">DGN</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">وغيرها</span>
                        </div>
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.dwg,.rvt,.rfa,.dgn,.dxf,.dwt,.sat,.step,.iges,.obj,.3ds,.fbx,.skp,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.gif"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button type="button" variant="outline" size="lg" className="px-6">
                          اختر الرسومات
                        </Button>
                      </div>

                      {uploadMessage && (
                        <div className={`p-3 rounded-lg text-sm ${
                          uploadMessage.includes('نجاح') 
                            ? 'bg-green-50 border border-green-200 text-green-800' 
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                          {uploadMessage}
                        </div>
                      )}

                      {(existingDrawings.length > 0 || drawings.length > 0) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-600" />
                            الرسومات المرفوعة ({existingDrawings.length + drawings.length})
                          </h4>
                          {existingDrawings.length > 0 && (
                            <div className="space-y-2">
                              {existingDrawings.map((d, i) => (
                                <div key={`existing-${i}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-red-600" />
                                    <span className="font-medium">{d.fileName}</span>
                                    <span className="text-sm text-gray-500">({(d.fileSize/1024/1024).toFixed(2)} MB)</span>
                                  </div>
                                  <span className="text-xs text-gray-500">ملف موجود مسبقاً</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {drawings.map((drawing, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                  <FileText className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{drawing.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {(drawing.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeDrawing(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  حذف
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* الخطوة 4: مراجعة البيانات */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900">مراجعة البيانات المدخلة</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">اسم المشروع:</span>
                            <span className="font-medium">{projectData.projectName || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">نوع المبنى:</span>
                            <span className="font-medium">{projectData.buildingType || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الموقع:</span>
                            <span className="font-medium">{projectData.projectAddress || projectData.location || '-'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">المساحة:</span>
                            <span className="font-medium">{projectData.area ? `${projectData.area} م²` : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">عدد الطوابق:</span>
                            <span className="font-medium">{projectData.floors || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">الرسومات:</span>
                            <span className="font-medium">{drawings.length} ملف</span>
                          </div>
                        </div>
                      </div>
                      
                      {projectData.description && (
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-gray-600">الوصف:</span>
                          <p className="mt-1 text-gray-900">{projectData.description}</p>
                        </div>
                      )}

                      {/* بيانات إضافية */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-gray-600">عدد الطوابق السفلية:</span><span className="font-medium">{projectData.basementFloors || '-'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">أماكن الوقوف:</span><span className="font-medium">{projectData.parkingSpaces || '-'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">نوع الاستخدام:</span><span className="font-medium">{projectData.occupancyType || '-'}</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-gray-600">عدد الرسومات:</span><span className="font-medium">{drawings.length} ملف</span></div>
                        </div>
                      </div>

                      {/* بيانات الموقع */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-gray-600">العنوان:</span><span className="font-medium">{projectData.projectAddress || projectData.location || '-'}</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-gray-600">خط العرض:</span><span className="font-medium">{projectData.projectLat || '-'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">خط الطول:</span><span className="font-medium">{projectData.projectLng || '-'}</span></div>
                        </div>
                      </div>

                    </div>
                    
                    {drawings.length > 0 && (
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900">الرسومات المرفوعة</h4>
                        <div className="space-y-2">
                          {drawings.map((drawing, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-red-600" />
                                <span className="font-medium">{drawing.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({(drawing.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* تمت إزالة تكرار الشروط والأحكام من خطوة 5 */}

                {/* الخطوة 5: الإرسال */}
                {currentStep === 5 && (
                  <div className="space-y-6 text-center">
                    {submitVisualState === 'idle' && (
                      <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
                        <CheckCircle className="h-16 w-16 text-gray-900 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">جاهز للإرسال!</h4>
                        <p className="text-gray-700 mb-4">
                          جميع البيانات مكتملة. اضغط على "إرسال المشروع" لإرسال مشروعك للمراجعة الذكية.
                        </p>
                        {isEditMode && (
                          <div className="mb-4 inline-flex items-center gap-2 text-sm text-gray-700">
                            <span>وضع الإرسال: إعادة التقديم للمراجعة</span>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-3 text-sm">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-300 text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            البيانات مكتملة
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-300 text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            الرسومات مرفوعة
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-300 text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            جاهز للمراجعة
                          </span>
                        </div>
                      </div>
                    )}
                    {submitVisualState === 'loading' && (
                      <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">جاري الإرسال...</h4>
                        <p className="text-gray-600">برجاء الانتظار لحظات حتى يتم إرسال الطلب</p>
                      </div>
                    )}
                    {submitVisualState === 'success' && (
                      <div className="p-8 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-green-900 mb-2">تم إرسال الطلب بنجاح</h4>
                        <p className="text-green-700">سيتم تحويلك إلى لوحة التحكم...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* أزرار التنقل */}
                <div className="flex gap-4 pt-6 border-t">
                  {currentStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="px-6 py-3 text-lg font-semibold border-2 hover:bg-gray-50"
                    >
                      السابق
                    </Button>
                  )}
                  
                  {currentStep < 5 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={currentStep === 1 && !termsAccepted}
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentStep === 1 ? 'الموافقة والمتابعة' : 'التالي'}
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isLoading || !termsAccepted} 
                      onClick={() => setSubmitTriggered(true)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري الإرسال...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          إرسال المشروع
                        </div>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 text-lg font-semibold border-2 hover:bg-gray-50"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      

      {/* المساعد الذكي */}
      <ApplicantChatBot 
        currentStep={currentStep}
        projectData={projectData}
        drawings={drawings}
        onStepNavigation={goToStep}
        user={user}
      />
    </div>
  );
};

export default ProjectSubmission;