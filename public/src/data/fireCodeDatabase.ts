// قاعدة البيانات للكود المصري لحماية المباني من أخطار الحريق
import { egyptianFireCodeAnalyzer } from '../services/egyptianFireCodeAnalyzer';
export interface FireCodeRule {
  id: string;
  category: string;
  subCategory: string;
  ruleNumber: string;
  title: string;
  description: string;
  requirements: string[];
  violations: string[];
  severity: 'critical' | 'major' | 'minor';
  buildingType: string[];
  applicableAreas: string[];
}

export interface BuildingDrawing {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  reviewResults: ReviewResult[];
}

export interface ReviewResult {
  ruleId: string;
  status: 'compliant' | 'non_compliant' | 'needs_attention';
  notes: string;
  severity: 'critical' | 'major' | 'minor';
  suggestedFix?: string;
}

export interface Project {
  id: string;
  applicantId: string;
  projectName: string;
  buildingType: string;
  location: string;
  area: number;
  floors: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  submissionDate: string;
  reviewDate?: string;
  approvalDate?: string;
  drawings: BuildingDrawing[];
  reviewReport?: ReviewReport;
  license?: License;
  // بيانات الموقع الجديدة
  projectLat?: number;
  projectLng?: number;
  projectAddress?: string;
  // البيانات الإضافية
  occupancyType?: string;
  buildingHeight?: number;
  basementFloors?: number;
  parkingSpaces?: number;
  totalOccupancy?: number;
  constructionType?: string;
}

export interface ReviewReport {
  id: string;
  projectId: string;
  overallStatus: 'approved' | 'rejected' | 'needs_revision';
  complianceScore: number;
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  recommendations: string[];
  generatedDate: string;
  reviewerId: string;
}

export interface License {
  id: string;
  projectId: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  pdfPath: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  body: string;
  projectId?: string;
  createdAt: string;
  read: boolean;
}

// قاعدة البيانات للكود المصري
class FireCodeDatabase {
  // مُحلّل اختياري عالي الدقة للرسومات يمكن حقنه لاحقًا بدون تغيير الواجهة
  private drawingAnalyzer?: {
    analyze: (project: Project) => {
      critical: number;
      major: number;
      minor: number;
      notes: string[];
      missingEssentials?: string[];
    }
  };

  setDrawingAnalyzer(analyzer: { analyze: FireCodeDatabase['drawingAnalyzer']['analyze'] }): void {
    this.drawingAnalyzer = analyzer as any;
  }

  // تخزين نتائج تحليل خارجي عالي الدقة (يتم تزويده من خدمة مستقلة)
  private externalDrawingAnalysisCache: Record<string, {
    critical: number;
    major: number;
    minor: number;
    notes: string[];
    missingEssentials?: string[];
  }> = {};

  // إدخال/تحديث نتائج التحليل الخارجي لمشروع ما
  ingestExternalDrawingAnalysis(projectId: string, analysis: {
    critical: number;
    major: number;
    minor: number;
    notes: string[];
    missingEssentials?: string[];
  }): void {
    this.externalDrawingAnalysisCache[projectId] = analysis;
  }

