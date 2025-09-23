import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Shield, Smartphone, Globe, Cpu, Database } from "lucide-react";

const partners = [
  {
    icon: Globe,
    name: "وزارة الاتصالات وتكنولوجيا المعلومات",
    description: "الشريك التقني الرئيسي للتحول الرقمي",
    category: "حكومي"
  },
  {
    icon: Building2,
    name: "المركز القومي لبحوث الإسكان والبناء",
    description: "المرجع العلمي لكودات البناء والإنشاء",
    category: "بحثي"
  },
  {
    icon: Shield,
    name: "الحماية المدنية - وزارة الداخلية",
    description: "الجهة المختصة بالسلامة والأمان العام",
    category: "حكومي"
  },
  {
    icon: Building2,
    name: "وزارة الإسكان والمجتمعات العمرانية",
    description: "الجهة المنظمة لقطاع الإسكان والتعمير",
    category: "حكومي"
  },
  {
    icon: Cpu,
    name: "شركات الذكاء الاصطناعي المحلية",
    description: "تطوير حلول AI متقدمة للقطاع المصري",
    category: "تقني"
  },
  {
    icon: Smartphone,
    name: "شركات الاتصالات وإنترنت الأشياء",
    description: "توفير البنية التحتية للاتصالات والشبكات",
    category: "تقني"
  },
];

const categoryColors = {
  "حكومي": { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  "بحثي": { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
  "تقني": { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" }
};

export const Partners = () => {
  return (
    <section id="partners" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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
            لضمان تطبيق أفضل المعايير والممارسات
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {partner.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Vision 2030 Section */}
        <div className="mt-16 text-center">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-10" />
            <div className="relative bg-background/50 backdrop-blur-sm rounded-3xl border border-primary/20 p-8 md:p-12">
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
          </div>
        </div>
      </div>
    </section>
  );
};