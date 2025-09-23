import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Shield, Smartphone, Globe, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "@/assets/logo-main.jpg";

const partners = [
  {
    icon: Globe,
    name: "وزارة الاتصالات وتكنولوجيا المعلومات",
    description: "الشريك التقني الرئيسي للتحول الرقمي",
    category: "حكومي",
    role: "توفير البنية التحتية التقنية ودعم التحول الرقمي"
  },
  {
    icon: Building2,
    name: "المركز القومي لبحوث الإسكان والبناء",
    description: "المرجع العلمي لكودات البناء والإنشاء",
    category: "بحثي",
    role: "تطوير الكودات والمعايير الفنية لحماية المنشآت"
  },
  {
    icon: Shield,
    name: "الحماية المدنية - وزارة الداخلية",
    description: "الجهة المختصة بالسلامة والأمان العام",
    category: "حكومي",
    role: "التنسيق في حالات الطوارئ والاستجابة السريعة"
  },
  {
    icon: Building2,
    name: "وزارة الإسكان والمجتمعات العمرانية",
    description: "الجهة المنظمة لقطاع الإسكان والتعمير",
    category: "حكومي",
    role: "تنظيم قطاع البناء والتشييد ووضع السياسات"
  },
  {
    icon: Cpu,
    name: "شركات الذكاء الاصطناعي المحلية",
    description: "تطوير حلول AI متقدمة للقطاع المصري",
    category: "تقني",
    role: "تطوير تقنيات الذكاء الاصطناعي المتخصصة"
  },
  {
    icon: Smartphone,
    name: "شركات الاتصالات وإنترنت الأشياء",
    description: "توفير البنية التحتية للاتصالات والشبكات",
    category: "تقني",
    role: "توفير شبكات الاتصالات وأجهزة إنترنت الأشياء"
  },
];

const categoryColors = {
  "حكومي": { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  "بحثي": { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
  "تقني": { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" }
};

export const PartnersPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">الشركاء والجهات المتعاونة</h1>
              <p className="text-muted-foreground mt-1">
                شراكات استراتيجية لتحقيق النجاح والتميز
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
          <Badge variant="outline" className="mb-4 bg-accent/10 text-accent border-accent/20">
            الشركاء والجهات المتعاونة
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              شراكات استراتيجية
            </span>
            {" "}لتحقيق النجاح
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            نعمل مع أبرز الجهات الحكومية والمؤسسات البحثية والشركات التقنية 
            لضمان تطبيق أفضل المعايير والممارسات في حماية المنشآت المصرية
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {partners.map((partner, index) => {
            const Icon = partner.icon;
            const colors = categoryColors[partner.category as keyof typeof categoryColors];
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-background/60 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {partner.category}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                        {partner.name}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {partner.description}
                      </p>

                      <div className="border-t pt-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong>الدور:</strong> {partner.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Vision 2030 Section */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto shadow-elegant">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">
                  ضمن إطار رؤية مصر 2030
                </h3>
                
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  يأتي هذا المشروع متماشياً مع الإستراتيجية القومية للمدن الذكية والمستدامة، 
                  ومبادرات التحول الرقمي الشامل في الخدمات الحكومية لتحقيق مدن مصرية أكثر أماناً وذكاءً
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">2030</div>
                    <div className="text-sm text-muted-foreground">رؤية مصر</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success mb-1">100%</div>
                    <div className="text-sm text-muted-foreground">تحول رقمي</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">AI</div>
                    <div className="text-sm text-muted-foreground">تقنية متقدمة</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6">فريق العمل</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">قائد الفريق</h4>
                  <p className="text-muted-foreground">محمد مجدي محمد</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">أعضاء الفريق</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>محمد هشام غرابة</p>
                    <p>باهر صلاح الدين</p>
                    <p>فاطمة حسام عبد اللطيف</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">انضم إلى شبكة الشركاء</h3>
              <p className="text-muted-foreground mb-6">
                هل تريد أن تصبح شريكاً في هذا المشروع الرائد؟ تواصل معنا لاستكشاف فرص التعاون
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/contact">تواصل معنا</Link>
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
