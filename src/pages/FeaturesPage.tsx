import { Brain, Shield, Zap, FileCheck, Eye, Bell, Building2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "@/assets/logo-main.jpg";

const features = [
  {
    icon: Brain,
    title: "ذكاء اصطناعي متقدم",
    description: "تحليل الرسومات الهندسية تلقائياً وفقاً للكود المصري لحماية المنشآت من الحريق",
    color: "text-primary",
    bg: "bg-primary/10",
    details: "نستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل الرسومات الهندسية ومقارنتها مع الكود المصري لحماية المنشآت من أخطار الحريق. النظام قادر على اكتشاف المخالفات والثغرات الأمنية بدقة عالية."
  },
  {
    icon: FileCheck,
    title: "مراجعة فورية للمخططات",
    description: "مراجعة سريعة ودقيقة للرسومات الهندسية مع إصدار تقارير مفصلة بالمطابقة والمخالفات",
    color: "text-success",
    bg: "bg-success/10",
    details: "نوفر مراجعة فورية للمخططات الهندسية مع إصدار تقارير شاملة توضح نقاط المطابقة والمخالفات. النظام يقدم توصيات محددة لتحسين التصميم وضمان الامتثال للكود المصري."
  },
  {
    icon: Eye,
    title: "استشعار مسبق للمخاطر",
    description: "أنظمة IoT ذكية للكشف المبكر عن مخاطر الحريق قبل وقوعها مع تحليل نوع الخطر",
    color: "text-warning",
    bg: "bg-warning/10",
    details: "نستخدم أجهزة استشعار متطورة تعمل بتقنية إنترنت الأشياء للكشف المبكر عن مخاطر الحريق. النظام يحلل البيانات في الوقت الفعلي ويتنبأ بالمخاطر المحتملة قبل وقوعها."
  },
  {
    icon: Bell,
    title: "إنذار مبكر ذكي",
    description: "إرسال تحذيرات فورية للحماية المدنية مع تحديد الموقع الدقيق وطبيعة الخطر",
    color: "text-destructive",
    bg: "bg-destructive/10",
    details: "عند اكتشاف أي خطر محتمل، يقوم النظام بإرسال إنذارات فورية للحماية المدنية مع تحديد الموقع الدقيق وطبيعة الخطر. هذا يضمن الاستجابة السريعة وإنقاذ الأرواح والممتلكات."
  },
  {
    icon: Zap,
    title: "تسريع التراخيص",
    description: "تقليل وقت مراجعة التراخيص بنسبة 90% من خلال الأتمتة الذكية للعمليات",
    color: "text-accent",
    bg: "bg-accent/10",
    details: "نقلل وقت مراجعة التراخيص بنسبة 90% من خلال أتمتة العمليات باستخدام الذكاء الاصطناعي. هذا يساعد في تسريع عجلة التنمية والاستثمار في مصر."
  },
  {
    icon: Shield,
    title: "حماية شاملة",
    description: "نظام متكامل للحماية من الحريق يغطي جميع مراحل المبنى من التصميم إلى التشغيل",
    color: "text-secondary",
    bg: "bg-secondary/10",
    details: "نوفر نظام حماية متكامل يغطي جميع مراحل المبنى من مرحلة التصميم والترخيص إلى مرحلة التشغيل والمراقبة المستمرة. هذا يضمن أعلى مستويات الأمان طوال دورة حياة المبنى."
  },
  {
    icon: Building2,
    title: "إدارة المباني الذكية",
    description: "نظام إدارة متطور للمباني مع مراقبة مستمرة وتحليل المخاطر بالذكاء الاصطناعي",
    color: "text-primary",
    bg: "bg-primary/10",
    details: "نوفر نظام إدارة متطور للمباني يتضمن مراقبة مستمرة وتحليل المخاطر باستخدام الذكاء الاصطناعي. النظام يوفر رؤى قيمة لتحسين أداء المبنى وضمان سلامة شاغليه."
  },
  {
    icon: Users,
    title: "تعاون الجهات الحكومية",
    description: "ربط مباشر مع المحليات والحماية المدنية لضمان التنسيق الفعال والاستجابة السريعة",
    color: "text-success",
    bg: "bg-success/10",
    details: "نعمل على ربط النظام مباشرة مع الجهات الحكومية المختصة مثل المحليات والحماية المدنية. هذا يضمن التنسيق الفعال والاستجابة السريعة في حالات الطوارئ."
  },
];

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">المميزات الرئيسية</h1>
              <p className="text-muted-foreground mt-1">
                تقنيات متطورة لحماية شاملة للمنشآت المصرية
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
            والحماية للمنشآت المصرية ضمن رؤية مصر 2030
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.details}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">جاهز للبدء؟</h3>
              <p className="text-muted-foreground mb-6">
                انضم إلى منصة الحماية الذكي وابدأ في حماية مشروعك من أخطار الحريق
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/register">ابدأ الآن</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">تواصل معنا</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