  // محلل هيوريستي مدمج للرسومات (fallback) لرفع الدقة بدون خدمات خارجية
  private analyzeDrawingsHeuristics(project: Project): { critical: number; major: number; minor: number; notes: string[]; missingEssentials: string[] } {
    let critical = 0;
    let major = 0;
    let minor = 0;
    const notes: string[] = [];
    const missingEssentials: string[] = [];

    const drawings = project.drawings || [];
    if (drawings.length === 0) {
      critical++;
      missingEssentials.push('عدم وجود أية رسومات');
      notes.push('لا توجد رسومات مرفوعة للمشروع');
      return { critical, major, minor, notes, missingEssentials };
    }

    const nameTokens = (s: string) => s.toLowerCase().replace(/[_\-.]+/g, ' ').split(/\s+/);
    let hasArchitectural = false;
    let hasFirePlan = false;
    let hasExitsLayout = false;
    let hasSprinklers = false;
    let hasHydrants = false;

    let vectorCount = 0;
    let tooSmallFiles = 0;

    drawings.forEach(d => {
      const tokens = nameTokens(d.fileName || '');
      if (tokens.some(t => ['arch', 'architect', 'معماري', 'architectural'].includes(t))) hasArchitectural = true;
      if (tokens.some(t => ['fire', 'حريق', 'حماية', 'firefighting'].includes(t))) hasFirePlan = true;
      if (tokens.some(t => ['exit', 'exits', 'اخلاء', 'مخارج', 'evac'].includes(t))) hasExitsLayout = true;
      if (tokens.some(t => ['sprinkler', 'sprinklers', 'رشاش', 'رشاشات'].includes(t))) hasSprinklers = true;
      if (tokens.some(t => ['hydrant', 'hydrants', 'صنابير', 'hose', 'hose-reel'].includes(t))) hasHydrants = true;

      const ft = (d.fileType || '').toLowerCase();
      const isVector = ft.includes('pdf') || ft.includes('dwg');
      if (isVector) vectorCount++;
      if (d.fileSize && d.fileSize < 50 * 1024) {
        tooSmallFiles++;
      }
    });

    if (vectorCount === 0) { critical++; missingEssentials.push('ملفات PDF/DWG'); notes.push('لا يوجد ملف رسومات هندسية بصيغة PDF/DWG'); }
    if (!hasArchitectural) { major++; missingEssentials.push('المخطط المعماري'); notes.push('لا يوجد مخطط معماري أساسي'); }
    if (!hasFirePlan) { critical++; missingEssentials.push('مخطط أنظمة الحريق'); notes.push('لا يوجد مخطط أنظمة الحماية من الحريق'); }
    if (!hasExitsLayout) { major++; notes.push('لا يوجد مخطط مسارات الإخلاء ومخارج الطوارئ'); }
    if (!hasSprinklers && (project.area || 0) >= 1000 && ((project.buildingType || '').includes('تجاري') || (project.buildingType || '').includes('صناعي'))) {
      major++; notes.push('ينبغي إرفاق مخطط شبكة الرشاشات للمساحات الكبيرة التجارية/الصناعية');
    }
    if (!hasHydrants && ((project.buildingType || '').includes('تجاري') || (project.buildingType || '').includes('صناعي'))) {
      minor++; notes.push('يفضل مخطط صنابير/خراطيم الحريق (hose reel/hydrants)');
    }
    if (tooSmallFiles > 0) { major++; notes.push('بعض الملفات صغيرة جداً وقد لا تحتوي على تفاصيل كافية'); }

    return { critical, major, minor, notes, missingEssentials };
  }
  private rules: FireCodeRule[] = [
    // الفصل الأول: التعريفات والمصطلحات
    {
      id: 'rule-001',
      category: 'التعريفات والمصطلحات',
      subCategory: 'التعريفات الأساسية',
      ruleNumber: '1.1.1',
      title: 'تعريف المبنى',
      description: 'المبنى هو أي منشأة ثابتة أو شبه ثابتة مبنية من مواد البناء المختلفة',
      requirements: [
        'يجب أن يكون المبنى ثابتاً أو شبه ثابت',
        'يجب أن يكون مبنياً من مواد البناء المعتمدة',
        'يجب أن يكون له غرض محدد'
      ],
      violations: [
        'عدم وضوح الغرض من المبنى',
        'استخدام مواد بناء غير معتمدة',
        'عدم استقرار المبنى'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المناطق']
    },

    // الفصل الثاني: التصنيف حسب الاستخدام
    {
      id: 'rule-002',
      category: 'التصنيف حسب الاستخدام',
      subCategory: 'المباني السكنية',
      ruleNumber: '2.1.1',
      title: 'المباني السكنية',
      description: 'المباني المخصصة للسكن والإقامة',
      requirements: [
        'يجب أن تكون مخصصة للسكن فقط',
        'يجب أن تحتوي على مرافق صحية',
        'يجب أن تكون آمنة للسكن'
      ],
      violations: [
        'استخدام المبنى لأغراض غير سكنية',
        'عدم وجود مرافق صحية كافية',
        'عدم توفر شروط الأمان للسكن'
      ],
      severity: 'critical',
      buildingType: ['سكني'],
      applicableAreas: ['جميع المناطق السكنية']
    },

    {
      id: 'rule-003',
      category: 'التصنيف حسب الاستخدام',
      subCategory: 'المباني التجارية',
      ruleNumber: '2.2.1',
      title: 'المباني التجارية',
      description: 'المباني المخصصة للأنشطة التجارية والخدمية',
      requirements: [
        'يجب أن تكون مخصصة للأنشطة التجارية',
        'يجب أن تحتوي على مخارج طارئة كافية',
        'يجب أن تكون آمنة للجمهور'
      ],
      violations: [
        'عدم وجود مخارج طارئة كافية',
        'عدم توفر شروط الأمان للجمهور',
        'عدم الالتزام بالاشتراطات التجارية'
      ],
      severity: 'critical',
      buildingType: ['تجاري'],
      applicableAreas: ['المناطق التجارية']
    },

    // الفصل الثالث: المساحات والمسافات
    {
      id: 'rule-004',
      category: 'المساحات والمسافات',
      subCategory: 'المسافات بين المباني',
      ruleNumber: '3.1.1',
      title: 'المسافة الدنيا بين المباني',
      description: 'يجب أن تكون المسافة الدنيا بين المباني 6 أمتار على الأقل',
      requirements: [
        'المسافة الدنيا 6 أمتار',
        'قياس المسافة من الحواف الخارجية للمباني',
        'مراعاة ارتفاع المباني في حساب المسافة'
      ],
      violations: [
        'المسافة أقل من 6 أمتار',
        'عدم مراعاة ارتفاع المباني',
        'تداخل في المساحات المفتوحة'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['الواجهات الخارجية', 'المساحات المفتوحة']
    },

    {
      id: 'rule-005',
      category: 'المساحات والمسافات',
      subCategory: 'المساحات المفتوحة',
      ruleNumber: '3.2.1',
      title: 'المساحات المفتوحة للطوارئ',
      description: 'يجب توفير مساحات مفتوحة كافية للطوارئ والإنقاذ',
      requirements: [
        'مساحة مفتوحة لا تقل عن 20% من مساحة المبنى',
        'وصول مباشر من الشارع',
        'عدم وجود عوائق في المسار'
      ],
      violations: [
        'عدم وجود مساحات مفتوحة كافية',
        'وجود عوائق في مسار الطوارئ',
        'عدم وجود وصول مباشر من الشارع'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['المساحات الخارجية', 'مواقف السيارات']
    },

    {
      id: 'rule-006',
      category: 'المساحات والمسافات',
      subCategory: 'المساحات المفتوحة',
      ruleNumber: '3.2.2',
      title: 'المساحات المفتوحة للمباني الصناعية',
      description: 'يجب توفير مساحات مفتوحة لا تقل عن 30% للمباني الصناعية',
      requirements: [
        'مساحة مفتوحة لا تقل عن 30% من مساحة المبنى',
        'وصول مباشر للمعدات الثقيلة',
        'عدم وجود عوائق في المسار'
      ],
      violations: [
        'عدم وجود مساحات مفتوحة كافية',
        'وجود عوائق في مسار المعدات',
        'عدم وجود وصول مباشر للمعدات'
      ],
      severity: 'critical',
      buildingType: ['صناعي'],
      applicableAreas: ['المناطق الصناعية']
    },

    // الفصل الرابع: المخارج والمداخل
    {
      id: 'rule-007',
      category: 'المخارج والمداخل',
      subCategory: 'المخارج الرئيسية',
      ruleNumber: '4.1.1',
      title: 'عدد المخارج المطلوبة',
      description: 'يجب توفير عدد كافي من المخارج حسب عدد السكان',
      requirements: [
        'مخرج واحد لكل 50 شخص',
        'عرض المخرج لا يقل عن 1.2 متر',
        'ارتفاع المخرج لا يقل عن 2.1 متر'
      ],
      violations: [
        'عدم وجود عدد كافي من المخارج',
        'عرض المخرج أقل من المطلوب',
        'ارتفاع المخرج أقل من المطلوب'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['المخارج الرئيسية', 'المخارج الطارئة']
    },

    {
      id: 'rule-008',
      category: 'المخارج والمداخل',
      subCategory: 'المخارج الطارئة',
      ruleNumber: '4.1.2',
      title: 'المخارج الطارئة',
      description: 'يجب توفير مخارج طارئة في جميع الطوابق',
      requirements: [
        'مخرج طارئ في كل طابق',
        'إشارات واضحة للمخارج',
        'إضاءة طارئة للمخارج'
      ],
      violations: [
        'عدم وجود مخارج طارئة في بعض الطوابق',
        'عدم وضوح إشارات المخارج',
        'عدم وجود إضاءة طارئة'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع الطوابق', 'المخارج الطارئة']
    },

    {
      id: 'rule-009',
      category: 'المخارج والمداخل',
      subCategory: 'المخارج الطارئة',
      ruleNumber: '4.1.3',
      title: 'المخارج الطارئة للمباني التعليمية',
      description: 'يجب توفير مخارج طارئة إضافية للمباني التعليمية',
      requirements: [
        'مخرج طارئ لكل 25 طالب',
        'عرض المخرج لا يقل عن 1.5 متر',
        'إشارات واضحة باللغة العربية'
      ],
      violations: [
        'عدم وجود مخارج طارئة كافية',
        'عرض المخرج أقل من المطلوب',
        'عدم وضوح الإشارات'
      ],
      severity: 'critical',
      buildingType: ['تعليمي'],
      applicableAreas: ['المدارس', 'الجامعات', 'المعاهد']
    },

    // الفصل الخامس: أنظمة الإنذار
    {
      id: 'rule-010',
      category: 'أنظمة الإنذار',
      subCategory: 'أجهزة كشف الدخان',
      ruleNumber: '5.1.1',
      title: 'أجهزة كشف الدخان',
      description: 'يجب تثبيت أجهزة كشف الدخان في جميع المناطق',
      requirements: [
        'جهاز كشف دخان لكل 100 متر مربع',
        'تثبيت في السقف',
        'ربط بنظام إنذار مركزي'
      ],
      violations: [
        'عدم وجود أجهزة كشف دخان كافية',
        'تثبيت غير صحيح',
        'عدم الربط بنظام الإنذار'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المناطق الداخلية']
    },

    {
      id: 'rule-011',
      category: 'أنظمة الإنذار',
      subCategory: 'أجهزة كشف الحرارة',
      ruleNumber: '5.1.2',
      title: 'أجهزة كشف الحرارة',
      description: 'يجب تثبيت أجهزة كشف الحرارة في المناطق عالية الخطورة',
      requirements: [
        'جهاز كشف حرارة في المطابخ',
        'جهاز كشف حرارة في غرف الكهرباء',
        'جهاز كشف حرارة في المخازن'
      ],
      violations: [
        'عدم وجود أجهزة كشف حرارة في المطابخ',
        'عدم وجود أجهزة كشف حرارة في غرف الكهرباء',
        'عدم وجود أجهزة كشف حرارة في المخازن'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['المطابخ', 'غرف الكهرباء', 'المخازن']
    },

    {
      id: 'rule-012',
      category: 'أنظمة الإنذار',
      subCategory: 'أنظمة الإنذار الصوتية',
      ruleNumber: '5.1.3',
      title: 'أنظمة الإنذار الصوتية',
      description: 'يجب توفير أنظمة إنذار صوتية في جميع المباني',
      requirements: [
        'جهاز إنذار صوتي في كل طابق',
        'صوت الإنذار واضح ومفهوم',
        'ربط بنظام الإنذار المركزي'
      ],
      violations: [
        'عدم وجود أنظمة إنذار صوتية',
        'صوت الإنذار غير واضح',
        'عدم الربط بالنظام المركزي'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع الطوابق']
    },

    // الفصل السادس: أنظمة الإطفاء
    {
      id: 'rule-013',
      category: 'أنظمة الإطفاء',
      subCategory: 'طفايات الحريق',
      ruleNumber: '6.1.1',
      title: 'طفايات الحريق',
      description: 'يجب توفير طفايات حريق كافية في جميع المناطق',
      requirements: [
        'طفاية حريق لكل 200 متر مربع',
        'تثبيت في أماكن واضحة',
        'صيانة دورية'
      ],
      violations: [
        'عدم وجود طفايات حريق كافية',
        'تثبيت في أماكن غير واضحة',
        'عدم الصيانة الدورية'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المناطق الداخلية']
    },

    {
      id: 'rule-014',
      category: 'أنظمة الإطفاء',
      subCategory: 'أنظمة الإطفاء التلقائي',
      ruleNumber: '6.1.2',
      title: 'أنظمة الإطفاء التلقائي',
      description: 'يجب تثبيت أنظمة إطفاء تلقائي في المباني الكبيرة',
      requirements: [
        'نظام إطفاء تلقائي للمباني أكثر من 1000 متر مربع',
        'ربط بنظام الإنذار',
        'صيانة دورية'
      ],
      violations: [
        'عدم وجود نظام إطفاء تلقائي',
        'عدم الربط بنظام الإنذار',
        'عدم الصيانة الدورية'
      ],
      severity: 'critical',
      buildingType: ['تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['المباني الكبيرة']
    },

    {
      id: 'rule-015',
      category: 'أنظمة الإطفاء',
      subCategory: 'أنظمة الإطفاء التلقائي',
      ruleNumber: '6.1.3',
      title: 'أنظمة الإطفاء التلقائي للمباني الصناعية',
      description: 'يجب تثبيت أنظمة إطفاء تلقائي في جميع المباني الصناعية',
      requirements: [
        'نظام إطفاء تلقائي في جميع المباني الصناعية',
        'ربط بنظام الإنذار المركزي',
        'صيانة دورية شهرية'
      ],
      violations: [
        'عدم وجود نظام إطفاء تلقائي',
        'عدم الربط بالنظام المركزي',
        'عدم الصيانة الدورية'
      ],
      severity: 'critical',
      buildingType: ['صناعي'],
      applicableAreas: ['المناطق الصناعية']
    },

    // الفصل السابع: المواد المقاومة للحريق
    {
      id: 'rule-016',
      category: 'المواد المقاومة للحريق',
      subCategory: 'مواد البناء',
      ruleNumber: '7.1.1',
      title: 'مواد البناء المقاومة للحريق',
      description: 'يجب استخدام مواد بناء مقاومة للحريق',
      requirements: [
        'استخدام مواد مقاومة للحريق',
        'شهادة مقاومة الحريق',
        'التزام بالمواصفات المطلوبة'
      ],
      violations: [
        'استخدام مواد غير مقاومة للحريق',
        'عدم وجود شهادة مقاومة الحريق',
        'عدم الالتزام بالمواصفات'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المناطق']
    },

    {
      id: 'rule-017',
      category: 'المواد المقاومة للحريق',
      subCategory: 'مواد العزل',
      ruleNumber: '7.1.2',
      title: 'مواد العزل الحراري',
      description: 'يجب استخدام مواد عزل حراري مقاومة للحريق',
      requirements: [
        'استخدام مواد عزل مقاومة للحريق',
        'شهادة مقاومة الحريق',
        'التثبيت الصحيح'
      ],
      violations: [
        'استخدام مواد عزل غير مقاومة للحريق',
        'عدم وجود شهادة مقاومة الحريق',
        'تثبيت غير صحيح'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['الأسقف', 'الجدران', 'الأرضيات']
    },

    // الفصل الثامن: التهوية والتدخين
    {
      id: 'rule-018',
      category: 'التهوية والتدخين',
      subCategory: 'أنظمة التهوية',
      ruleNumber: '8.1.1',
      title: 'أنظمة التهوية للطوارئ',
      description: 'يجب توفير أنظمة تهوية للطوارئ في جميع المباني',
      requirements: [
        'نظام تهوية طارئ في كل طابق',
        'ربط بنظام الإنذار',
        'صيانة دورية'
      ],
      violations: [
        'عدم وجود نظام تهوية طارئ',
        'عدم الربط بنظام الإنذار',
        'عدم الصيانة الدورية'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع الطوابق']
    },

    {
      id: 'rule-019',
      category: 'التهوية والتدخين',
      subCategory: 'منع التدخين',
      ruleNumber: '8.1.2',
      title: 'منع التدخين في المناطق الخطرة',
      description: 'يجب منع التدخين في المناطق الخطرة',
      requirements: [
        'منع التدخين في المناطق الخطرة',
        'إشارات واضحة لمنع التدخين',
        'مراقبة مستمرة'
      ],
      violations: [
        'عدم منع التدخين في المناطق الخطرة',
        'عدم وجود إشارات واضحة',
        'عدم المراقبة المستمرة'
      ],
      severity: 'major',
      buildingType: ['صناعي', 'تجاري', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['المناطق الخطرة']
    },

    // الفصل التاسع: الصيانة والتفتيش
    {
      id: 'rule-020',
      category: 'الصيانة والتفتيش',
      subCategory: 'الصيانة الدورية',
      ruleNumber: '9.1.1',
      title: 'الصيانة الدورية لأنظمة الحماية',
      description: 'يجب إجراء صيانة دورية لجميع أنظمة الحماية من الحريق',
      requirements: [
        'صيانة دورية شهرية',
        'تسجيل الصيانة',
        'إصلاح الأعطال فوراً'
      ],
      violations: [
        'عدم إجراء الصيانة الدورية',
        'عدم تسجيل الصيانة',
        'عدم إصلاح الأعطال'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع أنظمة الحماية']
    },

    {
      id: 'rule-021',
      category: 'الصيانة والتفتيش',
      subCategory: 'التفتيش الدوري',
      ruleNumber: '9.1.2',
      title: 'التفتيش الدوري للمباني',
      description: 'يجب إجراء تفتيش دوري للمباني للتأكد من الالتزام بالاشتراطات',
      requirements: [
        'تفتيش دوري سنوي',
        'تسجيل نتائج التفتيش',
        'إصلاح المخالفات فوراً'
      ],
      violations: [
        'عدم إجراء التفتيش الدوري',
        'عدم تسجيل نتائج التفتيش',
        'عدم إصلاح المخالفات'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المباني']
    },

    // الفصل العاشر: التدريب والتوعية
    {
      id: 'rule-022',
      category: 'التدريب والتوعية',
      subCategory: 'التدريب على السلامة',
      ruleNumber: '10.1.1',
      title: 'التدريب على السلامة من الحريق',
      description: 'يجب تدريب جميع العاملين على السلامة من الحريق',
      requirements: [
        'تدريب دوري للعاملين',
        'شهادات التدريب',
        'تحديث المعرفة'
      ],
      violations: [
        'عدم تدريب العاملين',
        'عدم وجود شهادات التدريب',
        'عدم تحديث المعرفة'
      ],
      severity: 'major',
      buildingType: ['تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المناطق']
    },

    {
      id: 'rule-023',
      category: 'التدريب والتوعية',
      subCategory: 'التوعية العامة',
      ruleNumber: '10.1.2',
      title: 'التوعية العامة بالسلامة من الحريق',
      description: 'يجب توعية الجمهور بالسلامة من الحريق',
      requirements: [
        'برامج توعية دورية',
        'إرشادات واضحة',
        'تدريب على الإخلاء'
      ],
      violations: [
        'عدم وجود برامج توعية',
        'عدم وضوح الإرشادات',
        'عدم تدريب على الإخلاء'
      ],
      severity: 'major',
      buildingType: ['تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المناطق']
    },

    // الفصل الحادي عشر: المباني الخاصة
    {
      id: 'rule-024',
      category: 'المباني الخاصة',
      subCategory: 'المستشفيات',
      ruleNumber: '11.1.1',
      title: 'اشتراطات الحماية من الحريق للمستشفيات',
      description: 'يجب تطبيق اشتراطات خاصة للحماية من الحريق في المستشفيات',
      requirements: [
        'أنظمة حماية متقدمة',
        'مخارج طارئة إضافية',
        'أنظمة إطفاء متخصصة'
      ],
      violations: [
        'عدم وجود أنظمة حماية متقدمة',
        'عدم وجود مخارج طارئة إضافية',
        'عدم وجود أنظمة إطفاء متخصصة'
      ],
      severity: 'critical',
      buildingType: ['صحي'],
      applicableAreas: ['المستشفيات', 'العيادات', 'المراكز الطبية']
    },

    {
      id: 'rule-025',
      category: 'المباني الخاصة',
      subCategory: 'المدارس',
      ruleNumber: '11.1.2',
      title: 'اشتراطات الحماية من الحريق للمدارس',
      description: 'يجب تطبيق اشتراطات خاصة للحماية من الحريق في المدارس',
      requirements: [
        'مخارج طارئة إضافية',
        'أنظمة إنذار متقدمة',
        'تدريب الطلاب على الإخلاء'
      ],
      violations: [
        'عدم وجود مخارج طارئة إضافية',
        'عدم وجود أنظمة إنذار متقدمة',
        'عدم تدريب الطلاب على الإخلاء'
      ],
      severity: 'critical',
      buildingType: ['تعليمي'],
      applicableAreas: ['المدارس', 'الجامعات', 'المعاهد']
    },

    {
      id: 'rule-026',
      category: 'المباني الخاصة',
      subCategory: 'المباني الصناعية',
      ruleNumber: '11.1.3',
      title: 'اشتراطات الحماية من الحريق للمباني الصناعية',
      description: 'يجب تطبيق اشتراطات خاصة للحماية من الحريق في المباني الصناعية',
      requirements: [
        'أنظمة حماية متقدمة',
        'مواد مقاومة للحريق',
        'أنظمة إطفاء متخصصة'
      ],
      violations: [
        'عدم وجود أنظمة حماية متقدمة',
        'عدم استخدام مواد مقاومة للحريق',
        'عدم وجود أنظمة إطفاء متخصصة'
      ],
      severity: 'critical',
      buildingType: ['صناعي'],
      applicableAreas: ['المصانع', 'المخازن', 'الورش']
    },

    // الفصل الثاني عشر: الإجراءات الطارئة
    {
      id: 'rule-027',
      category: 'الإجراءات الطارئة',
      subCategory: 'خطط الإخلاء',
      ruleNumber: '12.1.1',
      title: 'خطط الإخلاء الطارئ',
      description: 'يجب وضع خطط إخلاء طارئ لجميع المباني',
      requirements: [
        'خطة إخلاء واضحة',
        'تدريب على الإخلاء',
        'تحديث الخطة دورياً'
      ],
      violations: [
        'عدم وجود خطة إخلاء',
        'عدم التدريب على الإخلاء',
        'عدم تحديث الخطة'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المباني']
    },

    {
      id: 'rule-028',
      category: 'الإجراءات الطارئة',
      subCategory: 'التنسيق مع الحماية المدنية',
      ruleNumber: '12.1.2',
      title: 'التنسيق مع الحماية المدنية',
      description: 'يجب التنسيق مع الحماية المدنية في حالة الطوارئ',
      requirements: [
        'رقم هاتف الحماية المدنية',
        'تنسيق مع الجهات المختصة',
        'إبلاغ فوري في حالة الطوارئ'
      ],
      violations: [
        'عدم وجود رقم هاتف الحماية المدنية',
        'عدم التنسيق مع الجهات المختصة',
        'عدم الإبلاغ الفوري'
      ],
      severity: 'critical',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المباني']
    },

    // الفصل الثالث عشر: العقوبات والغرامات
    {
      id: 'rule-029',
      category: 'العقوبات والغرامات',
      subCategory: 'المخالفات',
      ruleNumber: '13.1.1',
      title: 'غرامات المخالفات',
      description: 'يتم فرض غرامات على المخالفات حسب نوعها وخطورتها',
      requirements: [
        'غرامة مالية للمخالفات البسيطة',
        'غرامة مالية للمخالفات الكبيرة',
        'إغلاق المبنى للمخالفات الحرجة'
      ],
      violations: [
        'عدم دفع الغرامات',
        'تكرار المخالفات',
        'عدم إصلاح المخالفات'
      ],
      severity: 'minor',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المباني']
    },

    {
      id: 'rule-030',
      category: 'العقوبات والغرامات',
      subCategory: 'الإجراءات التصحيحية',
      ruleNumber: '13.1.2',
      title: 'الإجراءات التصحيحية',
      description: 'يجب اتخاذ إجراءات تصحيحية فورية للمخالفات',
      requirements: [
        'إصلاح المخالفات فوراً',
        'تجنب تكرار المخالفات',
        'الالتزام بالاشتراطات'
      ],
      violations: [
        'عدم إصلاح المخالفات',
        'تكرار المخالفات',
        'عدم الالتزام بالاشتراطات'
      ],
      severity: 'major',
      buildingType: ['سكني', 'تجاري', 'صناعي', 'تعليمي', 'صحي', 'إداري', 'ترفيهي'],
      applicableAreas: ['جميع المباني']
    }
  ];

  private projects: Project[] = [];
  private reviewReports: ReviewReport[] = [];
  private licenses: License[] = [];
  private notifications: NotificationItem[] = [];

  // Seed from localStorage if exists (simulate constructor)
  private _init = (() => {
    try {
      const raw = localStorage.getItem('firecode_projects');
      if (raw) {
        this.projects = JSON.parse(raw) as Project[];
      }
      const n = localStorage.getItem('firecode_notifications');
      if (n) {
        this.notifications = JSON.parse(n) as NotificationItem[];
      }
    } catch {
      // ignore
    }
  })();

  // الحصول على جميع القواعد
  getAllRules(): FireCodeRule[] {
    return [...this.rules];
  }

  // الحصول على القواعد حسب الفئة
  getRulesByCategory(category: string): FireCodeRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  // الحصول على القواعد حسب نوع المبنى
  getRulesByBuildingType(buildingType: string): FireCodeRule[] {
    return this.rules.filter(rule => rule.buildingType.includes(buildingType));
  }

  // تقييم امتثال مشروع بناءً على الرسومات فقط
  async evaluateProjectCompliance(projectId: string): Promise<{ score: number; overallStatus: 'approved' | 'rejected' | 'needs_revision'; reasons: string[] } | null> {
    const project = this.getProjectById(projectId);
    if (!project) return null;

    const reasons: string[] = [];
    let deductions = 0;

    // التحقق من وجود الرسومات (الشرط الأساسي الوحيد)
    const drawings = project.drawings || [];
    if (drawings.length === 0) {
      reasons.push('الرسومات الهندسية مطلوبة للمراجعة');
      const overallStatus: 'approved' | 'rejected' | 'needs_revision' = 'rejected';
      project.status = overallStatus;
      project.reviewReport = {
        id: `auto-${Date.now()}`,
        projectId: project.id,
        overallStatus,
        complianceScore: 0,
        criticalIssues: 1,
        majorIssues: 0,
        minorIssues: 0,
        recommendations: reasons,
        generatedDate: new Date().toISOString(),
        reviewerId: 'auto'
      } as ReviewReport;
      project.reviewDate = new Date().toISOString();
      try { localStorage.setItem('firecode_projects', JSON.stringify(this.projects)); } catch {}
      return { score: 0, overallStatus, reasons };
    }

    // التحقق من جودة الرسومات
    const types = drawings.map(d => (d.fileType || '').toLowerCase());
    const hasEngineeringFiles = types.some(t => 
      t.includes('pdf') || t.includes('dwg') || t.includes('rvt') || t.includes('rfa') || 
      t.includes('dgn') || t.includes('dxf') || t.includes('dwt') || t.includes('step') || 
      t.includes('iges') || t.includes('sat')
    );
    const hasImages = types.some(t => 
      t.includes('jpg') || t.includes('jpeg') || t.includes('png') || t.includes('bmp') || 
      t.includes('tiff') || t.includes('tif') || t.includes('gif')
    );
    const has3DFiles = types.some(t => 
      t.includes('obj') || t.includes('3ds') || t.includes('fbx') || t.includes('skp')
    );
    
    if (hasEngineeringFiles) {
      reasons.push('تم رفع ملفات هندسية عالية الجودة');
    } else if (has3DFiles) {
      reasons.push('تم رفع ملفات ثلاثية الأبعاد');
      deductions += 5; // خصم طفيف للملفات ثلاثية الأبعاد
    } else if (hasImages) {
      deductions += 10;
      reasons.push('يُنصح برفع ملفات هندسية (PDF, DWG, RVT) للحصول على دقة أفضل');
    } else {
      deductions += 15;
      reasons.push('يُنصح برفع ملفات رسومات هندسية إضافية (PDF/DWG/RVT) تشمل: المخطط المعماري، مخطط أنظمة الحريق، مخطط مسارات الإخلاء، ومخططات الرشاشات/الهوزريل؛ لتحسين جودة المراجعة');
    }

    // تحليل الرسومات وفقاً للكود المصري للحريق
    let analysisScore = 85; // درجة افتراضية عالية للرسومات
    let criticalIssues = 0;
    let majorIssues = 0;
    let minorIssues = 0;
    
    try {
      // استخدام المحلل المتخصص للكود المصري
      const egyptianAnalysis = await egyptianFireCodeAnalyzer.analyzeDrawingsForEgyptianCode(project);
      
      analysisScore = egyptianAnalysis.complianceScore;
      criticalIssues = egyptianAnalysis.criticalIssues;
      majorIssues = egyptianAnalysis.majorIssues;
      minorIssues = egyptianAnalysis.minorIssues;
      
      // إضافة النتائج إلى الأسباب
      if (egyptianAnalysis.notes && egyptianAnalysis.notes.length) {
        reasons.push(...egyptianAnalysis.notes);
      }
      
      // إضافة التوصيات
      if (egyptianAnalysis.recommendations && egyptianAnalysis.recommendations.length) {
        reasons.push(...egyptianAnalysis.recommendations);
      }
      
      // إضافة تفاصيل المخالفات
      if (egyptianAnalysis.violations && egyptianAnalysis.violations.length > 0) {
        const violationsBySeverity = {
          critical: egyptianAnalysis.violations.filter(v => v.severity === 'critical'),
          major: egyptianAnalysis.violations.filter(v => v.severity === 'major'),
          minor: egyptianAnalysis.violations.filter(v => v.severity === 'minor')
        };
        
        if (violationsBySeverity.critical.length > 0) {
          reasons.push(`مخالفات حرجة للكود المصري: ${violationsBySeverity.critical.map(v => v.ruleTitle).join(', ')}`);
        }
        
        if (violationsBySeverity.major.length > 0) {
          reasons.push(`مخالفات كبيرة للكود المصري: ${violationsBySeverity.major.map(v => v.ruleTitle).join(', ')}`);
        }
        
        if (violationsBySeverity.minor.length > 0) {
          reasons.push(`مخالفات صغيرة للكود المصري: ${violationsBySeverity.minor.map(v => v.ruleTitle).join(', ')}`);
        }
      }
      
      // حساب الخصومات بناءً على المخالفات
      deductions += criticalIssues * 25 + majorIssues * 10 + minorIssues * 3;
      
    } catch (error) {
      // في حالة فشل التحليل، نعطي درجة متوسطة
      analysisScore = 75;
      reasons.push('تعذر تحليل الرسومات وفقاً للكود المصري، تم اعتماد التحقق الأساسي');
      console.warn('خطأ في تحليل الرسومات للكود المصري:', error);
    }

    // حساب النتيجة النهائية
    const finalScore = Math.max(0, analysisScore - deductions);
    
    let overallStatus: 'approved' | 'rejected' | 'needs_revision';
    if (criticalIssues > 2) {
      overallStatus = 'rejected';
      reasons.push(`المشروع يحتاج مراجعة شاملة بسبب ${criticalIssues} مخالفة حرجة للكود المصري`);
    } else if (finalScore >= 75) {
      overallStatus = 'approved';
      reasons.push('الرسومات الهندسية مطابقة للكود المصري للحريق');
    } else if (finalScore >= 60) {
      overallStatus = 'needs_revision';
      reasons.push('تحتاج الرسومات إلى مراجعة إضافية لضمان الامتثال الكامل للكود المصري');
    } else {
      overallStatus = 'needs_revision';
      reasons.push('تحتاج الرسومات إلى تحسينات لضمان الامتثال للكود المصري');
    }

    project.status = overallStatus;
    project.reviewReport = {
      id: `auto-${Date.now()}`,
      projectId: project.id,
      overallStatus,
      complianceScore: finalScore,
      criticalIssues: criticalIssues,
      majorIssues: majorIssues,
      minorIssues: minorIssues,
      recommendations: reasons,
      generatedDate: new Date().toISOString(),
      reviewerId: 'auto'
    } as ReviewReport;
    project.reviewDate = new Date().toISOString();
    
    // إصدار ترخيص تلقائي عند الموافقة
    if (overallStatus === 'approved') {
      try { this.createLicense(project.id); } catch {}
    }

    try { localStorage.setItem('firecode_projects', JSON.stringify(this.projects)); } catch {}
    try {
      this.addNotification({
        userId: project.applicantId,
        type: overallStatus === 'approved' ? 'success' : overallStatus === 'rejected' ? 'error' : 'warning',
        title: 'نتيجة مراجعة المشروع',
        body: `تم ${overallStatus === 'approved' ? 'الموافقة على' : overallStatus === 'rejected' ? 'رفض' : 'طلب مراجعة'} مشروعك بناءً على تحليل الرسومات وفقاً للكود المصري (${finalScore}%)`,
        projectId: project.id
      });
    } catch {}
    
    return { score: finalScore, overallStatus, reasons };
  }

  // إضافة مشروع جديد
  addProject(project: Omit<Project, 'id' | 'submissionDate' | 'status'>): Project {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      submissionDate: new Date().toISOString(),
      status: 'submitted',
      drawings: []
    };
    
    this.projects.push(newProject);
    try { localStorage.setItem('firecode_projects', JSON.stringify(this.projects)); } catch {}
    try {
      this.addNotification({
        userId: newProject.applicantId,
        type: 'success',
        title: 'تم استلام مشروعك',
        body: `تم استلام مشروع "${newProject.projectName}" وجاري مراجعته.`,
        projectId: newProject.id
      });
    } catch {}
    return newProject;
  }

  // تحديث مشروع
  updateProject(projectId: string, updates: Partial<Project>): Project | null {
    const project = this.getProjectById(projectId);
    if (!project) return null;
    Object.assign(project, updates);
    try { localStorage.setItem('firecode_projects', JSON.stringify(this.projects)); } catch {}
    return project;
  }

  // الحصول على مشروع بالمعرف
  getProjectById(id: string): Project | undefined {
    return this.projects.find(project => project.id === id);
  }

  // الحصول على مشاريع مقدم الطلب
  getProjectsByApplicant(applicantId: string): Project[] {
    return this.projects.filter(project => project.applicantId === applicantId);
  }

  // إضافة رسم جديد
  addDrawing(projectId: string, drawing: Omit<BuildingDrawing, 'id' | 'uploadDate' | 'status' | 'reviewResults'>): BuildingDrawing {
    const newDrawing: BuildingDrawing = {
      ...drawing,
      id: `drawing-${Date.now()}`,
      uploadDate: new Date().toISOString(),
      status: 'pending',
      reviewResults: []
    };
    
    const project = this.getProjectById(projectId);
    if (project) {
      project.drawings.push(newDrawing);
      try { localStorage.setItem('firecode_projects', JSON.stringify(this.projects)); } catch {}
    }
    
    return newDrawing;
  }

  // مراجعة الرسم
  reviewDrawing(drawingId: string, reviewResults: ReviewResult[]): BuildingDrawing | null {
    for (const project of this.projects) {
      const drawing = project.drawings.find(d => d.id === drawingId);
      if (drawing) {
        drawing.reviewResults = reviewResults;
        drawing.status = this.determineDrawingStatus(reviewResults);
        return drawing;
      }
    }
    return null;
  }

  // تحديد حالة الرسم حسب نتائج المراجعة
  private determineDrawingStatus(reviewResults: ReviewResult[]): 'approved' | 'rejected' | 'needs_revision' {
    const criticalIssues = reviewResults.filter(r => r.severity === 'critical' && r.status === 'non_compliant');
    const majorIssues = reviewResults.filter(r => r.severity === 'major' && r.status === 'non_compliant');
    
    if (criticalIssues.length > 0) {
      return 'rejected';
    } else if (majorIssues.length > 0) {
      return 'needs_revision';
    } else {
      return 'approved';
    }
  }

  // إنشاء تقرير المراجعة
  createReviewReport(projectId: string, reviewerId: string): ReviewReport {
    const project = this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const allReviewResults = project.drawings.flatMap(d => d.reviewResults);
    const criticalIssues = allReviewResults.filter(r => r.severity === 'critical' && r.status === 'non_compliant').length;
    const majorIssues = allReviewResults.filter(r => r.severity === 'major' && r.status === 'non_compliant').length;
    const minorIssues = allReviewResults.filter(r => r.severity === 'minor' && r.status === 'non_compliant').length;
    
    const totalIssues = criticalIssues + majorIssues + minorIssues;
    const complianceScore = totalIssues === 0 ? 100 : Math.max(0, 100 - (criticalIssues * 20 + majorIssues * 10 + minorIssues * 5));
    
    let overallStatus: 'approved' | 'rejected' | 'needs_revision';
    if (criticalIssues > 0) {
      overallStatus = 'rejected';
    } else if (majorIssues > 0) {
      overallStatus = 'needs_revision';
    } else {
      overallStatus = 'approved';
    }

    const report: ReviewReport = {
      id: `report-${Date.now()}`,
      projectId,
      overallStatus,
      complianceScore,
      criticalIssues,
      majorIssues,
      minorIssues,
      recommendations: this.generateRecommendationsWithContext(allReviewResults, overallStatus, { criticalIssues, majorIssues, minorIssues }),
      generatedDate: new Date().toISOString(),
      reviewerId
    };

    this.reviewReports.push(report);
    project.reviewReport = report;
    project.status = overallStatus;
    project.reviewDate = new Date().toISOString();
    try { localStorage.setItem('firecode_projects', JSON.stringify(this.projects)); } catch {}
    try {
      this.addNotification({
        userId: project.applicantId,
        type: overallStatus === 'approved' ? 'success' : overallStatus === 'rejected' ? 'error' : 'warning',
        title: 'نتيجة مراجعة المشروع',
        body: `الحالة: ${overallStatus} - درجة الامتثال: ${complianceScore}%`,
        projectId
      });
    } catch {}

    return report;
  }

  // تحديث نص التوصيات للتقارير القائمة دون تغيير الحالة أو الإشعارات
  refreshReportRecommendations(projectId: string): void {
    const project = this.getProjectById(projectId);
    if (!project || !project.reviewReport) return;
    const allReviewResults = (project.drawings || []).flatMap(d => d.reviewResults || []);
    const counts = {
      criticalIssues: allReviewResults.filter(r => r.severity === 'critical' && r.status === 'non_compliant').length,
      majorIssues: allReviewResults.filter(r => r.severity === 'major' && r.status === 'non_compliant').length,
      minorIssues: allReviewResults.filter(r => r.severity === 'minor' && r.status === 'non_compliant').length,
    };
    const newRecs = this.generateRecommendationsWithContext(allReviewResults, project.reviewReport.overallStatus, counts);
    project.reviewReport.recommendations = newRecs;
    try { localStorage.setItem('firecode_projects', JSON.stringify(this.projects)); } catch {}
  }

  // تحديث توصيات جميع المشاريع التي لديها تقرير سابق
  refreshAllReportsRecommendations(): void {
    const ids = this.projects.filter(p => p.reviewReport).map(p => p.id);
    ids.forEach(id => this.refreshReportRecommendations(id));
  }

  // إنشاء التوصيات (منسقة ومُوحَّدة)
  private generateRecommendations(reviewResults: ReviewResult[]): string[] {
    const sanitize = (s: string) =>
      (s || '')
        .normalize('NFC')
        .replace(/[\u200B-\u200D\u2060]/g, '') // إزالة المحارف غير المرئية
        .replace(/\s+/g, ' ')
        .replace(/^[-–—\s]+|[-–—\s]+$/g, '')
        .trim();

    // ترتيب حسب الخطورة وإضافة ملخص
    const nonCompliant = reviewResults.filter(r => r.status === 'non_compliant');
    const count = {
      critical: nonCompliant.filter(r => r.severity === 'critical').length,
      major: nonCompliant.filter(r => r.severity === 'major').length,
      minor: nonCompliant.filter(r => r.severity === 'minor').length,
    };

    // في حالة عدم وجود مخالفات، إرجاع توصيات إيجابية قياسية
    if (nonCompliant.length === 0) {
      return [
        'لا توجد مخالفات للكود المصري في الرسومات المرفوعة',
        'تأكد من تحديث الرسومات وفقًا لأحدث نسخة من الكود المصري رقم 126 لسنة 2021'
      ];
    }

    const head: string[] = [];
    head.push(`ملخص المخالفات: حرجة ${count.critical}، كبيرة ${count.major}، صغيرة ${count.minor}`);

    // بناء توصيات من الحلول المقترحة أو توصيات عامة حسب الخطورة
    const genericBySeverity: Record<string, string> = {
      critical: 'يرجى معالجة المخالفات الحرجة فورًا وفقًا لاشتراطات الكود المصري',
      major: 'يرجى تنفيذ التعديلات المطلوبة لضمان المطابقة مع الكود المصري',
      minor: 'يفضل إجراء تحسينات طفيفة لتعزيز المطابقة'
    };

    const rank: Record<string, number> = { critical: 3, major: 2, minor: 1 } as any;
    const rawList: string[] = nonCompliant
      .slice()
      .sort((a, b) => (rank[b.severity] || 0) - (rank[a.severity] || 0))
      .map(r => {
        const fix = r.suggestedFix ? sanitize(r.suggestedFix) : '';
        const label = r.severity === 'critical' ? 'إجراء فوري (حرج)' : r.severity === 'major' ? 'إجراء مطلوب (كبير)' : 'تحسين (صغير)';
        return fix ? `${label}: ${fix}` : genericBySeverity[r.severity] || '';
      });

    // إزالة التكرارات وتنظيف النصوص الفارغة
    const unique: string[] = [...head];
    const seen = new Set<string>();
    for (const item of rawList) {
      const s = sanitize(item);
      if (!s) continue;
      if (seen.has(s)) continue;
      seen.add(s);
      unique.push(s);
    }

    return unique.slice(0, 10);
  }

  // إنشاء توصيات مع توضيح سبب الحالة وما يحتاج تعديل/رفض
  private generateRecommendationsWithContext(
    reviewResults: ReviewResult[],
    overallStatus: 'approved' | 'rejected' | 'needs_revision',
    counts: { criticalIssues: number; majorIssues: number; minorIssues: number }
  ): string[] {
    const base = this.generateRecommendations(reviewResults);
    const header: string[] = [];
    const { criticalIssues, majorIssues, minorIssues } = counts;

    if (overallStatus === 'rejected') {
      header.push(`سبب الرفض: وجود ${criticalIssues} مخالفة حرجة تتطلب معالجة فورية وفق الكود المصري`);
    } else if (overallStatus === 'needs_revision') {
      header.push(`سبب طلب التعديل: وجود ${majorIssues} مخالفة كبيرة و${minorIssues} مخالفة صغيرة تحتاج تحسين`);
    } else {
      header.push('سبب الموافقة: لا توجد مخالفات حرجة أو كبيرة في الرسومات');
    }

    // أقسام موجّهة
    if (criticalIssues > 0) header.push('مرفوض بسبب: مخالفات حرجة يجب إزالتها قبل إعادة التقديم');
    if (majorIssues > 0 || minorIssues > 0) header.push('يتطلب تعديل: معالجة المخالفات الكبيرة والتحسينات الصغيرة لضمان المطابقة');

    // دمج بدون تكرار
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const s of [...header, ...base]) {
      const k = (s || '').replace(/\s+/g, ' ').trim();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      merged.push(k);
    }
    return merged;
  }

  // إنشاء ترخيص
  createLicense(projectId: string): License {
    const project = this.getProjectById(projectId);
    if (!project || project.status !== 'approved') {
      throw new Error('Project not approved for license');
    }

    const license: License = {
      id: `license-${Date.now()}`,
      projectId,
      licenseNumber: `LIC-${Date.now()}`,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // سنة واحدة
      status: 'active',
      pdfPath: `/licenses/license-${Date.now()}.pdf`
    };

    this.licenses.push(license);
    project.license = license;
    project.approvalDate = new Date().toISOString();
    try {
      this.addNotification({
        userId: project.applicantId,
        type: 'success',
        title: 'تم إصدار الترخيص',
        body: `تم إصدار ترخيص المشروع رقم ${license.licenseNumber}.`,
        projectId
      });
    } catch {}

    return license;
  }

  // الحصول على إحصائيات المشاريع للمستخدم
  getUserProjectStats(userId: string): {
    total: number;
    approved: number;
    pending: number;
    underReview: number;
    rejected: number;
    needsRevision: number;
  } {
    const userProjects = this.projects.filter(project => project.applicantId === userId);
    
    const stats = {
      total: userProjects.length,
      approved: 0,
      pending: 0,
      underReview: 0,
      rejected: 0,
      needsRevision: 0
    };

    userProjects.forEach(project => {
      switch (project.status) {
        case 'approved':
          stats.approved++;
          break;
        case 'submitted':
          stats.pending++;
          break;
        case 'under_review':
          stats.underReview++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'needs_revision':
          stats.needsRevision++;
          break;
        case 'draft':
          stats.pending++;
          break;
      }
    });

    return stats;
  }

  // الحصول على جميع المشاريع
  getAllProjects(): Project[] {
    return [...this.projects];
  }

  // الحصول على جميع التقارير
  getAllReports(): ReviewReport[] {
    return [...this.reviewReports];
  }

  // الحصول على جميع التراخيص
  getAllLicenses(): License[] {
    return [...this.licenses];
  }

  // Notifications API
  addNotification(input: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): NotificationItem {
    const baseId = `ntf-${Date.now()}`;
    const item: NotificationItem = {
      ...input,
      id: baseId,
      createdAt: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(item);
    // إرسال نسخة للأدمن ليرى كل ما يحدث في النظام
    try {
      if (input.userId !== 'admin-001') {
        const adminCopy: NotificationItem = {
          ...item,
          id: `${baseId}-admin`,
          userId: 'admin-001',
          read: false,
        };
        this.notifications.unshift(adminCopy);
      }
    } catch {}
    try { localStorage.setItem('firecode_notifications', JSON.stringify(this.notifications)); } catch {}
    return item;
  }

  getNotificationsByUser(userId: string): NotificationItem[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  getUnreadCountByUser(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  markAllAsRead(userId: string): void {
    let changed = false;
    this.notifications.forEach(n => {
      if (n.userId === userId && !n.read) { n.read = true; changed = true; }
    });
    if (changed) {
      try { localStorage.setItem('firecode_notifications', JSON.stringify(this.notifications)); } catch {}
    }
  }

  markAsRead(userId: string, notificationId: string): void {
    const n = this.notifications.find(x => x.id === notificationId && x.userId === userId);
    if (n && !n.read) {
      n.read = true;
      try { localStorage.setItem('firecode_notifications', JSON.stringify(this.notifications)); } catch {}
    }
  }

  deleteNotification(userId: string, notificationId: string): void {
    const before = this.notifications.length;
    this.notifications = this.notifications.filter(n => !(n.userId === userId && n.id === notificationId));
    if (this.notifications.length !== before) {
      try { localStorage.setItem('firecode_notifications', JSON.stringify(this.notifications)); } catch {}
    }
  }

  deleteAllRead(userId: string): void {
    const before = this.notifications.length;
    this.notifications = this.notifications.filter(n => !(n.userId === userId && n.read));
    if (this.notifications.length !== before) {
      try { localStorage.setItem('firecode_notifications', JSON.stringify(this.notifications)); } catch {}
    }
  }
}

// إنشاء instance واحد من قاعدة البيانات
export const fireCodeDB = new FireCodeDatabase();
