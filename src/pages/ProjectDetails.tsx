import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fireCodeDB } from '../data/fireCodeDatabase';
import { autoReviewSystem } from '../services/autoReviewService';
import { pdfReportGenerator } from '../services/pdfReportService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  ArrowLeft,
  FileText, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Building,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
  Info
} from 'lucide-react';

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = () => {
    if (projectId) {
      const projectData = fireCodeDB.getProjectById(projectId);
      setProject(projectData);
      
      if (projectData?.reviewReport) {
        setReviewReport(projectData.reviewReport);
      }
    }
    setIsLoading(false);
  };

  const handleDownloadReport = async () => {
    if (!projectId) return;
    
    try {
      const pdfPath = await pdfReportGenerator.generateReviewReportPDF(projectId);
      pdfReportGenerator.downloadPDF(pdfPath, `تقرير-${project?.projectName}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDownloadLicense = async () => {
    if (!projectId) return;
    
    try {
      const pdfPath = await pdfReportGenerator.generateLicensePDF(projectId);
      pdfReportGenerator.downloadPDF(pdfPath, `ترخيص-${project?.projectName}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error downloading license:', error);
    }
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'major':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'major':
        return 'text-yellow-600';
      case 'minor':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل تفاصيل المشروع...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">المشروع غير موجود</h2>
              <p className="text-muted-foreground mb-4">
                لم يتم العثور على المشروع المطلوب
              </p>
              <Button onClick={() => navigate('/applicant/projects')}>
                العودة للمشاريع
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/applicant/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للمشاريع
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{project.projectName}</h1>
            <div className="flex items-center gap-4">
              {getStatusBadge(project.status)}
              <span className="text-muted-foreground">
                تم الإرسال: {new Date(project.submissionDate).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  معلومات المشروع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">نوع المبنى:</span>
                      <span>{project.buildingType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">الموقع:</span>
                      <span>{project.location}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">المساحة:</span>
                      <span>{project.area} متر مربع</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">الطوابق:</span>
                      <span>{project.floors} طابق</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drawings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  الرسومات المرفوعة
                </CardTitle>
                <CardDescription>
                  {project.drawings.length} رسم مرفوع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.drawings.map((drawing: any, index: number) => (
                    <div key={drawing.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{drawing.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {(drawing.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(drawing.status)}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Results */}
            {reviewReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    نتائج المراجعة
                  </CardTitle>
                  <CardDescription>
                    تقرير المراجعة التلقائية للرسومات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">نسبة المطابقة:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={reviewReport.complianceScore} className="w-32" />
                        <span className="font-bold">{reviewReport.complianceScore}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{reviewReport.criticalIssues}</div>
                        <div className="text-sm text-red-600">مخالفات حرجة</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{reviewReport.majorIssues}</div>
                        <div className="text-sm text-yellow-600">مخالفات كبيرة</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{reviewReport.minorIssues}</div>
                        <div className="text-sm text-blue-600">مخالفات صغيرة</div>
                      </div>
                    </div>

                    {reviewReport.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">التوصيات:</h4>
                        <ul className="space-y-2">
                          {reviewReport.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!reviewReport && (
                  <Button 
                    onClick={handleAutoReview}
                    disabled={isReviewing}
                    className="w-full"
                  >
                    {isReviewing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        جاري المراجعة...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        بدء المراجعة التلقائية
                      </>
                    )}
                  </Button>
                )}

                {reviewReport && (
                  <>
                    <Button variant="outline" className="w-full" onClick={handleDownloadReport}>
                      <Download className="h-4 w-4 mr-2" />
                      تحميل التقرير
                    </Button>
                    
                    {project.status === 'approved' && project.license && (
                      <Button variant="outline" className="w-full" onClick={handleDownloadLicense}>
                        <Download className="h-4 w-4 mr-2" />
                        تحميل الترخيص
                      </Button>
                    )}
                    
                    {project.status === 'needs_revision' && (
                      <Button className="w-full" onClick={() => navigate(`/applicant/project/${projectId}/edit`)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        تعديل المشروع
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card>
              <CardHeader>
                <CardTitle>حالة المشروع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">الحالة الحالية:</span>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  {project.reviewDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">تاريخ المراجعة:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(project.reviewDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                  
                  {project.approvalDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">تاريخ الموافقة:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(project.approvalDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
