import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Process } from "@/components/Process";
import { Partners } from "@/components/Partners";
import { Footer } from "@/components/Footer";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // إذا كان المستخدم مسجل دخوله، يتم توجيهه للوحة التحكم
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  // إذا كان المستخدم مسجل دخوله، لا تعرض الصفحة الرئيسية
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Process />
        <Partners />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
