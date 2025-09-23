import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fireCodeDB } from '../data/fireCodeDatabase';
import { pdfReportGenerator } from '../services/pdfReportService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplicantReports: React.FC = () => {
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
      // عرض المشاريع التي لها تقارير فقط
      const projectsWithReports = userProjects.filter(project => project.reviewReport);
      setProjects(projectsWithReports);
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
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />تم الإرسال</Badge>;
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

  const handleDownloadReport = async (projectId: string, projectName: string) => {
    try {
      const pdfPath = await pdfReportGenerator.generateReviewReportPDF(projectId);
      pdfReportGenerator.downloadPDF(pdfPath, `تقرير-${projectName}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDownloadLicense = async (projectId: string, projectName: string) => {
    try {
      const pdfPath = await pdfReportGenerator.generateLicensePDF(projectId);
      pdfReportGenerator.downloadPDF(pdfPath, `ترخيص-${projectName}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error downloading license:', error);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/applicant/project/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/applicant/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للوحة التحكم
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">التقارير والتراخيص</h1>
            <p className="text-muted-foreground">
              عرض وتحميل تقارير المراجعة والتراخيص
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد تقارير</h3>
                <p className="text-muted-foreground mb-6">
                  لم يتم إنشاء أي تقارير للمشاريع بعد
                </p>
                <Button onClick={() => navigate('/applicant/projects')} className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  عرض المشاريع
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
                      <Calendar className="h-4 w-4" />
                      {new Date(project.submissionDate).toLocaleDateString('ar-EG')}
                    </div>
                    
                    {project.reviewReport && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">نسبة المطابقة:</span>
                          <span className={`font-semibold ${getStatusColor(project.status)}`}>
                            {project.reviewReport.complianceScore}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">تاريخ التقرير:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(project.reviewReport.generatedDate).toLocaleDateString('ar-EG')}
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
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(project.id, project.projectName)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        تقرير
                      </Button>
                      
                      {project.license && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadLicense(project.id, project.projectName)}
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

export default ApplicantReports;
