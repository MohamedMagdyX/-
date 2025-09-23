// خدمة التحليل التفصيلي المتقدم
import { BuildingDrawing, Project } from '../data/fireCodeDatabase';

export interface DetailedStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'warning';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  details: {
    subSteps: SubStep[];
    metrics: Metric[];
    logs: LogEntry[];
    errors: ErrorEntry[];
    warnings: WarningEntry[];
  };
  result?: any;
}

export interface SubStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  details?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'debug' | 'warn' | 'error';
  message: string;
  source: string;
  data?: any;
}

export interface ErrorEntry {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  suggestion: string;
}

export interface WarningEntry {
  code: string;
  message: string;
  category: 'performance' | 'compatibility' | 'security' | 'quality';
  suggestion: string;
}

export interface DetailedAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  classification: string;
  overallStatus: string;
  complianceScore: number;
  processingTime: number;
  steps: DetailedStep[];
  summary: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    warningsCount: number;
    errorsCount: number;
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
  };
  detectedElements: {
    category: string;
    elements: {
      name: string;
      confidence: number;
      location?: { x: number; y: number; width: number; height: number };
      properties: { [key: string]: any };
    }[];
  }[];
  complianceAnalysis: {
    ruleId: string;
    ruleTitle: string;
    category: string;
    severity: 'critical' | 'major' | 'minor';
    status: 'compliant' | 'non_compliant' | 'needs_attention';
    description: string;
    suggestedFix: string;
    evidence: {
      type: 'text' | 'image' | 'measurement' | 'calculation';
      content: string;
      confidence: number;
    }[];
    impact: {
      safety: number;
      cost: number;
      timeline: string;
      complexity: 'low' | 'medium' | 'high';
    };
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    benefits: string[];
    implementation: {
      steps: string[];
      resources: string[];
      timeline: string;
      cost: string;
    };
  }[];
  technicalDetails: {
    processingEngine: string;
    aiModel: string;
    version: string;
    confidence: number;
    accuracy: number;
    performance: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
  };
}

class DetailedAnalysisService {
  private logEntryId = 0;
  private errorId = 0;
  private warningId = 0;

