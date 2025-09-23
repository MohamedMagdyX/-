import { Upload, Brain, CheckCircle, Bell, Shield, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "@/assets/logo-main.jpg";

const phases = [
  {
    phase: "المرحلة الأولى",
    title: "مرحلة التصميم والتراخيص",
    description: "مراجعة الرسومات والمخططات باستخدام الذكاء الاصطناعي",
    steps: [
      {
        icon: Upload,
        title: "رفع المخططات",
        description: "رفع الرسومات الهندسية والمخططات إلى المنصة",
        color: "text-primary",
        details: "يقوم مقدم الطلب برفع الرسومات الهندسية والمخططات الخاصة بالمشروع إلى المنصة. النظام يدعم جميع صيغ الملفات الشائعة ويضمن الأمان والخصوصية."
      },
      {
        icon: Brain,
        title: "تحليل بالذكاء الاصطناعي",
        description: "مراجعة تلقائية وفقاً للكود المصري لحماية المنشآت",
        color: "text-secondary",
        details: "يقوم الذكاء الاصطناعي بتحليل الرسومات ومقارنتها مع الكود المصري لحماية المنشآت من أخطار الحريق. النظام يكتشف المخالفات ويقدم توصيات محددة."
      },
      {
        icon: CheckCircle,
        title: "تقرير المطابقة",
        description: "إصدار تقرير مفصل بالمطابقات والمخالفات",
        color: "text-success",
        details: "يتم إصدار تقرير شامل يوضح نقاط المطابقة والمخالفات مع التوصيات اللازمة. التقرير يخضع لمراجعة الأدمن قبل إصدار الموافقة النهائية."
      },
    ]
  },
  {
    phase: "المرحلة الثانية",
    title: "ما بعد التشغيل",
    description: "مراقبة مستمرة وحماية شاملة للمبنى",
    steps: [
      {
        icon: Shield,
        title: "تركيب أجهزة الاستشعار",
        description: "تركيب أجهزة IoT ذكية للمراقبة المستمرة",
        color: "text-warning",
        details: "يتم تركيب أجهزة استشعار متطورة تعمل بتقنية إنترنت الأشياء في جميع أنحاء المبنى. هذه الأجهزة تراقب درجة الحرارة والرطوبة والدخان والغازات السامة."
      },
      {
        icon: Bell,
        title: "الإنذار المبكر",
        description: "كشف المخاطر قبل وقوعها وإرسال تحذيرات فورية",
        color: "text-destructive",
        details: "عند اكتشاف أي خطر محتمل، يقوم النظام بإرسال إنذارات فورية للحماية المدنية مع تحديد الموقع الدقيق. النظام يتنبأ بالمخاطر قبل وقوعها بفترة كافية."
      },
      {
        icon: BarChart3,
        title: "التحليل والتقارير",
        description: "تحليل البيانات وإعداد تقارير دورية عن حالة المبنى",
        color: "text-accent",
        details: "يقوم النظام بتحليل البيانات المستمرة وإعداد تقارير دورية عن حالة المبنى. هذه التقارير تساعد في تحسين أداء المبنى وضمان سلامة شاغليه."
      },
    ]
  }
];

export const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">كيف تعمل المنصة</h1>
              <p className="text-muted-foreground mt-1">
                نظام متكامل في مرحلتين أساسيتين لحماية شاملة
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
        {/* Introduction */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
              <img 
                src={logoImage} 
                alt="منصة الحماية الذكي للمنشآت المصرية"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <Badge variant="outline" className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
            كيف تعمل المنصة
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            نظام متكامل في{" "}
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              مرحلتين أساسيتين
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            من مرحلة التصميم والترخيص إلى المراقبة المستمرة بعد التشغيل، 
            نوفر حماية شاملة طوال دورة حياة المبنى
          </p>
        </div>

        {/* Phases */}
        <div className="space-y-16">
          {phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="space-y-8">
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-6 py-2 mb-4">
                  {phase.phase}
                </Badge>
                <h3 className="text-2xl font-bold mb-2">{phase.title}</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {phase.description}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {phase.steps.map((step, stepIndex) => {
                  const Icon = step.icon;
                  return (
                    <div key={stepIndex} className="relative">
                      {/* Connection Line */}
                      {stepIndex < phase.steps.length - 1 && (
                        <div className="hidden md:block absolute top-12 right-0 w-full h-0.5 bg-gradient-to-r from-border to-transparent transform translate-x-1/2 z-0" />
                      )}
                      
                      <Card className="relative z-10 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm border-0">
                        <CardContent className="p-6 text-center">
                          <div className="relative mb-6">
                            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-primary group-hover:scale-110 transition-transform duration-300">
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-accent-foreground">
                              {stepIndex + 1}
                            </div>
                          </div>
                          
                          <h4 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors">
                            {step.title}
                          </h4>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {step.description}
                          </p>
                          <div className="border-t pt-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {step.details}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <Card className="max-w-4xl mx-auto shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6">الفوائد الرئيسية</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">90%</div>
                  <div className="text-sm text-muted-foreground">تسريع في مراجعة التراخيص</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">دقة في كشف المخاطر</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">مراقبة مستمرة</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">ابدأ رحلتك معنا</h3>
              <p className="text-muted-foreground mb-6">
                انضم إلى منصة الحماية الذكي واختبر كيف تعمل تقنياتنا المتطورة
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/register">ابدأ الآن</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/features">اكتشف المميزات</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
