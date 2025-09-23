import { Shield, Mail, Phone, MapPin, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logoImage from "@/assets/logo-main.jpg";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={logoImage} 
                  alt="منصة الحماية الذكي للمنشآت المصرية"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">منصة حماية المنشآت</h3>
                <p className="text-sm text-secondary-foreground/80">فريق مستدامون</p>
              </div>
            </div>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              نحو مدن مصرية أكثر أماناً وذكاءً ضمن رؤية مصر 2030 للتحول الرقمي 
              وحماية المنشآت من أخطار الحريق
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-secondary-foreground/80 hover:text-white transition-colors text-sm">المميزات</Link></li>
              <li><Link to="/how-it-works" className="text-secondary-foreground/80 hover:text-white transition-colors text-sm">كيف يعمل</Link></li>
              <li><Link to="/partners" className="text-secondary-foreground/80 hover:text-white transition-colors text-sm">الشركاء</Link></li>
              <li><Link to="/contact" className="text-secondary-foreground/80 hover:text-white transition-colors text-sm">تواصل معنا</Link></li>
            </ul>
          </div>

          {/* Team Members */}
          <div>
            <h4 className="font-semibold text-lg mb-6">فريق العمل</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li>محمد مجدي محمد - قائد الفريق</li>
              <li>محمد هشام غرابة</li>
              <li>باهر صلاح الدين</li>
              <li>فاطمة حسام عبد اللطيف</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-6">تواصل معنا</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-secondary-foreground/80">
                <Mail className="w-4 h-4 text-accent" />
                <span>info@fireprotection-eg.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-secondary-foreground/80">
                <Phone className="w-4 h-4 text-accent" />
                <span dir="ltr">+20 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-secondary-foreground/80">
                <MapPin className="w-4 h-4 text-accent" />
                <span>القاهرة الجديدة، مصر</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" size="icon" className="w-9 h-9 border-secondary-foreground/20 hover:bg-white/10">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="w-9 h-9 border-secondary-foreground/20 hover:bg-white/10">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/60 text-center md:text-right">
            © 2024 منصة حماية المنشآت المصرية - فريق مستدامون. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-6 text-sm text-secondary-foreground/60">
            <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
            <Link to="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};