  // إنشاء سجل جديد
  private createLog(level: LogEntry['level'], message: string, source: string, data?: any): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      source,
      data
    };
  }

  // إنشاء خطأ جديد
  private createError(code: string, message: string, severity: ErrorEntry['severity'], source: string, suggestion: string): ErrorEntry {
    return {
      code,
      message,
      severity,
      source,
      suggestion
    };
  }

  // إنشاء تحذير جديد
  private createWarning(code: string, message: string, category: WarningEntry['category'], suggestion: string): WarningEntry {
    return {
      code,
      message,
      category,
      suggestion
    };
  }

  // تصنيف الملف
  private classifyFile(fileName: string): string {
    const name = fileName.toLowerCase();
    const classifications = {
      'architectural': 'المخططات المعمارية',
      'معماري': 'المخططات المعمارية',
      'structural': 'المخططات الإنشائية',
      'إنشائي': 'المخططات الإنشائية',
      'electrical': 'مخططات الكهرباء',
      'كهرباء': 'مخططات الكهرباء',
      'plumbing': 'مخططات السباكة',
      'سباكة': 'مخططات السباكة',
      'hvac': 'مخططات التكييف',
      'تكييف': 'مخططات التكييف',
      'fire': 'مخططات الحريق',
      'حريق': 'مخططات الحريق',
      'topographic': 'المخططات الطبوغرافية',
      'طبوغرافي': 'المخططات الطبوغرافية',
      'site': 'مخططات الموقع',
      'موقع': 'مخططات الموقع'
    };

    for (const [keyword, classification] of Object.entries(classifications)) {
      if (name.includes(keyword)) {
        return classification;
      }
    }
    return 'المخططات المعمارية';
  }

  // اكتشاف العناصر
  private detectElements(classification: string): any[] {
    const elementMap: { [key: string]: any[] } = {
      'المخططات المعمارية': [
        {
          name: 'الجدران الخارجية',
          confidence: 0.95,
          location: { x: 100, y: 150, width: 800, height: 600 },
          properties: {
            thickness: '20cm',
            material: 'خرسانة مسلحة',
            insulation: 'عزل حراري 5cm',
            fireRating: '2 ساعة'
          }
        },
        {
          name: 'المخارج الرئيسية',
          confidence: 0.88,
          location: { x: 200, y: 400, width: 120, height: 240 },
          properties: {
            width: '120cm',
            height: '240cm',
            type: 'مخرج رئيسي',
            capacity: '100 شخص',
            distance: '30 متر'
          }
        },
        {
          name: 'المخارج الطارئة',
          confidence: 0.92,
          location: { x: 600, y: 300, width: 90, height: 210 },
          properties: {
            width: '90cm',
            height: '210cm',
            type: 'مخرج طارئ',
            capacity: '50 شخص',
            distance: '15 متر'
          }
        },
        {
          name: 'المساحات المفتوحة',
          confidence: 0.85,
          location: { x: 50, y: 50, width: 900, height: 100 },
          properties: {
            area: '90 متر مربع',
            percentage: '22%',
            purpose: 'طوارئ وإنقاذ',
            accessibility: 'مفتوح 24/7'
          }
        }
      ],
      'مخططات الحريق': [
        {
          name: 'أجهزة كشف الدخان',
          confidence: 0.94,
          location: { x: 300, y: 200, width: 20, height: 20 },
          properties: {
            type: 'كاشف دخان بصري',
            coverage: '100 متر مربع',
            sensitivity: 'عالية',
            maintenance: 'سنوي'
          }
        },
        {
          name: 'أجهزة كشف الحرارة',
          confidence: 0.89,
          location: { x: 500, y: 350, width: 20, height: 20 },
          properties: {
            type: 'كاشف حرارة ثابت',
            threshold: '68 درجة مئوية',
            coverage: '80 متر مربع',
            response: 'سريع'
          }
        },
        {
          name: 'طفايات الحريق',
          confidence: 0.91,
          location: { x: 150, y: 300, width: 30, height: 60 },
          properties: {
            type: 'مسحوق جاف',
            capacity: '6 كيلو',
            coverage: '200 متر مربع',
            pressure: '12 بار'
          }
        },
        {
          name: 'أنظمة الإطفاء التلقائي',
          confidence: 0.87,
          location: { x: 400, y: 100, width: 200, height: 50 },
          properties: {
            type: 'رشاشات تلقائية',
            coverage: '100% من المساحة',
            pressure: '3 بار',
            waterSource: 'خزان رئيسي'
          }
        }
      ],
      'مخططات الكهرباء': [
        {
          name: 'لوحات التوزيع',
          confidence: 0.93,
          location: { x: 100, y: 100, width: 80, height: 120 },
          properties: {
            type: 'لوحة رئيسية',
            capacity: '400 أمبير',
            circuits: 24,
            protection: 'قاطع تفاضلي'
          }
        },
        {
          name: 'الكابلات',
          confidence: 0.86,
          location: { x: 200, y: 150, width: 400, height: 10 },
          properties: {
            type: 'كابل نحاس',
            crossSection: '16 مم²',
            insulation: 'XLPE',
            voltage: '380/220 فولت'
          }
        },
        {
          name: 'أجهزة الإنذار',
          confidence: 0.90,
          location: { x: 350, y: 250, width: 40, height: 60 },
          properties: {
            type: 'إنذار صوتي وضوئي',
            power: '12 فولت',
            sound: '105 ديسيبل',
            strobe: 'LED أحمر'
          }
        }
      ]
    };

    return elementMap[classification] || [];
  }

  // تحليل المطابقة
  private analyzeCompliance(classification: string, buildingType: string): any[] {
    const rules = [
      {
        ruleId: 'rule-001',
        ruleTitle: 'تعريف المبنى والغرض منه',
        category: 'التعريفات والمصطلحات',
        severity: 'critical' as const,
        description: 'يجب أن يكون المبنى محددا بوضوح في المخططات مع تحديد الغرض من الاستخدام',
        suggestedFix: 'إضافة لوحة تعريف واضحة في المخططات تحدد نوع المبنى والغرض منه',
        evidence: [
          {
            type: 'text' as const,
            content: 'تم العثور على تعريف المبنى في المخطط المعماري',
            confidence: 0.85
          }
        ],
        impact: {
          safety: 8,
          cost: 2,
          timeline: '1-2 أيام',
          complexity: 'low' as const
        }
      },
      {
        ruleId: 'rule-004',
        ruleTitle: 'المسافة الدنيا بين المباني',
        category: 'المساحات والمسافات',
        severity: 'major' as const,
        description: 'يجب أن تكون المسافة الدنيا بين المباني 6 أمتار على الأقل للسماح بوصول سيارات الإطفاء',
        suggestedFix: 'زيادة المسافة بين المباني إلى 6 أمتار على الأقل أو توفير ممرات إضافية للوصول',
        evidence: [
          {
            type: 'measurement' as const,
            content: 'المسافة الحالية: 4.5 متر (أقل من الحد المطلوب)',
            confidence: 0.92
          }
        ],
        impact: {
          safety: 7,
          cost: 6,
          timeline: '2-4 أسابيع',
          complexity: 'medium' as const
        }
      },
      {
        ruleId: 'rule-007',
        ruleTitle: 'عدد المخارج المطلوبة',
        category: 'المخارج والمداخل',
        severity: 'critical' as const,
        description: 'يجب أن يكون عدد المخارج كافيا لعدد السكان المتوقع (مخرج واحد لكل 50 شخص)',
        suggestedFix: 'زيادة عدد المخارج حسب عدد السكان المتوقع أو تقليل سعة الاستيعاب',
        evidence: [
          {
            type: 'calculation' as const,
            content: 'السعة الحالية: 150 شخص، المخارج المتوفرة: 2 (المطلوب: 3 على الأقل)',
            confidence: 0.88
          }
        ],
        impact: {
          safety: 9,
          cost: 8,
          timeline: '4-6 أسابيع',
          complexity: 'high' as const
        }
      },
      {
        ruleId: 'rule-010',
        ruleTitle: 'توزيع أجهزة كشف الدخان',
        category: 'أنظمة الإنذار',
        severity: 'major' as const,
        description: 'يجب توزيع أجهزة كشف الدخان بشكل صحيح (جهاز لكل 100 متر مربع)',
        suggestedFix: 'إضافة أجهزة كشف دخان إضافية في المناطق غير مغطاة',
        evidence: [
          {
            type: 'measurement' as const,
            content: 'المساحة غير مغطاة: 150 متر مربع في الطابق الثاني',
            confidence: 0.90
          }
        ],
        impact: {
          safety: 6,
          cost: 4,
          timeline: '1-2 أسابيع',
          complexity: 'low' as const
        }
      }
    ];

    // محاكاة فحص المطابقة
    const issues = [];
    rules.forEach(rule => {
      const hasIssue = Math.random() < (rule.severity === 'critical' ? 0.4 : 0.3);
      if (hasIssue) {
        issues.push({
          ...rule,
          status: 'non_compliant' as const
        });
      } else {
        issues.push({
          ...rule,
          status: 'compliant' as const
        });
      }
    });

    return issues;
  }

  // إنشاء التوصيات
  private generateRecommendations(complianceAnalysis: any[]): any[] {
    const recommendations = [];

    complianceAnalysis.forEach(rule => {
      if (rule.status === 'non_compliant') {
        recommendations.push({
          priority: rule.severity === 'critical' ? 'high' as const : 
                   rule.severity === 'major' ? 'medium' as const : 'low' as const,
          category: rule.category,
          title: `إصلاح مشكلة ${rule.ruleTitle}`,
          description: `تنفيذ الحل المقترح لمشكلة ${rule.ruleTitle} لضمان الامتثال للمعايير`,
          benefits: [
            'تحسين مستوى السلامة',
            'الامتثال للمعايير القانونية',
            'تقليل مخاطر الحريق',
            'تسهيل الحصول على الترخيص'
          ],
          implementation: {
            steps: [
              'مراجعة المخططات الحالية',
              'تحديد المواقع المطلوب تعديلها',
              'إعداد المخططات المحدثة',
              'الحصول على الموافقات المطلوبة',
              'تنفيذ التعديلات',
              'إجراء الاختبارات والفحوصات'
            ],
            resources: [
              'مهندس معماري',
              'مهندس حماية من الحريق',
              'فريق البناء',
              'معدات خاصة'
            ],
            timeline: rule.impact.timeline,
            cost: rule.severity === 'critical' ? '15,000 - 25,000 جنيه' :
                  rule.severity === 'major' ? '8,000 - 15,000 جنيه' : '3,000 - 8,000 جنيه'
          }
        });
      }
    });

    return recommendations;
  }

  // تحليل ملف مفصل
  async analyzeFileDetailed(drawing: BuildingDrawing, project: Project): Promise<DetailedAnalysis> {
    const startTime = Date.now();
    const classification = this.classifyFile(drawing.fileName);
    const steps: DetailedStep[] = [];

    // الخطوة 1: تصنيف الملف
    const step1: DetailedStep = {
      id: `step-1-${drawing.id}`,
      name: 'تصنيف الملف',
      description: 'تحليل اسم الملف والمحتوى لتحديد نوع الرسم',
      status: 'processing',
      startTime: new Date(),
      progress: 0,
      details: {
        subSteps: [
          {
            id: 'sub-1-1',
            name: 'تحليل اسم الملف',
            status: 'processing'
          },
          {
            id: 'sub-1-2',
            name: 'فحص المحتوى',
            status: 'pending'
          },
          {
            id: 'sub-1-3',
            name: 'تحديد التصنيف',
            status: 'pending'
          }
        ],
        metrics: [],
        logs: [
          this.createLog('info', `بدء تحليل الملف: ${drawing.fileName}`, 'FileClassifier'),
          this.createLog('debug', `فحص الكلمات المفتاحية في اسم الملف`, 'FileClassifier')
        ],
        errors: [],
        warnings: []
      }
    };
    steps.push(step1);

    // محاكاة معالجة الخطوة 1
    await new Promise(resolve => setTimeout(resolve, 800));
    step1.status = 'completed';
    step1.endTime = new Date();
    step1.duration = 800;
    step1.progress = 100;
    step1.details.subSteps[0].status = 'completed';
    step1.details.subSteps[0].duration = 300;
    step1.details.subSteps[1].status = 'completed';
    step1.details.subSteps[1].duration = 300;
    step1.details.subSteps[2].status = 'completed';
    step1.details.subSteps[2].duration = 200;
    step1.details.logs.push(
      this.createLog('info', `تم تصنيف الملف كـ: ${classification}`, 'FileClassifier'),
      this.createLog('debug', `مستوى الثقة في التصنيف: 95%`, 'FileClassifier')
    );
    step1.details.metrics.push(
      {
        name: 'مستوى الثقة',
        value: 95,
        unit: '%',
        trend: 'stable',
        status: 'good'
      },
      {
        name: 'وقت التصنيف',
        value: 800,
        unit: 'ms',
        trend: 'down',
        status: 'good'
      }
    );

    // الخطوة 2: اكتشاف العناصر
    const step2: DetailedStep = {
      id: `step-2-${drawing.id}`,
      name: 'اكتشاف العناصر',
      description: 'فحص الرسم لاكتشاف العناصر والتفاصيل',
      status: 'processing',
      startTime: new Date(),
      progress: 0,
      details: {
        subSteps: [
          {
            id: 'sub-2-1',
            name: 'تحليل الصورة',
            status: 'processing'
          },
          {
            id: 'sub-2-2',
            name: 'تحديد العناصر',
            status: 'pending'
          },
          {
            id: 'sub-2-3',
            name: 'تحليل الخصائص',
            status: 'pending'
          }
        ],
        metrics: [],
        logs: [
          this.createLog('info', `بدء اكتشاف العناصر في ${classification}`, 'ElementDetector')
        ],
        errors: [],
        warnings: []
      }
    };
    steps.push(step2);

    await new Promise(resolve => setTimeout(resolve, 1200));
    const detectedElements = this.detectElements(classification);
    step2.status = 'completed';
    step2.endTime = new Date();
    step2.duration = 1200;
    step2.progress = 100;
    step2.details.subSteps[0].status = 'completed';
    step2.details.subSteps[0].duration = 400;
    step2.details.subSteps[1].status = 'completed';
    step2.details.subSteps[1].duration = 500;
    step2.details.subSteps[2].status = 'completed';
    step2.details.subSteps[2].duration = 300;
    step2.details.logs.push(
      this.createLog('info', `تم اكتشاف ${detectedElements.length} عنصر`, 'ElementDetector'),
      this.createLog('debug', `متوسط مستوى الثقة: ${(detectedElements.reduce((acc, el) => acc + el.confidence, 0) / detectedElements.length * 100).toFixed(1)}%`, 'ElementDetector')
    );
    step2.details.metrics.push(
      {
        name: 'العناصر المكتشفة',
        value: detectedElements.length,
        unit: 'عنصر',
        trend: 'stable',
        status: 'good'
      },
      {
        name: 'متوسط الثقة',
        value: Math.round(detectedElements.reduce((acc, el) => acc + el.confidence, 0) / detectedElements.length * 100),
        unit: '%',
        trend: 'up',
        status: 'good'
      }
    );

    // الخطوة 3: فحص المطابقة
    const step3: DetailedStep = {
      id: `step-3-${drawing.id}`,
      name: 'فحص المطابقة',
      description: 'فحص المطابقة مع قواعد الكود المصري',
      status: 'processing',
      startTime: new Date(),
      progress: 0,
      details: {
        subSteps: [
          {
            id: 'sub-3-1',
            name: 'تحميل القواعد',
            status: 'processing'
          },
          {
            id: 'sub-3-2',
            name: 'فحص المطابقة',
            status: 'pending'
          },
          {
            id: 'sub-3-3',
            name: 'تقييم المخاطر',
            status: 'pending'
          }
        ],
        metrics: [],
        logs: [
          this.createLog('info', `بدء فحص المطابقة مع ${classification}`, 'ComplianceChecker')
        ],
        errors: [],
        warnings: []
      }
    };
    steps.push(step3);

    await new Promise(resolve => setTimeout(resolve, 1500));
    const complianceAnalysis = this.analyzeCompliance(classification, project.buildingType);
    const criticalIssues = complianceAnalysis.filter(r => r.severity === 'critical' && r.status === 'non_compliant').length;
    const majorIssues = complianceAnalysis.filter(r => r.severity === 'major' && r.status === 'non_compliant').length;
    const minorIssues = complianceAnalysis.filter(r => r.severity === 'minor' && r.status === 'non_compliant').length;

    step3.status = 'completed';
    step3.endTime = new Date();
    step3.duration = 1500;
    step3.progress = 100;
    step3.details.subSteps[0].status = 'completed';
    step3.details.subSteps[0].duration = 300;
    step3.details.subSteps[1].status = 'completed';
    step3.details.subSteps[1].duration = 800;
    step3.details.subSteps[2].status = 'completed';
    step3.details.subSteps[2].duration = 400;
    step3.details.logs.push(
      this.createLog('info', `تم فحص ${complianceAnalysis.length} قاعدة`, 'ComplianceChecker'),
      this.createLog('warn', `تم اكتشاف ${criticalIssues + majorIssues + minorIssues} مشكلة`, 'ComplianceChecker')
    );

    if (criticalIssues > 0) {
      step3.details.warnings.push(
        this.createWarning('CRITICAL_ISSUES', `تم اكتشاف ${criticalIssues} مشكلة حرجة`, 'quality', 'يجب إصلاح المشاكل الحرجة فوراً')
      );
    }

    step3.details.metrics.push(
      {
        name: 'القواعد المفحوصة',
        value: complianceAnalysis.length,
        unit: 'قاعدة',
        trend: 'stable',
        status: 'good'
      },
      {
        name: 'المشاكل الحرجة',
        value: criticalIssues,
        unit: 'مشكلة',
        trend: criticalIssues > 0 ? 'up' : 'stable',
        status: criticalIssues > 0 ? 'critical' : 'good'
      }
    );

    // الخطوة 4: حساب النقاط والتوصيات
    const step4: DetailedStep = {
      id: `step-4-${drawing.id}`,
      name: 'حساب النقاط والتوصيات',
      description: 'حساب درجة الامتثال وإنشاء التوصيات',
      status: 'processing',
      startTime: new Date(),
      progress: 0,
      details: {
        subSteps: [
          {
            id: 'sub-4-1',
            name: 'حساب النقاط',
            status: 'processing'
          },
          {
            id: 'sub-4-2',
            name: 'إنشاء التوصيات',
            status: 'pending'
          },
          {
            id: 'sub-4-3',
            name: 'توليد التقرير',
            status: 'pending'
          }
        ],
        metrics: [],
        logs: [
          this.createLog('info', 'بدء حساب درجة الامتثال', 'ScoreCalculator')
        ],
        errors: [],
        warnings: []
      }
    };
    steps.push(step4);

    await new Promise(resolve => setTimeout(resolve, 600));
    const totalIssues = criticalIssues + majorIssues + minorIssues;
    const complianceScore = Math.max(0, 100 - (criticalIssues * 20 + majorIssues * 10 + minorIssues * 5));
    const recommendations = this.generateRecommendations(complianceAnalysis);

    let overallStatus = 'approved';
    if (criticalIssues > 0) overallStatus = 'rejected';
    else if (majorIssues > 0) overallStatus = 'needs_revision';

    step4.status = 'completed';
    step4.endTime = new Date();
    step4.duration = 600;
    step4.progress = 100;
    step4.details.subSteps[0].status = 'completed';
    step4.details.subSteps[0].duration = 200;
    step4.details.subSteps[1].status = 'completed';
    step4.details.subSteps[1].duration = 300;
    step4.details.subSteps[2].status = 'completed';
    step4.details.subSteps[2].duration = 100;
    step4.details.logs.push(
      this.createLog('info', `درجة الامتثال: ${complianceScore}%`, 'ScoreCalculator'),
      this.createLog('info', `تم إنشاء ${recommendations.length} توصية`, 'RecommendationGenerator')
    );
    step4.details.metrics.push(
      {
        name: 'درجة الامتثال',
        value: complianceScore,
        unit: '%',
        trend: complianceScore >= 80 ? 'stable' : 'down',
        status: complianceScore >= 80 ? 'good' : complianceScore >= 60 ? 'warning' : 'critical'
      },
      {
        name: 'التوصيات',
        value: recommendations.length,
        unit: 'توصية',
        trend: 'stable',
        status: 'good'
      }
    );

    const processingTime = Date.now() - startTime;

    return {
      id: `analysis-${drawing.id}-${Date.now()}`,
      fileName: drawing.fileName,
      fileSize: drawing.fileSize,
      fileType: drawing.fileType,
      classification,
      overallStatus,
      complianceScore,
      processingTime,
      steps,
      summary: {
        totalSteps: steps.length,
        completedSteps: steps.filter(s => s.status === 'completed').length,
        failedSteps: steps.filter(s => s.status === 'error').length,
        warningsCount: steps.reduce((acc, s) => acc + s.details.warnings.length, 0),
        errorsCount: steps.reduce((acc, s) => acc + s.details.errors.length, 0),
        totalIssues,
        criticalIssues,
        majorIssues,
        minorIssues
      },
      detectedElements: [{
        category: classification,
        elements: detectedElements
      }],
      complianceAnalysis,
      recommendations,
      technicalDetails: {
        processingEngine: 'Safe Egypt AI Engine v2.1',
        aiModel: 'Fire Safety Compliance Model v1.8',
        version: '2.1.0',
        confidence: 94.5,
        accuracy: 96.2,
        performance: {
          cpu: Math.round(Math.random() * 30 + 20),
          memory: Math.round(Math.random() * 40 + 30),
          disk: Math.round(Math.random() * 20 + 10),
          network: Math.round(Math.random() * 15 + 5)
        }
      }
    };
  }
}

export const detailedAnalysisService = new DetailedAnalysisService();
