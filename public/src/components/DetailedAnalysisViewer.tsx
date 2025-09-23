import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  FileText,
  Brain,
  Search,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Eye,
  Download,
  RefreshCw,
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Layers,
  Activity,
  Database,
  Cpu,
  HardDrive,
  Network,
  Monitor,
  MousePointer,
  Keyboard,
  Wifi,
  Bluetooth,
  Battery,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  Copy,
  Paste,
  Cut,
  Undo,
  Redo,
  Save,
  Trash2,
  Edit,
  Plus,
  Minus,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Home,
  Menu,
  User,
  Users,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  AlertCircle,
  Bell,
  BellOff,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Bookmark,
  Flag,
  Archive,
  Inbox,
  Send,
  Reply,
  Forward,
  Trash,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FilePdf,
  FileWord,
  FileZip,
  Cloud,
  CloudUpload,
  CloudDownload,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  SignalMax
} from 'lucide-react';

interface DetailedStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'warning';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  details: {
    subSteps: SubStep[];
    metrics: Metric[];
    logs: LogEntry[];
    errors: ErrorEntry[];
    warnings: WarningEntry[];
  };
  result?: any;
}

interface SubStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
  details?: string;
}

interface Metric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'debug' | 'warn' | 'error';
  message: string;
  source: string;
  data?: any;
}

interface ErrorEntry {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  suggestion: string;
}

interface WarningEntry {
  code: string;
  message: string;
  category: 'performance' | 'compatibility' | 'security' | 'quality';
  suggestion: string;
}

interface DetailedAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  classification: string;
  overallStatus: string;
  complianceScore: number;
  processingTime: number;
  steps: DetailedStep[];
  summary: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    warningsCount: number;
    errorsCount: number;
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
  };
  detectedElements: {
    category: string;
    elements: {
      name: string;
      confidence: number;
      location?: { x: number; y: number; width: number; height: number };
      properties: { [key: string]: any };
    }[];
  }[];
  complianceAnalysis: {
    ruleId: string;
    ruleTitle: string;
    category: string;
    severity: 'critical' | 'major' | 'minor';
    status: 'compliant' | 'non_compliant' | 'needs_attention';
    description: string;
    suggestedFix: string;
    evidence: {
      type: 'text' | 'image' | 'measurement' | 'calculation';
      content: string;
      confidence: number;
    }[];
    impact: {
      safety: number;
      cost: number;
      timeline: string;
      complexity: 'low' | 'medium' | 'high';
    };
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    benefits: string[];
    implementation: {
      steps: string[];
      resources: string[];
      timeline: string;
      cost: string;
    };
  }[];
  technicalDetails: {
    processingEngine: string;
    aiModel: string;
    version: string;
    confidence: number;
    accuracy: number;
    performance: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
  };
}

interface DetailedAnalysisViewerProps {
  analysis: DetailedAnalysis;
  onClose?: () => void;
  onExport?: () => void;
  onReanalyze?: () => void;
}

