import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Clock,
  BarChart3,
  FileCheck,
  Settings,
  Eye,
  RefreshCw,
  Filter,
  Search,
  X,
  Calendar,
  User,
  Building,
  Tag
} from 'lucide-react';

interface ComplianceRule {
  id: string;
  name: string;
  type: 'HIPAA' | 'FERPA' | 'SOX' | 'GDPR' | 'State';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'compliant' | 'warning' | 'violation';
}

interface DocumentAnalysis {
  id: string;
  fileName: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  complianceScore: number;
  violations: ComplianceRule[];
  warnings: ComplianceRule[];
  suggestions: string[];
  originalFormat: string;
  convertedFormat: string;
  processingTime: number;
}

interface ConversionTemplate {
  id: string;
  name: string;
  type: 'SOAP' | 'IEP' | 'Progress Note' | 'Treatment Plan' | 'Assessment';
  industry: 'Healthcare' | 'Education' | 'Mental Health' | 'Case Management';
  fields: string[];
  compliance: string[];
}

const ComplianceConverter: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentAnalysis[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ConversionTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'analyze' | 'convert' | 'history'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'warning' | 'violation'>('all');
  const [selectedDocument, setSelectedDocument] = useState<DocumentAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const complianceRules: ComplianceRule[] = [
    {
      id: '1',
      name: 'PHI Identification',
      type: 'HIPAA',
      description: 'Protected Health Information properly redacted',
      severity: 'critical',
      status: 'compliant'
    },
    {
      id: '2',
      name: 'Patient Consent Documentation',
      type: 'HIPAA',
      description: 'Patient consent for treatment documented',
      severity: 'high',
      status: 'warning'
    },
    {
      id: '3',
      name: 'Educational Records Privacy',
      type: 'FERPA',
      description: 'Student educational records properly protected',
      severity: 'high',
      status: 'compliant'
    }
  ];

  const conversionTemplates: ConversionTemplate[] = [
    {
      id: '1',
      name: 'SOAP Note Template',
      type: 'SOAP',
      industry: 'Healthcare',
      fields: ['Subjective', 'Objective', 'Assessment', 'Plan'],
      compliance: ['HIPAA', 'State Healthcare']
    },
    {
      id: '2',
      name: 'IEP Documentation',
      type: 'IEP',
      industry: 'Education',
      fields: ['Student Info', 'Goals', 'Services', 'Accommodations'],
      compliance: ['FERPA', 'IDEA']
    },
    {
      id: '3',
      name: 'Progress Note',
      type: 'Progress Note',
      industry: 'Mental Health',
      fields: ['Session Date', 'Duration', 'Interventions', 'Progress'],
      compliance: ['HIPAA', 'State Mental Health']
    }
  ];

  const mockDocuments: DocumentAnalysis[] = [
    {
      id: '1',
      fileName: 'patient_session_notes_01.pdf',
      uploadDate: new Date('2024-01-15'),
      status: 'completed',
      complianceScore: 92,
      violations: [],
      warnings: complianceRules.filter(r => r.status === 'warning'),
      suggestions: ['Consider adding treatment goals', 'Include patient response documentation'],
      originalFormat: 'PDF',
      convertedFormat: 'SOAP',
      processingTime: 45
    },
    {
      id: '2',
      fileName: 'student_iep_draft.docx',
      uploadDate: new Date('2024-01-14'),
      status: 'completed',
      complianceScore: 78,
      violations: complianceRules.filter(r => r.status === 'violation'),
      warnings: [],
      suggestions: ['Add parent consent documentation', 'Include assessment dates'],
      originalFormat: 'DOCX',
      convertedFormat: 'IEP',
      processingTime: 62
    }
  ];

  React.useEffect(() => {
    setDocuments(mockDocuments);
  }, []);

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newDocument: DocumentAnalysis = {
        id: Date.now().toString() + i,
        fileName: file.name,
        uploadDate: new Date(),
        status: 'processing',
        complianceScore: 0,
        violations: [],
        warnings: [],
        suggestions: [],
        originalFormat: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        convertedFormat: selectedTemplate?.type || 'Standard',
        processingTime: 0
      };

      setDocuments(prev => [newDocument, ...prev]);

      // Simulate processing
      setTimeout(() => {
        const randomScore = Math.floor(Math.random() * 30) + 70;
        const randomViolations = Math.random() > 0.7 ? complianceRules.filter(r => r.status === 'violation') : [];
        const randomWarnings = Math.random() > 0.5 ? complianceRules.filter(r => r.status === 'warning') : [];
        
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id 
            ? {
                ...doc,
                status: 'completed' as const,
                complianceScore: randomScore,
                violations: randomViolations,
                warnings: randomWarnings,
                suggestions: [
                  'Consider adding more detailed patient information',
                  'Include standardized assessment tools',
                  'Verify all required signatures are present'
                ],
                processingTime: Math.floor(Math.random() * 60) + 30
              }
            : doc
        ));
      }, 3000 + (i * 1000));
    }

    setIsProcessing(false);
  }, [selectedTemplate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const exportDocument = (document: DocumentAnalysis) => {
    // Simulate document export
    const blob = new Blob([`Compliance Report for ${document.fileName}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.fileName}_compliance_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'compliant' && doc.complianceScore >= 90) ||
      (filterStatus === 'warning' && doc.warnings.length > 0) ||
      (filterStatus === 'violation' && doc.violations.length > 0);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (score: number, violations: ComplianceRule[], warnings: ComplianceRule[]) => {
    if (violations.length > 0) return 'text-red-600 bg-red-50';
    if (warnings.length > 0) return 'text-yellow-600 bg-yellow-50';
    if (score >= 90) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (score: number, violations: ComplianceRule[], warnings: ComplianceRule[]) => {
    if (violations.length > 0) return <AlertTriangle className="w-4 h-4" />;
    if (warnings.length > 0) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                Compliance Converter
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Convert and validate documents for healthcare and education compliance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>HIPAA Certified</span>
              </div>
              <button className="btn-primary">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'Upload & Convert', icon: Upload },
              { id: 'analyze', label: 'Compliance Analysis', icon: BarChart3 },
              { id: 'convert', label: 'Template Converter', icon: FileCheck },
              { id: 'history', label: 'Document History', icon: Clock }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            {/* Template Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Conversion Template
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {conversionTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {template.industry}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {template.fields.join(', ')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.compliance.map((comp) => (
                        <span
                          key={comp}
                          className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed p-12 text-center transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload Documents for Compliance Conversion
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Drag and drop files here, or click to browse. Supports PDF, DOCX, TXT formats.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </>
                  )}
                </button>
                <button className="btn-secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  View Sample
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="compliant">Compliant</option>
                      <option value="warning">Warnings</option>
                      <option value="violation">Violations</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{doc.fileName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {doc.uploadDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {doc.processingTime}s
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusColor(doc.complianceScore, doc.violations, doc.warnings)
                      }`}>
                        {getStatusIcon(doc.complianceScore, doc.violations, doc.warnings)}
                        <span className="ml-1">
                          {doc.violations.length > 0 ? 'Violations' : 
                           doc.warnings.length > 0 ? 'Warnings' : 'Compliant'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {doc.complianceScore}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Details */}
                  {(doc.violations.length > 0 || doc.warnings.length > 0) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      {doc.violations.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                            Violations ({doc.violations.length})
                          </h4>
                          <div className="space-y-2">
                            {doc.violations.map((violation) => (
                              <div key={violation.id} className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                  <span className="font-medium text-red-700 dark:text-red-400">
                                    {violation.name}
                                  </span>
                                  <p className="text-sm text-red-600 dark:text-red-400">
                                    {violation.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {doc.warnings.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                            Warnings ({doc.warnings.length})
                          </h4>
                          <div className="space-y-2">
                            {doc.warnings.map((warning) => (
                              <div key={warning.id} className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                <div>
                                  <span className="font-medium text-yellow-700 dark:text-yellow-400">
                                    {warning.name}
                                  </span>
                                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    {warning.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      <button
                        onClick={() => exportDocument(doc)}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export Report
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{doc.originalFormat}</span>
                      <span>→</span>
                      <span>{doc.convertedFormat}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convert Tab */}
        {activeTab === 'convert' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Document Templates & Conversion Rules
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {conversionTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                        {template.industry}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Required Fields:</h5>
                        <div className="flex flex-wrap gap-2">
                          {template.fields.map((field) => (
                            <span
                              key={field}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Compliance Standards:</h5>
                        <div className="flex flex-wrap gap-2">
                          {template.compliance.map((comp) => (
                            <span
                              key={comp}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded"
                            >
                              <Shield className="w-3 h-3 inline mr-1" />
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="btn-secondary w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processing History
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{doc.fileName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Processed {doc.uploadDate.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Score: {doc.complianceScore}%</span>
                            <span>•</span>
                            <span>{doc.processingTime}s</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Compliance Analysis: {selectedDocument.fileName}
              </h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedDocument.complianceScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {selectedDocument.violations.length}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Violations</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {selectedDocument.warnings.length}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedDocument.processingTime}s
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Processing Time</div>
                </div>
              </div>

              {/* Suggestions */}
              {selectedDocument.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Improvement Suggestions
                  </h4>
                  <div className="space-y-2">
                    {selectedDocument.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {suggestion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceConverter;