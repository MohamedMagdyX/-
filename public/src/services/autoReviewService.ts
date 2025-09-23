// نظام المراجعة التلقائية للرسومات والمخططات
import { fireCodeDB, FireCodeRule, BuildingDrawing, ReviewResult, Project } from '../data/fireCodeDatabase';

export interface AutoReviewResult {
  drawingId: string;
  reviewResults: ReviewResult[];
  overallStatus: 'approved' | 'rejected' | 'needs_revision';
  complianceScore: number;
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  recommendations: string[];
}

export interface DrawingAnalysis {
  drawingType: string;
  buildingType: string;
  detectedElements: string[];
  complianceIssues: ComplianceIssue[];
}

export interface ComplianceIssue {
  ruleId: string;
  ruleTitle: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  suggestedFix: string;
  elementType: string;
}

class AutoReviewSystem {
  // محاكاة تحليل الرسم باستخدام الذكاء الاصطناعي
  async analyzeDrawing(drawing: BuildingDrawing, project: Project): Promise<DrawingAnalysis> {
    // محاكاة تحليل الرسم - في التطبيق الحقيقي سيكون هذا AI حقيقي
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const drawingType = this.extractDrawingType(drawing.fileName);
    const detectedElements = this.simulateElementDetection(drawingType);
    const complianceIssues = this.checkCompliance(drawingType, project.buildingType, detectedElements);
    
    return {
      drawingType,
      buildingType: project.buildingType,
      detectedElements,
      complianceIssues
    };
  }

  // استخراج نوع الرسم من اسم الملف
  private extractDrawingType(fileName: string): string {
    const name = fileName.toLowerCase();
    if (name.includes('architectural') || name.includes('معماري')) return 'المخططات المعمارية';
    if (name.includes('structural') || name.includes('إنشائي')) return 'المخططات الإنشائية';
    if (name.includes('electrical') || name.includes('كهرباء')) return 'مخططات الكهرباء';
    if (name.includes('plumbing') || name.includes('سباكة')) return 'مخططات السباكة';
    if (name.includes('hvac') || name.includes('تكييف')) return 'مخططات التكييف';
    if (name.includes('fire') || name.includes('حريق')) return 'مخططات الحريق';
    if (name.includes('topographic') || name.includes('طبوغرافي')) return 'المخططات الطبوغرافية';
    if (name.includes('site') || name.includes('موقع')) return 'مخططات الموقع';
    return 'المخططات المعمارية'; // افتراضي
  }

  // محاكاة اكتشاف العناصر في الرسم
  private simulateElementDetection(drawingType: string): string[] {
    const elementMap: { [key: string]: string[] } = {
      'المخططات المعمارية': [
        'الجدران الخارجية',
        'المخارج الرئيسية',
        'المخارج الطارئة',
        'المساحات المفتوحة',
        'الغرف والمساحات',
        'النوافذ والأبواب',
        'مخطط معماري أساسي',
        'مسارات الإخلاء'
      ],
      'المخططات الإنشائية': [
        'الأعمدة',
        'الكمرات',
        'الأساسات',
        'البلاطات',
        'الجدران الحاملة'
      ],
      'مخططات الكهرباء': [
        'لوحات التوزيع',
        'الكابلات',
        'المفاتيح',
        'المصابيح',
        'أجهزة الإنذار'
      ],
      'مخططات السباكة': [
        'المواسير الرئيسية',
        'المواسير الفرعية',
        'الصنابير',
        'المراحيض',
        'أجهزة الإطفاء'
      ],
      'مخططات التكييف': [
        'وحدات التكييف',
        'القنوات',
        'المشعات',
        'أجهزة التهوية'
      ],
      'مخططات الحريق': [
        'أجهزة كشف الدخان',
        'أجهزة كشف الحرارة',
        'طفايات الحريق',
        'أنظمة الإطفاء التلقائي',
        'أنظمة الإنذار'
      ],
      'المخططات الطبوغرافية': [
        'المناسيب',
        'المنحدرات',
        'المساحات المفتوحة',
        'الطرق والمسارات'
      ],
      'مخططات الموقع': [
        'المباني',
        'الطرق',
        'مواقف السيارات',
        'المساحات الخضراء',
        'المرافق العامة'
      ]
    };

    return elementMap[drawingType] || [];
  }

