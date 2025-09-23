import { Upload, Brain, CheckCircle, Bell, Shield, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const phases = [
  {
    phase: "المرحلة الأولى",
    title: "مرحلة التصميم والتراخيص",
    steps: [
      {
        icon: Upload,
        title: "رفع المخططات",
        description: "رفع الرسومات الهندسية والمخططات إلى المنصة",
        color: "text-primary",
      },
      {
        icon: Brain,
        title: "تحليل بالذكاء الاصطناعي",
        description: "مراجعة تلقائية وفقاً للكود المصري لحماية المنشآت",
        color: "text-secondary",
      },
      {
        icon: CheckCircle,
        title: "تقرير المطابقة",
        description: "إصدار تقرير مفصل بالمطابقات والمخالفات",
        color: "text-success",
      },
    ]
  },
  {
    phase: "المرحلة الثانية",
    title: "ما بعد التشغيل",
    steps: [
      {
        icon: Shield,
        title: "تركيب أجهزة الاستشعار",
        description: "تركيب أجهزة IoT ذكية للمراقبة المستمرة",
        color: "text-warning",
      },
      {
        icon: Bell,
        title: "الإنذار المبكر",
        description: "كشف المخاطر قبل وقوعها وإرسال تحذيرات فورية",
        color: "text-destructive",
      },
      {
        icon: BarChart3,
        title: "التحليل والتقارير",
        description: "تحليل البيانات وإعداد تقارير دورية عن حالة المبنى",
        color: "text-accent",
      },
    ]
  }
];

export const Process = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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

        <div className="space-y-12">
          {phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="space-y-8">
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-6 py-2">
                  {phase.phase}
                </Badge>
                <h3 className="text-2xl font-bold mt-4 mb-2">{phase.title}</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
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
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};