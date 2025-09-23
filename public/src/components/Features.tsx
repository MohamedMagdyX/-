import { Brain, Shield, Zap, FileCheck, Eye, Bell, Building2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "ذكاء اصطناعي متقدم",
    description: "تحليل الرسومات الهندسية تلقائياً وفقاً للكود المصري لحماية المنشآت من الحريق",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FileCheck,
    title: "مراجعة فورية للمخططات",
    description: "مراجعة سريعة ودقيقة للرسومات الهندسية مع إصدار تقارير مفصلة بالمطابقة والمخالفات",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Eye,
    title: "استشعار مسبق للمخاطر",
    description: "أنظمة IoT ذكية للكشف المبكر عن مخاطر الحريق قبل وقوعها مع تحليل نوع الخطر",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Bell,
    title: "إنذار مبكر ذكي",
    description: "إرسال تحذيرات فورية للحماية المدنية مع تحديد الموقع الدقيق وطبيعة الخطر",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: Zap,
    title: "تسريع التراخيص",
    description: "تقليل وقت مراجعة التراخيص بنسبة 90% من خلال الأتمتة الذكية للعمليات",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "حماية شاملة",
    description: "نظام متكامل للحماية من الحريق يغطي جميع مراحل المبنى من التصميم إلى التشغيل",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Building2,
    title: "إدارة المباني الذكية",
    description: "نظام إدارة متطور للمباني مع مراقبة مستمرة وتحليل المخاطر بالذكاء الاصطناعي",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "تعاون الجهات الحكومية",
    description: "ربط مباشر مع المحليات والحماية المدنية لضمان التنسيق الفعال والاستجابة السريعة",
    color: "text-success",
    bg: "bg-success/10",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            المميزات الرئيسية
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              تقنيات متطورة
            </span>
            {" "}لحماية شاملة
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            منصة متكاملة تجمع بين الذكاء الاصطناعي وإنترنت الأشياء لضمان أعلى مستويات الأمان
            والحماية للمنشآت المصرية
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-background/60 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};