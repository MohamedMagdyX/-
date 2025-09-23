// قاعدة بيانات محلية للمستخدمين
export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'applicant' | 'admin';
  createdAt: string;
  isVerified: boolean;
}

// الحساب الأساسي للأدمن
const ADMIN_ACCOUNT: UserData = {
  id: 'admin-001',
  name: 'أدمن النظام',
  email: 'admin@safe-egypt.com',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
  isVerified: true
};

// الحساب التجريبي لمقدم الطلب
const APPLICANT_ACCOUNT: UserData = {
  id: 'applicant-001',
  name: 'مقدم الطلب التجريبي',
  email: 'applicant@example.com',
  password: '123456',
  role: 'applicant',
  createdAt: new Date().toISOString(),
  isVerified: true
};

// قاعدة البيانات المحلية
class MockDatabase {
  private users: UserData[] = [];
  private currentUser: UserData | null = null;

  constructor() {
    this.init();
  }

  // تهيئة قاعدة البيانات
  private init(): void {
    // تحميل البيانات من localStorage
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    } else {
      // إضافة الحسابات الأساسية إذا لم تكن هناك بيانات محفوظة
      this.users = [ADMIN_ACCOUNT, APPLICANT_ACCOUNT];
      this.saveUsers();
    }

    // ضمان وجود حساب الأدمن دائماً وبنفس البريد
    const hasAdmin = this.users.some(u => u.email === ADMIN_ACCOUNT.email && u.role === 'admin');
    if (!hasAdmin) {
      this.users.push(ADMIN_ACCOUNT);
      this.saveUsers();
    }

    // تحميل المستخدم الحالي
    const currentUserId = localStorage.getItem('current_user_id');
    if (currentUserId) {
      this.currentUser = this.users.find(user => user.id === currentUserId) || null;
    }
  }

  // حفظ المستخدمين في localStorage
  private saveUsers(): void {
    localStorage.setItem('app_users', JSON.stringify(this.users));
  }

  // إضافة مستخدم جديد
  addUser(user: Omit<UserData, 'id' | 'createdAt' | 'isVerified'>): UserData {
    // منع إنشاء حسابات أدمن جديدة
    if (user.role === 'admin') {
      throw new Error('Admin registration is disabled');
    }
    const newUser: UserData = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isVerified: false
    };
    
    this.users.push(newUser);
    this.saveUsers(); // حفظ البيانات في localStorage
    return newUser;
  }

  // البحث عن مستخدم بالبريد الإلكتروني
  findUserByEmail(email: string): UserData | undefined {
    return this.users.find(user => user.email === email);
  }

  // البحث عن مستخدم بالمعرف
  findUserById(id: string): UserData | undefined {
    return this.users.find(user => user.id === id);
  }

  // التحقق من بيانات تسجيل الدخول
  authenticateUser(email: string, password: string): UserData | null {
    const user = this.findUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // التحقق من وجود البريد الإلكتروني
  isEmailExists(email: string): boolean {
    return this.users.some(user => user.email === email);
  }

  // الحصول على جميع المستخدمين
  getAllUsers(): UserData[] {
    return [...this.users];
  }

  // تعيين المستخدم الحالي
  setCurrentUser(user: UserData | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('current_user_id', user.id);
    } else {
      localStorage.removeItem('current_user_id');
    }
  }

  // الحصول على المستخدم الحالي
  getCurrentUser(): UserData | null {
    return this.currentUser;
  }

  // تسجيل الخروج
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('current_user_id');
  }

  // تحديث بيانات المستخدم
  updateUser(userId: string, updatedData: Partial<UserData>): UserData | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return null;
    }

    // تحديث البيانات
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updatedData,
      id: userId, // التأكد من عدم تغيير الـ ID
    };

    // تحديث المستخدم الحالي إذا كان هو نفسه
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = this.users[userIndex];
    }

    // حفظ التغييرات
    this.saveUsers();
    
    return this.users[userIndex];
  }

  // إحصائيات المستخدمين
  getUserStats(): { total: number; applicants: number; admins: number } {
    return {
      total: this.users.length,
      applicants: this.users.filter(u => u.role === 'applicant').length,
      admins: this.users.filter(u => u.role === 'admin').length
    };
  }
}

// إنشاء instance واحد من قاعدة البيانات
export const mockDB = new MockDatabase();

// تصدير الحسابات الأساسية للاستخدام في التطبيق
export { ADMIN_ACCOUNT, APPLICANT_ACCOUNT };
