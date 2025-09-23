import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Brain, Zap, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/fire-alarm-system.jpg";
import logoImage from "@/assets/logo-main.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-subtle overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="relative z-10 space-y-8">
            <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20">
              <img 
                src={logoImage} 
                alt="رؤية مصر 2030"
                className="w-4 h-4 ml-2 object-contain"
              />
              رؤية مصر 2030 - التحول الرقمي
            </Badge>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  الذكاء الاصطناعي
                </span>
                <br />
                لحماية المنشآت المصرية
                <br />
                <span className="text-2xl sm:text-3xl lg:text-4xl text-muted-foreground font-medium">
                  من أخطار الحريق
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                منصة متطورة تعتمد على الذكاء الاصطناعي لمراجعة تراخيص المباني وحمايتها من أخطار الحريق، 
                مع أنظمة إنذار مبكر لضمان سلامة الأرواح والممتلكات
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/register">
                  ابدأ الآن
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/login">
                  تسجيل الدخول
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">90%</div>
                <div className="text-sm text-muted-foreground">تسريع الترخيص</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">99.9%</div>
                <div className="text-sm text-muted-foreground">دقة الكشف</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">مراقبة مستمرة</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="نظام إنذار الحريق المتطور في المباني المصرية مع الذكاء الاصطناعي"
                className="w-full h-auto rounded-2xl shadow-elegant hover:shadow-2xl transition-all duration-500 hover:scale-105"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center shadow-secondary animate-bounce">
              <Zap className="w-8 h-8 text-white" />
            </div>

            <div className="absolute top-1/2 -left-8 w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};