const DetailedAnalysisViewer: React.FC<DetailedAnalysisViewerProps> = ({
  analysis,
  onClose,
  onExport,
  onReanalyze
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'severity' | 'category'>('time');

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'major':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'minor':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">{analysis.fileName}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(analysis.fileSize)} • {analysis.fileType} • {analysis.classification}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
            <Button variant="outline" size="sm" onClick={onReanalyze}>
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة تحليل
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              إغلاق
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="steps">خطوات المعالجة</TabsTrigger>
              <TabsTrigger value="elements">العناصر المكتشفة</TabsTrigger>
              <TabsTrigger value="compliance">فحص المطابقة</TabsTrigger>
              <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
              <TabsTrigger value="technical">التفاصيل التقنية</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {/* نظرة عامة */}
              <TabsContent value="overview" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  {/* ملخص النتائج */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        ملخص النتائج
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <div className="text-3xl font-bold text-primary mb-2">
                            {analysis.complianceScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">درجة الامتثال</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {analysis.summary.completedSteps}
                          </div>
                          <p className="text-sm text-muted-foreground">خطوات مكتملة</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-3xl font-bold text-yellow-600 mb-2">
                            {analysis.summary.totalIssues}
                          </div>
                          <p className="text-sm text-muted-foreground">إجمالي المشاكل</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatDuration(analysis.processingTime)}
                          </div>
                          <p className="text-sm text-muted-foreground">وقت المعالجة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* حالة المشاكل */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        حالة المشاكل
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm">مشاكل حرجة</span>
                          </div>
                          <Badge variant="destructive">{analysis.summary.criticalIssues}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">مشاكل كبيرة</span>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {analysis.summary.majorIssues}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">مشاكل صغيرة</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {analysis.summary.minorIssues}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* التفاصيل التقنية */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        التفاصيل التقنية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">محرك المعالجة</p>
                          <p className="font-medium">{analysis.technicalDetails.processingEngine}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">نموذج الذكاء الاصطناعي</p>
                          <p className="font-medium">{analysis.technicalDetails.aiModel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الإصدار</p>
                          <p className="font-medium">{analysis.technicalDetails.version}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">مستوى الثقة</p>
                          <p className="font-medium">{analysis.technicalDetails.confidence}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* خطوات المعالجة */}
              <TabsContent value="steps" className="h-full overflow-auto">
                <div className="p-6 space-y-4">
                  {analysis.steps.map((step, index) => (
                    <Card key={step.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            {getStatusIcon(step.status)}
                            <div>
                              <CardTitle className="text-lg">{step.name}</CardTitle>
                              <CardDescription>{step.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {step.duration && (
                              <Badge variant="outline">{formatDuration(step.duration)}</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStepExpansion(step.id)}
                            >
                              {expandedSteps.includes(step.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <Progress value={step.progress} className="mt-2" />
                      </CardHeader>
                      
                      {expandedSteps.includes(step.id) && (
                        <CardContent className="space-y-4">
                          {/* الخطوات الفرعية */}
                          {step.details.subSteps.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">الخطوات الفرعية</h4>
                              <div className="space-y-2">
                                {step.details.subSteps.map((subStep) => (
                                  <div key={subStep.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      {getStatusIcon(subStep.status)}
                                      <span className="text-sm">{subStep.name}</span>
                                    </div>
                                    {subStep.duration && (
                                      <Badge variant="outline" className="text-xs">
                                        {formatDuration(subStep.duration)}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* المقاييس */}
                          {step.details.metrics.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">المقاييس</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.details.metrics.map((metric, idx) => (
                                  <div key={idx} className="p-3 bg-muted rounded">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{metric.name}</span>
                                      <Badge variant={
                                        metric.status === 'good' ? 'default' :
                                        metric.status === 'warning' ? 'secondary' : 'destructive'
                                      }>
                                        {metric.value} {metric.unit}
                                      </Badge>
                                    </div>
                                    {metric.target && (
                                      <Progress 
                                        value={(metric.value / metric.target) * 100} 
                                        className="h-2" 
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* السجلات */}
                          {step.details.logs.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">سجل المعالجة</h4>
                              <ScrollArea className="h-40 w-full">
                                <div className="space-y-1">
                                  {step.details.logs.map((log, idx) => (
                                    <div key={idx} className={`text-xs p-2 rounded ${
                                      log.level === 'error' ? 'bg-red-50 text-red-700' :
                                      log.level === 'warn' ? 'bg-yellow-50 text-yellow-700' :
                                      'bg-gray-50 text-gray-700'
                                    }`}>
                                      <span className="text-muted-foreground">
                                        {log.timestamp.toLocaleTimeString()}
                                      </span>
                                      <span className="mx-2">[{log.level.toUpperCase()}]</span>
                                      <span>{log.message}</span>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          )}

                          {/* الأخطاء */}
                          {step.details.errors.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 text-red-600">الأخطاء</h4>
                              <div className="space-y-2">
                                {step.details.errors.map((error, idx) => (
                                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-red-800">{error.code}</span>
                                      <Badge variant="destructive">{error.severity}</Badge>
                                    </div>
                                    <p className="text-sm text-red-700 mb-2">{error.message}</p>
                                    <p className="text-xs text-red-600">
                                      <strong>اقتراح:</strong> {error.suggestion}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* التحذيرات */}
                          {step.details.warnings.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 text-yellow-600">التحذيرات</h4>
                              <div className="space-y-2">
                                {step.details.warnings.map((warning, idx) => (
                                  <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-yellow-800">{warning.code}</span>
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        {warning.category}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-yellow-700 mb-2">{warning.message}</p>
                                    <p className="text-xs text-yellow-600">
                                      <strong>اقتراح:</strong> {warning.suggestion}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* العناصر المكتشفة */}
              <TabsContent value="elements" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  {analysis.detectedElements.map((category, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Layers className="h-5 w-5 mr-2" />
                          {category.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {category.elements.map((element, idx) => (
                            <div key={idx} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{element.name}</h4>
                                <Badge variant="outline">
                                  {(element.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>
                              {element.location && (
                                <div className="text-xs text-muted-foreground mb-2">
                                  الموقع: ({element.location.x}, {element.location.y}) 
                                  الحجم: {element.location.width}×{element.location.height}
                                </div>
                              )}
                              <div className="space-y-1">
                                {Object.entries(element.properties).map(([key, value]) => (
                                  <div key={key} className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* فحص المطابقة */}
              <TabsContent value="compliance" className="h-full overflow-auto">
                <div className="p-6 space-y-4">
                  {analysis.complianceAnalysis.map((rule, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <AlertTriangle className="h-5 w-5 mr-2" />
                              {rule.ruleTitle}
                            </CardTitle>
                            <CardDescription>{rule.description}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Badge className={getSeverityColor(rule.severity)}>
                              {rule.severity}
                            </Badge>
                            <Badge variant={
                              rule.status === 'compliant' ? 'default' :
                              rule.status === 'non_compliant' ? 'destructive' : 'secondary'
                            }>
                              {rule.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">الحل المقترح</h4>
                          <p className="text-sm bg-blue-50 p-3 rounded border-r-4 border-blue-200">
                            {rule.suggestedFix}
                          </p>
                        </div>

                        {rule.evidence.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">الأدلة</h4>
                            <div className="space-y-2">
                              {rule.evidence.map((evidence, idx) => (
                                <div key={idx} className="p-3 bg-muted rounded">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline">{evidence.type}</Badge>
                                    <Badge variant="secondary">
                                      {(evidence.confidence * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                  <p className="text-sm">{evidence.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium mb-3">تأثير المشكلة</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-muted rounded">
                              <div className="text-lg font-bold text-red-600">{rule.impact.safety}</div>
                              <p className="text-xs text-muted-foreground">مستوى السلامة</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded">
                              <div className="text-lg font-bold text-green-600">{rule.impact.cost}</div>
                              <p className="text-xs text-muted-foreground">التكلفة</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded">
                              <div className="text-lg font-bold text-blue-600">{rule.impact.timeline}</div>
                              <p className="text-xs text-muted-foreground">الجدول الزمني</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded">
                              <div className="text-lg font-bold text-purple-600">{rule.impact.complexity}</div>
                              <p className="text-xs text-muted-foreground">التعقيد</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* التوصيات */}
              <TabsContent value="recommendations" className="h-full overflow-auto">
                <div className="p-6 space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{rec.title}</CardTitle>
                          <Badge variant={
                            rec.priority === 'high' ? 'destructive' :
                            rec.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {rec.priority}
                          </Badge>
                        </div>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">الفوائد</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {rec.benefits.map((benefit, idx) => (
                              <li key={idx}>{benefit}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">خطوات التنفيذ</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm">
                            {rec.implementation.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">الموارد المطلوبة</h4>
                            <ul className="text-sm space-y-1">
                              {rec.implementation.resources.map((resource, idx) => (
                                <li key={idx}>• {resource}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">الجدول الزمني</h4>
                            <p className="text-sm">{rec.implementation.timeline}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">التكلفة</h4>
                            <p className="text-sm">{rec.implementation.cost}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* التفاصيل التقنية */}
              <TabsContent value="technical" className="h-full overflow-auto">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Cpu className="h-5 w-5 mr-2" />
                        معلومات النظام
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">محرك المعالجة</p>
                          <p className="font-medium">{analysis.technicalDetails.processingEngine}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">نموذج الذكاء الاصطناعي</p>
                          <p className="font-medium">{analysis.technicalDetails.aiModel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الإصدار</p>
                          <p className="font-medium">{analysis.technicalDetails.version}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">مستوى الثقة</p>
                          <p className="font-medium">{analysis.technicalDetails.confidence}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        أداء النظام
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">استخدام المعالج</span>
                            <span className="text-sm">{analysis.technicalDetails.performance.cpu}%</span>
                          </div>
                          <Progress value={analysis.technicalDetails.performance.cpu} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">استخدام الذاكرة</span>
                            <span className="text-sm">{analysis.technicalDetails.performance.memory}%</span>
                          </div>
                          <Progress value={analysis.technicalDetails.performance.memory} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">استخدام القرص</span>
                            <span className="text-sm">{analysis.technicalDetails.performance.disk}%</span>
                          </div>
                          <Progress value={analysis.technicalDetails.performance.disk} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">استخدام الشبكة</span>
                            <span className="text-sm">{analysis.technicalDetails.performance.network}%</span>
                          </div>
                          <Progress value={analysis.technicalDetails.performance.network} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Database className="h-5 w-5 mr-2" />
                        إحصائيات المعالجة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {analysis.summary.totalSteps}
                          </div>
                          <p className="text-xs text-blue-600">إجمالي الخطوات</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {analysis.summary.completedSteps}
                          </div>
                          <p className="text-xs text-green-600">خطوات مكتملة</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            {analysis.summary.failedSteps}
                          </div>
                          <p className="text-xs text-red-600">خطوات فاشلة</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600 mb-1">
                            {analysis.summary.warningsCount}
                          </div>
                          <p className="text-xs text-yellow-600">تحذيرات</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysisViewer;
