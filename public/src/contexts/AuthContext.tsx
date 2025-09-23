import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDB, ADMIN_ACCOUNT } from '../data/mockDatabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'applicant' | 'admin';
  avatar?: string;
  createdAt?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'applicant' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحقق من وجود مستخدم مسجل دخوله في قاعدة البيانات المحلية
    const currentUser = mockDB.getCurrentUser();
    if (currentUser) {
      const userData: User = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        createdAt: currentUser.createdAt,
        isVerified: currentUser.isVerified
      };
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      // محاكاة API call - في التطبيق الحقيقي سيكون هذا API حقيقي
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // التحقق من صحة البيانات
      if (!email || !password) {
        return { success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
      }

      if (!email.includes('@')) {
        return { success: false, message: 'يرجى إدخال بريد إلكتروني صحيح' };
      }

      if (password.length < 6) {
        return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
      }
      
      // البحث عن المستخدم في قاعدة البيانات المحلية
      const foundUser = mockDB.authenticateUser(email, password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          createdAt: foundUser.createdAt,
          isVerified: foundUser.isVerified
        };
        
        setUser(userData);
        mockDB.setCurrentUser(foundUser);
        setIsLoading(false);
        return { success: true, message: 'تم تسجيل الدخول بنجاح' };
      } else {
        setIsLoading(false);
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      // منع تسجيل أدمن
      if (userData.role === 'admin') {
        setIsLoading(false);
        return { success: false, message: 'تسجيل الأدمن غير مسموح. استخدم الحساب الثابت.' };
      }

      // التحقق من صحة البيانات
      if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
        return { success: false, message: 'يرجى ملء جميع الحقول المطلوبة' };
      }

      if (!userData.email.includes('@')) {
        return { success: false, message: 'يرجى إدخال بريد إلكتروني صحيح' };
      }

      if (userData.password.length < 6) {
        return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
      }

      if (userData.password !== userData.confirmPassword) {
        return { success: false, message: 'كلمة المرور غير متطابقة' };
      }

      if (userData.name.length < 2) {
        return { success: false, message: 'الاسم يجب أن يكون حرفين على الأقل' };
      }

      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // التحقق من عدم وجود المستخدم مسبقاً
      if (mockDB.isEmailExists(userData.email)) {
        return { success: false, message: 'هذا البريد الإلكتروني مستخدم بالفعل' };
      }
      
      // إضافة المستخدم الجديد إلى قاعدة البيانات المحلية
      const newUser = mockDB.addUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'applicant'
      });
      
      setIsLoading(false);
      return { success: true, message: 'تم إنشاء الحساب بنجاح' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى' };
    }
  };

  const logout = () => {
    setUser(null);
    mockDB.logout();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};