  // فحص المطابقة مع قواعد الكود المصري
  private checkCompliance(drawingType: string, buildingType: string, detectedElements: string[]): ComplianceIssue[] {
    const rules = fireCodeDB.getRulesByBuildingType(buildingType);
    const issues: ComplianceIssue[] = [];

    // محاكاة فحص المطابقة لكل قاعدة
    rules.forEach(rule => {
      const isApplicable = this.isRuleApplicable(rule, drawingType, detectedElements);
      if (isApplicable) {
        const hasIssue = this.simulateComplianceCheck(rule, detectedElements);
        if (hasIssue) {
          issues.push({
            ruleId: rule.id,
            ruleTitle: rule.title,
            severity: rule.severity,
            description: this.generateIssueDescription(rule),
            suggestedFix: this.generateSuggestedFix(rule),
            elementType: this.getRelevantElement(rule, detectedElements)
          });
        }
      }
    });

    return issues;
  }

  // التحقق من قابلية تطبيق القاعدة
  private isRuleApplicable(rule: FireCodeRule, drawingType: string, detectedElements: string[]): boolean {
    // قواعد التعريفات والمصطلحات تنطبق على جميع الرسومات
    if (rule.category === 'التعريفات والمصطلحات') {
      return true;
    }
    
    // قواعد التصنيف حسب الاستخدام تنطبق على المخططات المعمارية
    if (rule.category === 'التصنيف حسب الاستخدام') {
      return drawingType === 'المخططات المعمارية';
    }
    
    // قواعد المساحات والمسافات تنطبق على المخططات المعمارية والموقع
    if (rule.category === 'المساحات والمسافات') {
      return drawingType === 'المخططات المعمارية' || drawingType === 'مخططات الموقع';
    }
    
    // قواعد المخارج تنطبق على المخططات المعمارية
    if (rule.category === 'المخارج والمداخل') {
      return drawingType === 'المخططات المعمارية';
    }
    
    // قواعد الإنذار تنطبق على مخططات الكهرباء والحريق
    if (rule.category === 'أنظمة الإنذار') {
      return drawingType === 'مخططات الكهرباء' || drawingType === 'مخططات الحريق';
    }
    
    // قواعد الإطفاء تنطبق على مخططات السباكة والحريق
    if (rule.category === 'أنظمة الإطفاء') {
      return drawingType === 'مخططات السباكة' || drawingType === 'مخططات الحريق';
    }
    
    // قواعد المواد المقاومة للحريق تنطبق على المخططات الإنشائية
    if (rule.category === 'المواد المقاومة للحريق') {
      return drawingType === 'المخططات الإنشائية';
    }
    
    // قواعد التهوية تنطبق على مخططات التكييف
    if (rule.category === 'التهوية والتدخين') {
      return drawingType === 'مخططات التكييف';
    }
    
    // قواعد الصيانة والتفتيش تنطبق على جميع الرسومات
    if (rule.category === 'الصيانة والتفتيش') {
      return true;
    }
    
    // قواعد التدريب والتوعية تنطبق على جميع الرسومات
    if (rule.category === 'التدريب والتوعية') {
      return true;
    }
    
    // قواعد المباني الخاصة تنطبق حسب نوع المبنى
    if (rule.category === 'المباني الخاصة') {
      return drawingType === 'المخططات المعمارية';
    }
    
    // قواعد الإجراءات الطارئة تنطبق على جميع الرسومات
    if (rule.category === 'الإجراءات الطارئة') {
      return true;
    }
    
    // قواعد العقوبات والغرامات تنطبق على جميع الرسومات
    if (rule.category === 'العقوبات والغرامات') {
      return true;
    }
    
    return false;
  }

