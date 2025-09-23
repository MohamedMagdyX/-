import { Shield, Menu, Building2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import logoImage from "@/assets/logo-main.jpg";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={logoImage} 
                    alt="منصة الحماية الذكي للمنشآت المصرية"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    منصة حماية المنشآت
                  </h1>
                  <p className="text-xs text-muted-foreground">الذكاء الاصطناعي لحماية المباني</p>
                </div>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={logoImage} 
                    alt="منصة الحماية الذكي للمنشآت المصرية"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    منصة حماية المنشآت
                  </h1>
                  <p className="text-xs text-muted-foreground">الذكاء الاصطناعي لحماية المباني</p>
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              المميزات
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              كيف يعمل
            </Link>
            <Link to="/partners" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              الشركاء
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              تواصل معنا
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {user.role === 'admin' ? 'أدمن' : 'مقدم طلب'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                    لوحة التحكم
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  خروج
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/register">إنشاء حساب</Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};