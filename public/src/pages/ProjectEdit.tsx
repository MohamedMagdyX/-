import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fireCodeDB } from '../data/fireCodeDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft,
  Upload, 
  FileText, 
  Building, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';

const ProjectEdit: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [projectData, setProjectData] = useState({
    projectName: '',
    buildingType: '',
    location: '',
    area: '',
    floors: '',
    description: ''
  });

  const [drawings, setDrawings] = useState<File[]>([]);
  const [drawingTypes, setDrawingTypes] = useState<string[]>([]);
  const [existingDrawings, setExistingDrawings] = useState<any[]>([]);

  const buildingTypes = [
    'سكني',
    'تجاري',
    'صناعي',
    'تعليمي',
    'صحي',
    'إداري',
    'ترفيهي'
  ];

  const drawingTypeOptions = [
    'المخططات المعمارية',
    'المخططات الإنشائية',
    'مخططات الكهرباء',
    'مخططات السباكة',
    'مخططات التكييف',
    'مخططات الحريق',
    'المخططات الطبوغرافية',
    'مخططات الموقع'
  ];

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = () => {
    if (projectId) {
      const projectData = fireCodeDB.getProjectById(projectId);
      if (projectData) {
        setProject(projectData);
        setProjectData({
          projectName: projectData.projectName,
          buildingType: projectData.buildingType,
          location: projectData.location,
          area: projectData.area.toString(),
          floors: projectData.floors.toString(),
          description: projectData.description || ''
        });
        setExistingDrawings(projectData.drawings || []);
      }
    }
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setDrawings(prev => [...prev, ...files]);
    
    const newTypes = files.map(() => '');
    setDrawingTypes(prev => [...prev, ...newTypes]);
  };

  const handleDrawingTypeChange = (index: number, type: string) => {
    const newTypes = [...drawingTypes];
    newTypes[index] = type;
    setDrawingTypes(newTypes);
  };

  const removeDrawing = (index: number) => {
    setDrawings(prev => prev.filter((_, i) => i !== index));
    setDrawingTypes(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDrawing = (drawingId: string) => {
    setExistingDrawings(prev => prev.filter(d => d.id !== drawingId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // التحقق من البيانات
      if (!projectData.projectName || !projectData.buildingType || !projectData.location || !projectData.area || !projectData.floors) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (drawingTypes.some(type => !type)) {
        setError('يرجى تحديد نوع كل رسم جديد');
        return;
      }

      // تحديث بيانات المشروع
      if (project) {
        project.projectName = projectData.projectName;
        project.buildingType = projectData.buildingType;
        project.location = projectData.location;
        project.area = parseFloat(projectData.area);
        project.floors = parseInt(projectData.floors);
        project.description = projectData.description;
        project.status = 'submitted'; // إعادة إرسال للمراجعة
        project.drawings = existingDrawings; // الاحتفاظ بالرسومات الموجودة
      }

      // إضافة الرسومات الجديدة
      drawings.forEach((drawing, index) => {
        if (project) {
          fireCodeDB.addDrawing(project.id, {
            projectId: project.id,
            fileName: drawing.name,
            fileType: drawing.type,
            fileSize: drawing.size
          });
        }
      });

      setIsSuccess(true);
      
      // الانتقال لصفحة المشاريع بعد ثانيتين
      setTimeout(() => {
        navigate('/applicant/projects');
      }, 2000);

    } catch (error) {
      setError('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsSaving(false);
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
      default:
        return <Badge className="bg-gray-100 text-gray-800"><RefreshCw className="h-3 w-3 mr-1" />قيد المراجعة</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل بيانات المشروع...</p>
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">تم حفظ التعديلات بنجاح!</h2>
              <p className="text-muted-foreground mb-4">
                تم حفظ تعديلات المشروع وإعادة إرساله للمراجعة.
              </p>
              <p className="text-sm text-muted-foreground">
                سيتم توجيهك لصفحة المشاريع خلال لحظات...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(`/applicant/project/${projectId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للتفاصيل
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">تعديل المشروع</h1>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">{project.projectName}</span>
              {getStatusBadge(project.status)}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              تعديل بيانات المشروع
            </CardTitle>
            <CardDescription>
              قم بتعديل البيانات المطلوبة وإضافة رسومات جديدة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">اسم المشروع *</Label>
                  <Input
                    id="projectName"
                    value={projectData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="أدخل اسم المشروع"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingType">نوع المبنى *</Label>
                  <Select value={projectData.buildingType} onValueChange={(value) => handleInputChange('buildingType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المبنى" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الموقع *</Label>
                  <Input
                    id="location"
                    value={projectData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="أدخل موقع المشروع"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">المساحة (متر مربع) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={projectData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="أدخل المساحة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors">عدد الطوابق *</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={projectData.floors}
                    onChange={(e) => handleInputChange('floors', e.target.value)}
                    placeholder="أدخل عدد الطوابق"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف المشروع</Label>
                <Textarea
                  id="description"
                  value={projectData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="أدخل وصفاً مختصراً للمشروع"
                  rows={3}
                />
              </div>

              {/* الرسومات الموجودة */}
              {existingDrawings.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">الرسومات الموجودة</h3>
                  </div>

                  <div className="space-y-2">
                    {existingDrawings.map((drawing, index) => (
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
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeExistingDrawing(drawing.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* الرسومات الجديدة */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">إضافة رسومات جديدة</h3>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">اسحب وأفلت الرسومات هنا أو اضغط للاختيار</p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.dwg,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button" variant="outline">
                      اختر الرسومات
                    </Button>
                  </Label>
                </div>

                {drawings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">الرسومات الجديدة:</h4>
                    {drawings.map((drawing, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{drawing.name}</p>
                            <p className="text-sm text-gray-500">
                              {(drawing.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={drawingTypes[index]}
                            onValueChange={(value) => handleDrawingTypeChange(index, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="نوع الرسم" />
                            </SelectTrigger>
                            <SelectContent>
                              {drawingTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDrawing(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      حفظ التعديلات
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/applicant/project/${projectId}`)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectEdit;