  // محاكاة فحص المطابقة
  private simulateComplianceCheck(rule: FireCodeRule, detectedElements: string[]): boolean {
    // فحص ذكي للعناصر المطلوبة
    const requiredElements = this.getRequiredElementsForRule(rule);
    
    // إذا كانت القاعدة تتطلب عناصر محددة، تحقق من وجودها
    if (requiredElements.length > 0) {
      const hasRequiredElements = requiredElements.some(element => 
        detectedElements.some(detected => 
          detected.toLowerCase().includes(element.toLowerCase()) ||
          element.toLowerCase().includes(detected.toLowerCase())
        )
      );
      
      // إذا لم توجد العناصر المطلوبة، فهناك مشكلة
      if (!hasRequiredElements) {
        return true; // يوجد مشكلة
      }
    }
    
    // محاكاة وجود مخالفة بنسب أقل وأكثر واقعية
    const issueProbability = rule.severity === 'critical' ? 0.02 : // 2% فقط للقواعد الحرجة
                            rule.severity === 'major' ? 0.10 :     // 10% للقواعد الكبيرة
                            0.20;                                  // 20% للقواعد الصغيرة
    
    return Math.random() < issueProbability;
  }

  // الحصول على العناصر المطلوبة لكل قاعدة
  private getRequiredElementsForRule(rule: FireCodeRule): string[] {
    const requirements: { [key: string]: string[] } = {
      'rule-001': ['مخطط معماري أساسي'],
      'rule-002': ['مسارات الإخلاء', 'مخارج الطوارئ'],
      'rule-003': ['أجهزة كشف الدخان'],
      'rule-004': ['أجهزة الإنذار'],
      'rule-005': ['طفايات الحريق'],
      'rule-006': ['نظام الإطفاء التلقائي'],
      'rule-007': ['أجهزة كشف الحرارة'],
      'rule-008': ['أنظمة التهوية'],
      'rule-009': ['الإضاءة الطارئة'],
      'rule-010': ['نظام الإنذار المركزي']
    };
    
    return requirements[rule.id] || [];
  }

  // إنشاء وصف المشكلة
  private generateIssueDescription(rule: FireCodeRule): string {
    const descriptions = {
      'rule-001': 'لا يوجد مخطط معماري أساسي في الرسومات المرفوعة',
      'rule-002': 'لا يوجد مخطط مسارات الإخلاء ومخارج الطوارئ',
      'rule-003': 'عدم الالتزام باشتراطات المباني التجارية',
      'rule-004': 'المسافة بين المباني أقل من الحد الأدنى المطلوب (6 أمتار)',
      'rule-005': 'المساحات المفتوحة غير كافية للطوارئ والإنقاذ',
      'rule-006': 'المساحات المفتوحة للمباني الصناعية غير كافية (أقل من 30%)',
      'rule-007': 'عدد المخارج غير كافي لعدد السكان المتوقع',
      'rule-008': 'عدم وجود مخارج طارئة في جميع الطوابق',
      'rule-009': 'عدم وجود مخارج طارئة كافية للمباني التعليمية',
      'rule-010': 'أجهزة كشف الدخان غير موزعة بشكل صحيح',
      'rule-011': 'عدم وجود أجهزة كشف حرارة في المناطق عالية الخطورة',
      'rule-012': 'عدم وجود أنظمة إنذار صوتية كافية',
      'rule-013': 'طفايات الحريق غير كافية أو غير موزعة بشكل صحيح',
      'rule-014': 'عدم وجود نظام إطفاء تلقائي في المبنى',
      'rule-015': 'عدم وجود نظام إطفاء تلقائي في المباني الصناعية',
      'rule-016': 'استخدام مواد بناء غير مقاومة للحريق',
      'rule-017': 'استخدام مواد عزل غير مقاومة للحريق',
      'rule-018': 'عدم وجود أنظمة تهوية طارئة كافية',
      'rule-019': 'عدم منع التدخين في المناطق الخطرة',
      'rule-020': 'عدم إجراء الصيانة الدورية لأنظمة الحماية',
      'rule-021': 'عدم إجراء التفتيش الدوري للمباني',
      'rule-022': 'عدم تدريب العاملين على السلامة من الحريق',
      'rule-023': 'عدم وجود برامج توعية بالسلامة من الحريق',
      'rule-024': 'عدم الالتزام باشتراطات الحماية للمستشفيات',
      'rule-025': 'عدم الالتزام باشتراطات الحماية للمدارس',
      'rule-026': 'عدم الالتزام باشتراطات الحماية للمباني الصناعية',
      'rule-027': 'عدم وجود خطة إخلاء طارئ واضحة',
      'rule-028': 'عدم التنسيق مع الحماية المدنية',
      'rule-029': 'وجود مخالفات تستوجب غرامات مالية',
      'rule-030': 'عدم اتخاذ إجراءات تصحيحية للمخالفات'
    };
    
    return descriptions[rule.id as keyof typeof descriptions] || rule.description;
  }

