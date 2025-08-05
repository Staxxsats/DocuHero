import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  FileCheck,
  Loader2,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface ServicePlan {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error' | 'pending';
  progress: number;
  patientName?: string;
  serviceDate?: string;
  provider?: string;
  errors?: string[];
  warnings?: string[];
}

interface ServicePlanUploadProps {
  onPlanUploaded?: (plan: ServicePlan) => void;
  onPlanProcessed?: (plan: ServicePlan) => void;
}

const ServicePlanUpload: React.FC<ServicePlanUploadProps> = ({
  onPlanUploaded,
  onPlanProcessed
}) => {
  const [uploadedPlans, setUploadedPlans] = useState<ServicePlan[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    'PDF', 'DOC', 'DOCX', 'TXT', 'RTF'
  ];

  const planTypes = [
    { id: 'home-health', label: 'Home Health', color: 'bg-blue-100 text-blue-800' },
    { id: 'assisted-living', label: 'Assisted Living', color: 'bg-green-100 text-green-800' },
    { id: 'skilled-nursing', label: 'Skilled Nursing', color: 'bg-purple-100 text-purple-800' },
    { id: 'behavioral-health', label: 'Behavioral Health', color: 'bg-orange-100 text-orange-800' },
    { id: 'rehabilitation', label: 'Rehabilitation', color: 'bg-red-100 text-red-800' }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension && ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension);
    });

    if (validFiles.length === 0) {
      alert('Please upload valid document files (PDF, DOC, DOCX, TXT, RTF)');
      return;
    }

    setIsProcessing(true);

    for (const file of validFiles) {
      const newPlan: ServicePlan = {
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: detectPlanType(file.name),
        size: file.size,
        uploadedAt: new Date(),
        status: 'processing',
        progress: 0
      };

      setUploadedPlans(prev => [...prev, newPlan]);
      onPlanUploaded?.(newPlan);

      // Simulate processing with progress updates
      await processServicePlan(newPlan, file);
    }

    setIsProcessing(false);
  };

  const detectPlanType = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('home') || name.includes('hha')) return 'home-health';
    if (name.includes('assisted') || name.includes('al')) return 'assisted-living';
    if (name.includes('skilled') || name.includes('snf')) return 'skilled-nursing';
    if (name.includes('behavioral') || name.includes('mental')) return 'behavioral-health';
    if (name.includes('rehab') || name.includes('therapy')) return 'rehabilitation';
    return 'home-health'; // default
  };

  const processServicePlan = async (plan: ServicePlan, file: File): Promise<void> => {
    try {
      // Simulate processing stages
      const stages = [
        { progress: 20, message: 'Uploading file...' },
        { progress: 40, message: 'Extracting text...' },
        { progress: 60, message: 'Analyzing content...' },
        { progress: 80, message: 'Validating compliance...' },
        { progress: 100, message: 'Processing complete' }
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        setUploadedPlans(prev => prev.map(p => 
          p.id === plan.id 
            ? { ...p, progress: stage.progress }
            : p
        ));
      }

      // Simulate processing results
      const processingResults = await simulateProcessing(file);
      
      setUploadedPlans(prev => prev.map(p => 
        p.id === plan.id 
          ? { 
              ...p, 
              status: processingResults.success ? 'completed' : 'error',
              progress: 100,
              patientName: processingResults.patientName,
              serviceDate: processingResults.serviceDate,
              provider: processingResults.provider,
              errors: processingResults.errors,
              warnings: processingResults.warnings
            }
          : p
      ));

      if (processingResults.success) {
        const completedPlan = {
          ...plan,
          status: 'completed' as const,
          progress: 100,
          ...processingResults
        };
        onPlanProcessed?.(completedPlan);
      }

    } catch (error) {
      setUploadedPlans(prev => prev.map(p => 
        p.id === plan.id 
          ? { 
              ...p, 
              status: 'error',
              progress: 100,
              errors: ['Processing failed: ' + (error as Error).message]
            }
          : p
      ));
    }
  };

  const simulateProcessing = async (file: File) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock processing results
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      patientName: success ? 'John Smith' : undefined,
      serviceDate: success ? '2024-01-15' : undefined,
      provider: success ? 'Dr. Sarah Johnson' : undefined,
      errors: success ? [] : ['Invalid document format', 'Missing required fields'],
      warnings: success ? ['Some fields may need verification'] : []
    };
  };

  const removePlan = (planId: string) => {
    setUploadedPlans(prev => prev.filter(p => p.id !== planId));
  };

  const retryProcessing = async (planId: string) => {
    const plan = uploadedPlans.find(p => p.id === planId);
    if (!plan) return;

    setUploadedPlans(prev => prev.map(p => 
      p.id === planId 
        ? { ...p, status: 'processing', progress: 0, errors: [], warnings: [] }
        : p
    ));

    // Simulate retry with file (mock file object)
    const mockFile = new File([''], plan.name, { type: 'application/pdf' });
    await processServicePlan(plan, mockFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ServicePlan['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPlanTypeColor = (type: string) => {
    const planType = planTypes.find(pt => pt.id === type);
    return planType?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Service Plan Upload
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and process healthcare service plans with AI-powered analysis
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.rtf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Drop service plans here or click to browse
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Supports: {supportedFormats.join(', ')} • Max 10MB per file
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isProcessing}
          >
            <FileText className="w-4 h-4 mr-2" />
            Choose Files
          </button>
        </div>
      </div>

      {/* Supported Plan Types */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Supported Plan Types
        </h3>
        <div className="flex flex-wrap gap-2">
          {planTypes.map(type => (
            <span
              key={type.id}
              className={`px-3 py-1 rounded-full text-sm font-medium ${type.color}`}
            >
              {type.label}
            </span>
          ))}
        </div>
      </div>

      {/* Uploaded Plans List */}
      {uploadedPlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Uploaded Plans ({uploadedPlans.length})
          </h3>
          
          <div className="space-y-3">
            {uploadedPlans.map(plan => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(plan.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatFileSize(plan.size)}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPlanTypeColor(plan.type)}`}>
                          {planTypes.find(pt => pt.id === plan.type)?.label || plan.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {plan.status === 'completed' && (
                      <>
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {plan.status === 'error' && (
                      <button
                        onClick={() => retryProcessing(plan.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => removePlan(plan.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {plan.status === 'processing' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Processing...</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Plan Details */}
                {plan.status === 'completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {plan.patientName && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Patient:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {plan.patientName}
                        </span>
                      </div>
                    )}
                    {plan.serviceDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Service Date:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {plan.serviceDate}
                        </span>
                      </div>
                    )}
                    {plan.provider && (
                      <div className="flex items-center space-x-2">
                        <FileCheck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {plan.provider}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Errors and Warnings */}
                {(plan.errors?.length || plan.warnings?.length) && (
                  <div className="mt-4 space-y-2">
                    {plan.errors?.map((error, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    ))}
                    {plan.warnings?.map((warning, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Stats */}
      {uploadedPlans.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Processing Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {uploadedPlans.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {uploadedPlans.filter(p => p.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {uploadedPlans.filter(p => p.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {uploadedPlans.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePlanUpload;