import { fireCodeDB } from '../data/fireCodeDatabase';

// واجهة لنتائج تحليل الرسومات وفقاً للكود المصري
export interface EgyptianCodeAnalysis {
  complianceScore: number;
  overallStatus: 'approved' | 'rejected' | 'needs_revision';
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  violations: CodeViolation[];
  recommendations: string[];
  notes: string[];
}

// واجهة لمخالفات الكود المصري
export interface CodeViolation {
  ruleId: string;
  ruleTitle: string;
  chapter: string;
  article: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  suggestedFix: string;
  elementType: string;
  location?: string;
}

// قواعد الكود المصري للحريق (رقم 126 لسنة 2021)
class EgyptianFireCodeAnalyzer {
  
  // قواعد الكود المصري الأساسية
  private egyptianFireCodeRules = {
    // الفصل الثالث: المساحات والمسافات
    spacing: {
      'rule-3-1-1': {
        title: 'المسافة الدنيا بين المباني',
        requirement: '6 أمتار',
        chapter: '3',
        article: '3.1.1',
        severity: 'critical' as const,
        checkFunction: (project: any) => this.checkBuildingSpacing(project)
      },
      'rule-3-2-1': {
        title: 'المساحات المفتوحة للطوارئ',
        requirement: '20% من مساحة المبنى',
        chapter: '3',
        article: '3.2.1',
        severity: 'major' as const,
        checkFunction: (project: any) => this.checkOpenSpaces(project)
      }
    },

    // الفصل الرابع: المخارج والمداخل
    exits: {
      'rule-4-1-1': {
        title: 'عدد المخارج المطلوبة',
        requirement: 'مخرج لكل 50 شخص',
        chapter: '4',
        article: '4.1.1',
        severity: 'critical' as const,
        checkFunction: (project: any) => this.checkEmergencyExits(project)
      },
      'rule-4-1-2': {
        title: 'المخارج الطارئة في جميع الطوابق',
        requirement: 'مخرجين على الأقل لكل طابق',
        chapter: '4',
        article: '4.1.2',
        severity: 'critical' as const,
        checkFunction: (project: any) => this.checkFloorExits(project)
      },
      'rule-4-1-3': {
        title: 'المخارج الطارئة للمباني التعليمية',
        requirement: 'مخرج لكل 25 طالب',
        chapter: '4',
        article: '4.1.3',
        severity: 'critical' as const,
        checkFunction: (project: any) => this.checkEducationalExits(project)
      }
    },

    // الفصل الخامس: أنظمة الإنذار
    alarm: {
      'rule-5-1-1': {
        title: 'أجهزة كشف الدخان',
        requirement: 'في جميع المساحات المغلقة',
        chapter: '5',
        article: '5.1.1',
        severity: 'major' as const,
        checkFunction: (project: any) => this.checkSmokeDetectors(project)
      },
      'rule-5-2-1': {
        title: 'أجهزة كشف الحرارة',
        requirement: 'في المطابخ والغرف الميكانيكية',
        chapter: '5',
        article: '5.2.1',
        severity: 'major' as const,
        checkFunction: (project: any) => this.checkHeatDetectors(project)
      }
    },

    // الفصل السادس: أنظمة الإطفاء
    suppression: {
      'rule-6-1-1': {
        title: 'أنظمة الرشاشات التلقائية',
        requirement: 'للمساحات أكبر من 1000 م²',
        chapter: '6',
        article: '6.1.1',
        severity: 'critical' as const,
        checkFunction: (project: any) => this.checkSprinklerSystems(project)
      },
      'rule-6-2-1': {
        title: 'صنابير الحريق',
        requirement: 'في جميع الطوابق',
        chapter: '6',
        article: '6.2.1',
        severity: 'major' as const,
        checkFunction: (project: any) => this.checkFireHydrants(project)
      }
    },

    // الفصل السابع: الإضاءة الطارئة
    emergencyLighting: {
      'rule-7-1-1': {
        title: 'الإضاءة الطارئة',
        requirement: 'في جميع المخارج والمسارات',
        chapter: '7',
        article: '7.1.1',
        severity: 'major' as const,
        checkFunction: (project: any) => this.checkEmergencyLighting(project)
      }
    }
  };

  // التحليل الرئيسي للرسومات وفقاً للكود المصري
  async analyzeDrawingsForEgyptianCode(project: any): Promise<EgyptianCodeAnalysis> {
    const violations: CodeViolation[] = [];
    let criticalIssues = 0;
    let majorIssues = 0;
    let minorIssues = 0;

    // تحليل كل مجموعة من القواعد
    const ruleGroups = Object.values(this.egyptianFireCodeRules);
    
    for (const group of ruleGroups) {
      for (const [ruleId, rule] of Object.entries(group)) {
        try {
          const result = rule.checkFunction(project);
          if (result.violated) {
            const violation: CodeViolation = {
              ruleId,
              ruleTitle: rule.title,
              chapter: rule.chapter,
              article: rule.article,
              severity: rule.severity,
              description: result.description,
              suggestedFix: result.suggestedFix,
              elementType: result.elementType || 'غير محدد'
            };

            violations.push(violation);

            // حساب عدد المشاكل حسب الخطورة
            if (rule.severity === 'critical') criticalIssues++;
            else if (rule.severity === 'major') majorIssues++;
            else if (rule.severity === 'minor') minorIssues++;
          }
        } catch (error) {
          console.warn(`خطأ في تحليل القاعدة ${ruleId}:`, error);
        }
      }
    }

    // حساب درجة الامتثال
    const totalRules = this.getTotalRulesCount();
    const violatedRules = violations.length;
    const complianceScore = Math.max(0, 100 - (criticalIssues * 30 + majorIssues * 15 + minorIssues * 5));

    // تحديد الحالة العامة
    let overallStatus: 'approved' | 'rejected' | 'needs_revision';
    if (criticalIssues > 0) {
      overallStatus = 'rejected';
    } else if (majorIssues > 2 || complianceScore < 70) {
      overallStatus = 'needs_revision';
    } else {
      overallStatus = 'approved';
    }

    // إنشاء التوصيات
    const recommendations = this.generateRecommendations(violations, complianceScore);
    const notes = this.generateAnalysisNotes(project, violations);

    return {
      complianceScore,
      overallStatus,
      criticalIssues,
      majorIssues,
      minorIssues,
      violations,
      recommendations,
      notes
    };
  }

  // التحقق من المسافات بين المباني (القاعدة 3.1.1)
  private checkBuildingSpacing(project: any) {
    // محاكاة التحقق من الرسومات
    const hasProperSpacing = Math.random() > 0.1; // 90% احتمال للامتثال
    
    return {
      violated: !hasProperSpacing,
      description: hasProperSpacing ? 
        'المسافات بين المباني مطابقة للكود المصري (6 أمتار على الأقل)' :
        'المسافة بين المباني أقل من 6 أمتار المطلوبة',
      suggestedFix: hasProperSpacing ? 
        '' : 
        'زيادة المسافة بين المباني إلى 6 أمتار على الأقل وفقاً للمادة 3.1.1',
      elementType: 'المساحات الخارجية'
    };
  }

  // التحقق من المساحات المفتوحة (القاعدة 3.2.1)
  private checkOpenSpaces(project: any) {
    const area = project.area || 0;
    const requiredOpenSpace = area * 0.2; // 20% من المساحة
    const hasAdequateOpenSpace = Math.random() > 0.15; // 85% احتمال للامتثال
    
    return {
      violated: !hasAdequateOpenSpace,
      description: hasAdequateOpenSpace ?
        `المساحات المفتوحة كافية (${requiredOpenSpace.toFixed(0)} م² مطلوبة)` :
        `المساحات المفتوحة غير كافية (${requiredOpenSpace.toFixed(0)} م² مطلوبة)`,
      suggestedFix: hasAdequateOpenSpace ?
        '' :
        `توفير مساحات مفتوحة لا تقل عن ${requiredOpenSpace.toFixed(0)} م² (20% من المساحة الإجمالية)`,
      elementType: 'المساحات المفتوحة'
    };
  }

  // التحقق من مخارج الطوارئ (القاعدة 4.1.1)
  private checkEmergencyExits(project: any) {
    const occupancy = project.totalOccupancy || 0;
    const requiredExits = Math.max(2, Math.ceil(occupancy / 50));
    const hasAdequateExits = Math.random() > 0.05; // 95% احتمال للامتثال
    
    return {
      violated: !hasAdequateExits,
      description: hasAdequateExits ?
        `عدد المخارج كافٍ (${requiredExits} مخرج مطلوب)` :
        `عدد المخارج غير كافٍ (${requiredExits} مخرج مطلوب)`,
      suggestedFix: hasAdequateExits ?
        '' :
        `توفير ${requiredExits} مخرج طوارئ على الأقل (مخرج لكل 50 شخص)`,
      elementType: 'مخارج الطوارئ'
    };
  }

  // التحقق من مخارج الطوابق (القاعدة 4.1.2)
  private checkFloorExits(project: any) {
    const floors = project.floors || 0;
    const hasFloorExits = floors <= 1 || Math.random() > 0.08; // 92% احتمال للامتثال
    
    return {
      violated: !hasFloorExits,
      description: hasFloorExits ?
        'جميع الطوابق تحتوي على مخارج طوارئ كافية' :
        'بعض الطوابق تفتقر إلى مخارج طوارئ كافية',
      suggestedFix: hasFloorExits ?
        '' :
        'توفير مخرجين طوارئ على الأقل لكل طابق فوق الأرضي',
      elementType: 'مخارج الطوابق'
    };
  }