  // إنشاء الحل المقترح
  private generateSuggestedFix(rule: FireCodeRule): string {
    const fixes = {
      'rule-001': 'إضافة مخطط معماري أساسي يوضح تخطيط المبنى والمساحات',
      'rule-002': 'إضافة مخطط مسارات الإخلاء يوضح مخارج الطوارئ وطرق الهروب',
      'rule-003': 'الالتزام باشتراطات المباني التجارية المطلوبة',
      'rule-004': 'زيادة المسافة بين المباني إلى 6 أمتار على الأقل',
      'rule-005': 'توفير مساحات مفتوحة لا تقل عن 20% من مساحة المبنى',
      'rule-006': 'توفير مساحات مفتوحة لا تقل عن 30% للمباني الصناعية',
      'rule-007': 'زيادة عدد المخارج حسب عدد السكان المتوقع',
      'rule-008': 'توفير مخارج طارئة في جميع الطوابق',
      'rule-009': 'توفير مخارج طارئة إضافية للمباني التعليمية',
      'rule-010': 'توزيع أجهزة كشف الدخان بشكل صحيح (جهاز لكل 100 متر مربع)',
      'rule-011': 'تثبيت أجهزة كشف حرارة في المناطق عالية الخطورة',
      'rule-012': 'توفير أنظمة إنذار صوتية كافية',
      'rule-013': 'توزيع طفايات الحريق بشكل صحيح (طفاية لكل 200 متر مربع)',
      'rule-014': 'تثبيت نظام إطفاء تلقائي في المبنى',
      'rule-015': 'تثبيت نظام إطفاء تلقائي في المباني الصناعية',
      'rule-016': 'استخدام مواد بناء مقاومة للحريق',
      'rule-017': 'استخدام مواد عزل مقاومة للحريق',
      'rule-018': 'توفير أنظمة تهوية طارئة كافية',
      'rule-019': 'منع التدخين في المناطق الخطرة',
      'rule-020': 'إجراء الصيانة الدورية لأنظمة الحماية',
      'rule-021': 'إجراء التفتيش الدوري للمباني',
      'rule-022': 'تدريب العاملين على السلامة من الحريق',
      'rule-023': 'توفير برامج توعية بالسلامة من الحريق',
      'rule-024': 'الالتزام باشتراطات الحماية للمستشفيات',
      'rule-025': 'الالتزام باشتراطات الحماية للمدارس',
      'rule-026': 'الالتزام باشتراطات الحماية للمباني الصناعية',
      'rule-027': 'وضع خطة إخلاء طارئ واضحة',
      'rule-028': 'التنسيق مع الحماية المدنية',
      'rule-029': 'دفع الغرامات المالية المطلوبة',
      'rule-030': 'اتخاذ إجراءات تصحيحية للمخالفات'
    };
    
    return fixes[rule.id as keyof typeof fixes] || 'مراجعة المخططات وإصلاح المخالفات المذكورة';
  }

