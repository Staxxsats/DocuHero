import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Download,
  Share2,
  Edit,
  Trash2,
  FileText,
  Image,
  File,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Tag,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  Copy,
  ExternalLink,
  Printer,
  MessageSquare,
  Star,
  Bookmark,
  Settings,
  RefreshCw,
  Archive,
  Send,
  Lock,
  Unlock
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'image' | 'audio' | 'video';
  category: 'SOAP' | 'IEP' | 'Progress Note' | 'Assessment' | 'Report' | 'Other';
  size: string;
  createdDate: Date;
  modifiedDate: Date;
  author: string;
  organization: string;
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'archived';
  complianceScore: number;
  isEncrypted: boolean;
  hasComments: boolean;
  isBookmarked: boolean;
  shareSettings: {
    isShared: boolean;
    sharedWith: string[];
    permissions: 'view' | 'edit' | 'admin';
  };
  content?: string;
  thumbnailUrl?: string;
  metadata: {
    pageCount?: number;
    wordCount?: number;
    duration?: string;
    resolution?: string;
  };
}

interface Comment {
  id: string;
  documentId: string;
  author: string;
  content: string;
  timestamp: Date;
  position?: { page: number; x: number; y: number };
  resolved: boolean;
  replies: Comment[];
}

interface DocumentPreviewProps {
  documentId?: string;
  onClose?: () => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onShare?: (document: Document) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentId,
  onClose,
  onEdit,
  onDelete,
  onShare
}) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Mock document data
  const mockDocument: Document = {
    id: documentId || '1',
    title: 'Patient Assessment - John Doe - Session 03',
    type: 'pdf',
    category: 'SOAP',
    size: '2.4 MB',
    createdDate: new Date('2024-01-15T10:30:00'),
    modifiedDate: new Date('2024-01-20T14:45:00'),
    author: 'Dr. Sarah Johnson',
    organization: 'Metro Health Center',
    tags: ['patient-care', 'assessment', 'follow-up', 'therapy'],
    status: 'approved',
    complianceScore: 96,
    isEncrypted: true,
    hasComments: true,
    isBookmarked: false,
    shareSettings: {
      isShared: true,
      sharedWith: ['colleague@example.com', 'supervisor@example.com'],
      permissions: 'view'
    },
    content: `
      SUBJECTIVE:
      Patient reports feeling "much better" since last session. Sleep quality has improved significantly - now getting 7-8 hours per night compared to 3-4 hours previously. Anxiety levels have decreased from 8/10 to 4/10 on patient-reported scale. Patient states they are using the breathing techniques practiced in previous sessions and finding them helpful during stressful situations at work.

      OBJECTIVE:
      Patient appears more relaxed and well-rested compared to previous sessions. Speech is clearer and more organized. Eye contact is appropriate and sustained. Patient demonstrates proper breathing technique when prompted. Vital signs: BP 120/80, HR 72, Temp 98.6°F. Patient completed anxiety screening questionnaire with score of 12/63 (previously 28/63).

      ASSESSMENT:
      Generalized Anxiety Disorder (F41.1) - Patient showing significant improvement with current treatment plan. Response to cognitive behavioral therapy techniques has been excellent. Sleep hygiene education has been effective. Patient demonstrates good understanding of coping strategies and is implementing them successfully in daily life.

      PLAN:
      1. Continue weekly CBT sessions for next 4 weeks
      2. Maintain current sleep hygiene practices
      3. Patient to continue daily breathing exercises
      4. Schedule follow-up anxiety assessment in 2 weeks
      5. Consider reducing session frequency to bi-weekly if continued improvement
      6. Patient provided with emergency contact information
      7. Next appointment scheduled for January 27, 2024 at 2:00 PM

      Provider: Dr. Sarah Johnson, Licensed Clinical Psychologist
      Date: January 20, 2024
      Session Duration: 50 minutes
      Next Appointment: January 27, 2024
    `,
    metadata: {
      pageCount: 3,
      wordCount: 247
    }
  };

  const mockComments: Comment[] = [
    {
      id: '1',
      documentId: '1',
      author: 'Dr. Michael Wilson',
      content: 'Excellent progress documentation. The improvement in sleep quality is particularly noteworthy.',
      timestamp: new Date('2024-01-20T16:20:00'),
      resolved: false,
      replies: [
        {
          id: '2',
          documentId: '1',
          author: 'Dr. Sarah Johnson',
          content: 'Thank you for the feedback. The patient has been very compliant with the sleep hygiene recommendations.',
          timestamp: new Date('2024-01-20T16:45:00'),
          resolved: false,
          replies: []
        }
      ]
    },
    {
      id: '3',
      documentId: '1',
      author: 'Supervisor',
      content: 'Please ensure all future assessments include the standardized anxiety scale scores for consistency.',
      timestamp: new Date('2024-01-21T09:15:00'),
      resolved: true,
      replies: []
    }
  ];

  useEffect(() => {
    setDocument(mockDocument);
    setComments(mockComments);
  }, [documentId]);

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'archived':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'docx':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'image':
        return <Image className="w-6 h-6 text-green-600" />;
      default:
        return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (document) {
      // Simulate download
      const blob = new Blob([document.content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleBookmark = () => {
    if (document) {
      setDocument(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/documents/${document?.id}`);
    // Show toast notification
  };

  const handlePrint = () => {
    window.print();
  };

  const addComment = (content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      documentId: document?.id || '',
      author: 'Current User',
      content,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };
    setComments(prev => [...prev, newComment]);
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  const containerClass = isFullscreen 
    ? "fixed inset-0 bg-white dark:bg-gray-900 z-50"
    : "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {getFileIcon(document.type)}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-md">
              {document.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {document.author}
              </span>
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {document.organization}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {document.modifiedDate.toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                {document.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-48"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded transition-colors ${
              document.isBookmarked 
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`p-2 rounded transition-colors relative ${
              showComments 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {document.hasComments && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded transition-colors ${
              showMetadata 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Document Stats Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4 mr-1" />
                {document.metadata.pageCount} pages
              </span>
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <Edit className="w-4 h-4 mr-1" />
                {document.metadata.wordCount} words
              </span>
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4 mr-1" />
                Compliance: {document.complianceScore}%
              </span>
              {document.isEncrypted && (
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <Lock className="w-4 h-4 mr-1" />
                  Encrypted
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">
                Page {currentPage} of {document.metadata.pageCount}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(document.metadata.pageCount || 1, prev + 1))}
                disabled={currentPage === document.metadata.pageCount}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Preview */}
          <div 
            ref={previewRef}
            className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900"
            style={{ zoom: `${zoomLevel}%` }}
          >
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 min-h-full">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {document.content}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showComments || showMetadata) && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowComments(true)}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  showComments 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Comments ({comments.length})
              </button>
              <button
                onClick={() => setShowComments(false)}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  !showComments 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Details
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {showComments ? (
                /* Comments Section */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">Comments</h3>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      Add Comment
                    </button>
                  </div>
                  
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {comment.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {comment.content}
                      </p>
                      {comment.resolved && (
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolved
                        </div>
                      )}
                      {comment.replies.length > 0 && (
                        <div className="mt-2 ml-4 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-white dark:bg-gray-600 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-xs text-gray-900 dark:text-white">
                                  {reply.author}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {reply.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Metadata Section */
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Document Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="text-gray-900 dark:text-white">{document.type.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="text-gray-900 dark:text-white">{document.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Size:</span>
                        <span className="text-gray-900 dark:text-white">{document.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="text-gray-900 dark:text-white">{document.createdDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Modified:</span>
                        <span className="text-gray-900 dark:text-white">{document.modifiedDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Sharing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`${
                          document.shareSettings.isShared 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {document.shareSettings.isShared ? 'Shared' : 'Private'}
                        </span>
                      </div>
                      {document.shareSettings.isShared && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Permissions:</span>
                            <span className="text-gray-900 dark:text-white capitalize">
                              {document.shareSettings.permissions}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Shared with:</span>
                            <div className="mt-1 space-y-1">
                              {document.shareSettings.sharedWith.map((email, index) => (
                                <div key={index} className="text-xs text-gray-900 dark:text-white">
                                  {email}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => onEdit?.(document)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Document
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </button>
                      <button
                        onClick={() => onDelete?.(document)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Document
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Document
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Share with email
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="colleague@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button className="btn-primary">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permission level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="view">View only</option>
                  <option value="edit">Can edit</option>
                  <option value="admin">Full access</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Public link</span>
                  <button
                    onClick={handleCopyLink}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;