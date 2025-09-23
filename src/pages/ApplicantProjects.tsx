import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fireCodeDB } from '../data/fireCodeDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Plus, 
  Eye, 
  Download, 
  Edit, 
  FileText, 
  Calendar, 
  MapPin, 
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplicantProjects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    if (user?.id) {
      const userProjects = fireCodeDB.getProjectsByApplicant(user.id);
      setProjects(userProjects);
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />مرفوض</Badge>;
      case 'needs_revision':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />يحتاج تعديل</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />قيد المراجعة</Badge>;
      case 'submitted':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />تم الإرسال</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />مسودة</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'needs_revision':
        return 'text-yellow-600';
      case 'under_review':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/applicant/project/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/applicant/project/${projectId}/edit`);
  };

  const handleDownloadReport = (projectId: string) => {
    // محاكاة تحميل التقرير
    console.log('تحميل تقرير المشروع:', projectId);
  };

  const handleDownloadLicense = (projectId: string) => {
    // محاكاة تحميل الترخيص
    console.log('تحميل ترخيص المشروع:', projectId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل المشاريع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">مشاريعي</h1>
            <p className="text-muted-foreground">
              عرض وإدارة مشاريعك المرسلة للمراجعة
            </p>
          </div>
          <Button onClick={() => navigate('/applicant/submit-project')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            مشروع جديد
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد مشاريع</h3>
                <p className="text-muted-foreground mb-6">
                  لم تقم بإرسال أي مشاريع للمراجعة بعد
                </p>
                <Button onClick={() => navigate('/applicant/submit-project')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  إرسال مشروع جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.projectName}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building className="h-4 w-4" />
                        {project.buildingType}
                      </CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.submissionDate).toLocaleDateString('ar-EG')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {project.drawings.length} رسم
                    </div>
                    
                    {project.reviewReport && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">نسبة المطابقة:</span>
                          <span className={`font-semibold ${getStatusColor(project.status)}`}>
                            {project.reviewReport.complianceScore}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProject(project.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                      
                      {project.status === 'needs_revision' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project.id)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          تعديل
                        </Button>
                      )}
                      
                      {project.reviewReport && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(project.id)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          تقرير
                        </Button>
                      )}
                      
                      {project.license && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadLicense(project.id)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          ترخيص
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={loadProjects} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              تحديث القائمة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantProjects;