  // الحصول على العنصر ذي الصلة
  private getRelevantElement(rule: FireCodeRule, detectedElements: string[]): string {
    if (rule.category === 'التعريفات والمصطلحات') {
      return detectedElements.find(el => el.includes('المبنى')) || 'المبنى الرئيسي';
    }
    
    if (rule.category === 'التصنيف حسب الاستخدام') {
      return detectedElements.find(el => el.includes('الاستخدام')) || 'نوع المبنى';
    }
    
    if (rule.category === 'المساحات والمسافات') {
      return detectedElements.find(el => el.includes('المساحات المفتوحة')) || 'المساحات الخارجية';
    }
    
    if (rule.category === 'المخارج والمداخل') {
      return detectedElements.find(el => el.includes('المخارج')) || 'المخارج الرئيسية';
    }
    
    if (rule.category === 'أنظمة الإنذار') {
      return detectedElements.find(el => el.includes('إنذار') || el.includes('كشف')) || 'أجهزة الإنذار';
    }
    
    if (rule.category === 'أنظمة الإطفاء') {
      return detectedElements.find(el => el.includes('إطفاء') || el.includes('طفاية')) || 'أنظمة الإطفاء';
    }
    
    if (rule.category === 'المواد المقاومة للحريق') {
      return detectedElements.find(el => el.includes('مواد') || el.includes('عزل')) || 'مواد البناء';
    }
    
    if (rule.category === 'التهوية والتدخين') {
      return detectedElements.find(el => el.includes('تهوية') || el.includes('تكييف')) || 'أنظمة التهوية';
    }
    
    if (rule.category === 'الصيانة والتفتيش') {
      return detectedElements.find(el => el.includes('صيانة') || el.includes('تفتيش')) || 'أنظمة الحماية';
    }
    
    if (rule.category === 'التدريب والتوعية') {
      return detectedElements.find(el => el.includes('تدريب') || el.includes('توعية')) || 'البرامج التدريبية';
    }
    
    if (rule.category === 'المباني الخاصة') {
      return detectedElements.find(el => el.includes('مستشفى') || el.includes('مدرسة') || el.includes('صناعي')) || 'المبنى الخاص';
    }
    
    if (rule.category === 'الإجراءات الطارئة') {
      return detectedElements.find(el => el.includes('إخلاء') || el.includes('طوارئ')) || 'خطط الطوارئ';
    }
    
    if (rule.category === 'العقوبات والغرامات') {
      return detectedElements.find(el => el.includes('مخالفة') || el.includes('غرامة')) || 'المخالفات';
    }
    
    return 'عنصر غير محدد';
  }

  // تنفيذ المراجعة التلقائية للمشروع
  async performAutoReview(projectId: string): Promise<AutoReviewResult[]> {
    const project = fireCodeDB.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const results: AutoReviewResult[] = [];

    for (const drawing of project.drawings) {
      const analysis = await this.analyzeDrawing(drawing, project);
      const reviewResults = this.convertAnalysisToReviewResults(analysis);
      
      // تحديث حالة الرسم
      fireCodeDB.reviewDrawing(drawing.id, reviewResults);
      
      const criticalIssues = reviewResults.filter(r => r.severity === 'critical' && r.status === 'non_compliant').length;
      const majorIssues = reviewResults.filter(r => r.severity === 'major' && r.status === 'non_compliant').length;
      const minorIssues = reviewResults.filter(r => r.severity === 'minor' && r.status === 'non_compliant').length;
      
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

      results.push({
        drawingId: drawing.id,
        reviewResults,
        overallStatus,
        complianceScore,
        criticalIssues,
        majorIssues,
        minorIssues,
        recommendations: analysis.complianceIssues.map(issue => issue.suggestedFix)
      });
    }

    return results;
  }

  // تحويل التحليل إلى نتائج المراجعة
  private convertAnalysisToReviewResults(analysis: DrawingAnalysis): ReviewResult[] {
    return analysis.complianceIssues.map(issue => ({
      ruleId: issue.ruleId,
      status: 'non_compliant' as const,
      notes: issue.description,
      severity: issue.severity,
      suggestedFix: issue.suggestedFix
    }));
  }

  // إنشاء تقرير المراجعة التلقائية
  async generateAutoReviewReport(projectId: string): Promise<any> {
    const project = fireCodeDB.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const reviewResults = await this.performAutoReview(projectId);
    
    const allReviewResults = reviewResults.flatMap(r => r.reviewResults);
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

    const report = fireCodeDB.createReviewReport(projectId, 'auto-reviewer');
    
    return {
      ...report,
      reviewResults,
      project: {
        id: project.id,
        name: project.projectName,
        buildingType: project.buildingType,
        location: project.location,
        area: project.area,
        floors: project.floors
      }
    };
  }
}

// إنشاء instance واحد من نظام المراجعة التلقائية
export const autoReviewSystem = new AutoReviewSystem();