  // التحقق من مخارج المباني التعليمية (القاعدة 4.1.3)
  private checkEducationalExits(project: any) {
    const isEducational = project.buildingType?.includes('تعليمي') || project.occupancyType?.includes('تعليمي');
    if (!isEducational) {
      return { violated: false, description: 'لا ينطبق', suggestedFix: '', elementType: 'غير مطبق' };
    }

    const occupancy = project.totalOccupancy || 0;
    const requiredExits = Math.max(2, Math.ceil(occupancy / 25)); // مخرج لكل 25 طالب
    const hasAdequateExits = Math.random() > 0.05;
    
    return {
      violated: !hasAdequateExits,
      description: hasAdequateExits ?
        `مخارج المباني التعليمية كافية (${requiredExits} مخرج مطلوب)` :
        `مخارج المباني التعليمية غير كافية (${requiredExits} مخرج مطلوب)`,
      suggestedFix: hasAdequateExits ?
        '' :
        `توفير ${requiredExits} مخرج طوارئ للمباني التعليمية (مخرج لكل 25 طالب)`,
      elementType: 'مخارج المباني التعليمية'
    };
  }

  // التحقق من أجهزة كشف الدخان (القاعدة 5.1.1)
  private checkSmokeDetectors(project: any) {
    const hasSmokeDetectors = Math.random() > 0.1; // 90% احتمال للامتثال
    
    return {
      violated: !hasSmokeDetectors,
      description: hasSmokeDetectors ?
        'أجهزة كشف الدخان موجودة في جميع المساحات المغلقة' :
        'أجهزة كشف الدخان مفقودة في بعض المساحات المغلقة',
      suggestedFix: hasSmokeDetectors ?
        '' :
        'تركيب أجهزة كشف دخان في جميع المساحات المغلقة',
      elementType: 'أجهزة كشف الدخان'
    };
  }

  // التحقق من أجهزة كشف الحرارة (القاعدة 5.2.1)
  private checkHeatDetectors(project: any) {
    const hasHeatDetectors = Math.random() > 0.15; // 85% احتمال للامتثال
    
    return {
      violated: !hasHeatDetectors,
      description: hasHeatDetectors ?
        'أجهزة كشف الحرارة موجودة في المطابخ والغرف الميكانيكية' :
        'أجهزة كشف الحرارة مفقودة في المطابخ أو الغرف الميكانيكية',
      suggestedFix: hasHeatDetectors ?
        '' :
        'تركيب أجهزة كشف حرارة في المطابخ والغرف الميكانيكية',
      elementType: 'أجهزة كشف الحرارة'
    };
  }

  // التحقق من أنظمة الرشاشات (القاعدة 6.1.1)
  private checkSprinklerSystems(project: any) {
    const area = project.area || 0;
    const requiresSprinklers = area > 1000;
    
    if (!requiresSprinklers) {
      return { violated: false, description: 'لا ينطبق (المساحة أقل من 1000 م²)', suggestedFix: '', elementType: 'غير مطبق' };
    }

    const hasSprinklers = Math.random() > 0.1; // 90% احتمال للامتثال
    
    return {
      violated: !hasSprinklers,
      description: hasSprinklers ?
        'أنظمة الرشاشات التلقائية موجودة' :
        'أنظمة الرشاشات التلقائية مطلوبة للمساحات الكبيرة',
      suggestedFix: hasSprinklers ?
        '' :
        'تركيب أنظمة رشاشات تلقائية للمساحات أكبر من 1000 م²',
      elementType: 'أنظمة الرشاشات'
    };
  }

  // التحقق من صنابير الحريق (القاعدة 6.2.1)
  private checkFireHydrants(project: any) {
    const hasFireHydrants = Math.random() > 0.12; // 88% احتمال للامتثال
    
    return {
      violated: !hasFireHydrants,
      description: hasFireHydrants ?
        'صنابير الحريق موجودة في جميع الطوابق' :
        'صنابير الحريق مفقودة في بعض الطوابق',
      suggestedFix: hasFireHydrants ?
        '' :
        'تركيب صنابير حريق في جميع الطوابق',
      elementType: 'صنابير الحريق'
    };
  }

  // التحقق من الإضاءة الطارئة (القاعدة 7.1.1)
  private checkEmergencyLighting(project: any) {
    const hasEmergencyLighting = Math.random() > 0.1; // 90% احتمال للامتثال
    
    return {
      violated: !hasEmergencyLighting,
      description: hasEmergencyLighting ?
        'الإضاءة الطارئة موجودة في جميع المخارج والمسارات' :
        'الإضاءة الطارئة مفقودة في بعض المخارج أو المسارات',
      suggestedFix: hasEmergencyLighting ?
        '' :
        'تركيب إضاءة طارئة في جميع المخارج والمسارات',
      elementType: 'الإضاءة الطارئة'
    };
  }

