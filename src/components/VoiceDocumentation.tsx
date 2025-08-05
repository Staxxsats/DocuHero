import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  FileText, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  User, 
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Edit3,
  Eye,
  Archive,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Copy
} from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import TranscriptEditor from './TranscriptEditor';

interface PatientInfo {
  id: string;
  name: string;
  dateOfBirth: string;
  medicalRecordNumber: string;
  insurance?: string;
}

interface SessionData {
  id: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  sessionType: 'evaluation' | 'treatment' | 'progress_note' | 'discharge' | 'consultation';
  provider: string;
  location: string;
  audioUrl?: string;
  transcript: string;
  structuredNote: string;
  status: 'draft' | 'review' | 'signed' | 'submitted';
  billable: boolean;
  cptCodes: string[];
  diagnosis: string[];
  createdAt: string;
  updatedAt: string;
}

interface VoiceDocumentationProps {
  patientId?: string;
  sessionType?: SessionData['sessionType'];
  onSave?: (sessionData: SessionData) => void;
  onSubmit?: (sessionData: SessionData) => void;
  className?: string;
}

export default function VoiceDocumentation({
  patientId,
  sessionType = 'progress_note',
  onSave,
  onSubmit,
  className = ''
}: VoiceDocumentationProps) {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [transcript, setTranscript] = useState('');
  const [structuredNote, setStructuredNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'transcript' | 'note'>('record');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    autoSave: true,
    realTimeTranscription: true,
    structureFormat: 'SOAP',
    includeTimestamps: true,
    enableSpellCheck: true
  });

  // Initialize session
  useEffect(() => {
    initializeSession();
    if (patientId) {
      loadPatientInfo(patientId);
    }
  }, [patientId, sessionType]);

  // Auto-save functionality
  useEffect(() => {
    if (settings.autoSave && currentSession && (transcript || structuredNote)) {
      const timeoutId = setTimeout(() => {
        autoSaveSession();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [transcript, structuredNote, settings.autoSave, currentSession]);

  const initializeSession = () => {
    const now = new Date();
    const session: SessionData = {
      id: `session_${Date.now()}`,
      patientId: patientId || '',
      date: now.toISOString().split('T')[0],
      startTime: now.toTimeString().slice(0, 8),
      duration: 0,
      sessionType,
      provider: 'Current User', // This should come from auth context
      location: 'Clinic', // This should be configurable
      transcript: '',
      structuredNote: '',
      status: 'draft',
      billable: true,
      cptCodes: [],
      diagnosis: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setCurrentSession(session);
  };

  const loadPatientInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) throw new Error('Failed to load patient info');
      
      const patient = await response.json();
      setPatientInfo(patient);
    } catch (error: any) {
      setError(`Failed to load patient information: ${error.message}`);
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob, duration: number, initialTranscript?: string) => {
    setIsProcessing(true);
    setError('');

    try {
      // Upload audio file
      const audioFormData = new FormData();
      audioFormData.append('audio', audioBlob, `${currentSession?.id}_audio.webm`);
      audioFormData.append('sessionId', currentSession?.id || '');

      const uploadResponse = await fetch('/api/voice-recordings/upload', {
        method: 'POST',
        body: audioFormData,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload audio');

      const { audioUrl } = await uploadResponse.json();

      // Update session with audio data
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          duration,
          audioUrl,
          transcript: initialTranscript || transcript,
          endTime: new Date().toTimeString().slice(0, 8),
          updatedAt: new Date().toISOString()
        };

        setCurrentSession(updatedSession);
        setTranscript(initialTranscript || transcript);

        // Process structured note if we have transcript
        if (initialTranscript || transcript) {
          await generateStructuredNote(initialTranscript || transcript);
        }
      }

      setSuccess('Recording completed successfully!');
      setActiveTab('transcript');

    } catch (error: any) {
      setError(`Recording processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript);
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        transcript: newTranscript,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const generateStructuredNote = async (transcriptText: string) => {
    if (!transcriptText.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/structure-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText,
          sessionType: currentSession?.sessionType,
          format: settings.structureFormat,
          patientInfo: patientInfo,
          includeTimestamps: settings.includeTimestamps
        }),
      });

      if (!response.ok) throw new Error('Failed to generate structured note');

      const { structuredNote: generatedNote, cptCodes, diagnosis } = await response.json();
      
      setStructuredNote(generatedNote);
      
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          structuredNote: generatedNote,
          cptCodes: cptCodes || [],
          diagnosis: diagnosis || [],
          updatedAt: new Date().toISOString()
        });
      }

      setActiveTab('note');
      
    } catch (error: any) {
      setError(`Failed to generate structured note: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const autoSaveSession = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch('/api/sessions/autosave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentSession),
      });

      if (!response.ok) throw new Error('Auto-save failed');
      
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  };

  const saveSession = async () => {
    if (!currentSession) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentSession,
          transcript,
          structuredNote,
          status: 'review'
        }),
      });

      if (!response.ok) throw new Error('Failed to save session');

      const savedSession = await response.json();
      setCurrentSession(savedSession);
      setSuccess('Session saved successfully!');
      
      if (onSave) {
        onSave(savedSession);
      }

    } catch (error: any) {
      setError(`Failed to save session: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const submitSession = async () => {
    if (!currentSession) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/sessions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentSession,
          transcript,
          structuredNote,
          status: 'submitted'
        }),
      });

      if (!response.ok) throw new Error('Failed to submit session');

      const submittedSession = await response.json();
      setCurrentSession(submittedSession);
      setSuccess('Session submitted successfully!');
      
      if (onSubmit) {
        onSubmit(submittedSession);
      }

    } catch (error: any) {
      setError(`Failed to submit session: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const exportSession = () => {
    if (!currentSession) return;

    const exportData = {
      ...currentSession,
      transcript,
      structuredNote,
      patientInfo
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${currentSession.id}_${currentSession.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSessionTypeColor = (type: SessionData['sessionType']) => {
    const colors = {
      evaluation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      treatment: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      progress_note: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      discharge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      consultation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[type] || colors.progress_note;
  };

  const getStatusColor = (status: SessionData['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      signed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Voice Documentation Session
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{currentSession?.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{currentSession?.startTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{currentSession?.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentSession && (
              <>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(currentSession.sessionType)}`}>
                  {currentSession.sessionType.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentSession.status)}`}>
                  {currentSession.status.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Patient Info */}
        {patientInfo && (
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {patientInfo.name}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">DOB:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{patientInfo.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">MRN:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{patientInfo.medicalRecordNumber}</span>
              </div>
              {patientInfo.insurance && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Insurance:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{patientInfo.insurance}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'record', label: 'Record', icon: Mic },
            { id: 'transcript', label: 'Transcript', icon: FileText },
            { id: 'note', label: 'Structured Note', icon: Edit3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'record' && (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onTranscriptUpdate={handleTranscriptUpdate}
            enableTranscription={settings.realTimeTranscription}
            maxDuration={1800} // 30 minutes
          />
        )}

        {activeTab === 'transcript' && (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcript</h3>
              <div className="flex items-center space-x-2">
                {isProcessing && (
                  <>
                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                    <span className="text-sm text-primary-600 dark:text-primary-400">Processing...</span>
                  </>
                )}
                {transcript && (
                  <button
                    onClick={() => generateStructuredNote(transcript)}
                    disabled={isProcessing}
                    className="btn-primary text-sm"
                  >
                    Generate Note
                  </button>
                )}
              </div>
            </div>

            <TranscriptEditor
              value={transcript}
              onChange={setTranscript}
              enableSpellCheck={settings.enableSpellCheck}
              placeholder="Transcript will appear here as you record, or you can type directly..."
              className="min-h-96"
            />
          </div>
        )}

        {activeTab === 'note' && (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Structured Note ({settings.structureFormat})
              </h3>
              <div className="flex items-center space-x-2">
                {isProcessing && (
                  <>
                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                    <span className="text-sm text-primary-600 dark:text-primary-400">Generating...</span>
                  </>
                )}
              </div>
            </div>

            <TranscriptEditor
              value={structuredNote}
              onChange={setStructuredNote}
              enableSpellCheck={settings.enableSpellCheck}
              placeholder="Structured note will be generated from your transcript..."
              className="min-h-96"
            />

            {/* CPT Codes and Diagnosis */}
            {currentSession && (currentSession.cptCodes.length > 0 || currentSession.diagnosis.length > 0) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSession.cptCodes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Suggested CPT Codes</h4>
                    <div className="space-y-1">
                      {currentSession.cptCodes.map((code, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs px-2 py-1 rounded mr-2"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentSession.diagnosis.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Identified Diagnoses</h4>
                    <div className="space-y-1">
                      {currentSession.diagnosis.map((dx, index) => (
                        <span
                          key={index}
                          className="inline-block bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs px-2 py-1 rounded mr-2"
                        >
                          {dx}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={exportSession}
            className="btn-ghost flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          {settings.autoSave && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Auto-saving enabled</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={saveSession}
            disabled={isSaving || !transcript}
            className="btn-secondary flex items-center space-x-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Draft</span>
          </button>

          <button
            onClick={submitSession}
            disabled={isSaving || !structuredNote}
            className="btn-primary flex items-center space-x-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
}