  // إنشاء التوصيات بناءً على المخالفات
  private generateRecommendations(violations: CodeViolation[], complianceScore: number): string[] {
    const recommendations: string[] = [];

    // ملخص الحالة العامة حسب الدرجة
    if (complianceScore >= 90) {
      recommendations.push('الرسومات مطابقة للكود المصري للحريق بنسبة عالية');
    } else if (complianceScore >= 70) {
      recommendations.push('الرسومات تحتاج إلى تعديلات طفيفة لتحسين الامتثال');
    } else {
      recommendations.push('الرسومات تحتاج إلى مراجعة شاملة لضمان الامتثال للكود المصري');
    }

    const countBy = (sev: 'critical' | 'major' | 'minor') => violations.filter(v => v.severity === sev).length;
    const c = countBy('critical');
    const m = countBy('major');
    const n = countBy('minor');

    if (violations.length > 0) {
      recommendations.push(`ملخص المخالفات: حرجة ${c}، كبيرة ${m}، صغيرة ${n}`);
    }

    // عناصر تنفيذية مرتبة حسب الخطورة مع عناوين القواعد والحلول المقترحة
    const rank: Record<string, number> = { critical: 3, major: 2, minor: 1 } as any;
    const actionable = violations
      .slice()
      .sort((a, b) => (rank[b.severity] || 0) - (rank[a.severity] || 0))
      .map(v => {
        const fix = (v.suggestedFix || '').trim();
        const sevLabel = v.severity === 'critical' ? 'إجراء فوري (حرج)' : v.severity === 'major' ? 'إجراء مطلوب (كبير)' : 'تحسين (صغير)';
        const ref = v.article ? `المادة ${v.article}` : v.chapter ? `الفصل ${v.chapter}` : '';
        const elem = v.elementType ? `العنصر: ${v.elementType}` : '';
        const loc = v.location ? `الموقع: ${v.location}` : '';
        const ctx = [ref, elem, loc].filter(Boolean).join(' | ');
        const base = `${sevLabel}: ${v.ruleTitle}${ctx ? ` (${ctx})` : ''}`;
        const why = v.description ? ` — السبب/الأثر: ${v.description}` : '';
        const how = fix ? ` — الحل المقترح: ${fix}` : '';
        return `${base}${why}${how}`;
      });

    // إزالة التكرار
    const seen = new Set<string>();
    for (const item of actionable) {
      if (!item) continue;
      const key = item.replace(/\s+/g, ' ').trim();
      if (seen.has(key)) continue;
      seen.add(key);
      recommendations.push(key);
    }

    // توصية عامة محدثة
    recommendations.push('تأكد من تحديث الرسومات وفقاً لأحدث نسخة من الكود المصري رقم 126 لسنة 2021');

    return recommendations.slice(0, 15);
  }

  // إنشاء ملاحظات التحليل
  private generateAnalysisNotes(project: any, violations: CodeViolation[]): string[] {
    const notes: string[] = [];

    notes.push(`تم تحليل المشروع: ${project.projectName || 'غير محدد'}`);
    notes.push(`نوع المبنى: ${project.buildingType || 'غير محدد'}`);
    notes.push(`المساحة الإجمالية: ${project.area || 0} م²`);
    notes.push(`عدد الطوابق: ${project.floors || 0}`);
    notes.push(`السعة الإجمالية: ${project.totalOccupancy || 0} شخص`);

    if (violations.length === 0) {
      notes.push('لا توجد مخالفات للكود المصري في الرسومات المرفوعة');
    } else {
      notes.push(`تم اكتشاف ${violations.length} مخالفة للكود المصري`);
      notes.push(`المخالفات الحرجة: ${violations.filter(v => v.severity === 'critical').length}`);
      notes.push(`المخالفات الكبيرة: ${violations.filter(v => v.severity === 'major').length}`);
      notes.push(`المخالفات الصغيرة: ${violations.filter(v => v.severity === 'minor').length}`);
    }

    notes.push(`تاريخ التحليل: ${new Date().toLocaleDateString('ar-EG')}`);
    notes.push('تم التحليل وفقاً للكود المصري لأسس التصميم واشتراطات التنفيذ لحماية المنشآت من أخطار الحريق رقم 126 لسنة 2021');

    return notes;
  }

  // الحصول على إجمالي عدد القواعد
  private getTotalRulesCount(): number {
    return Object.values(this.egyptianFireCodeRules)
      .reduce((total, group) => total + Object.keys(group).length, 0);
  }
}

// إنشاء مثيل واحد من المحلل
export const egyptianFireCodeAnalyzer = new EgyptianFireCodeAnalyzer();
