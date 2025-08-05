import React, { useState, useRef, useEffect } from 'react';
import { Save, Mic, MicOff, FileText, Clock, User, Calendar, Brain, CheckCircle } from 'lucide-react';

interface ProgressNote {
  id: string;
  patientName: string;
  date: Date;
  content: string;
  duration: string;
  status: 'draft' | 'completed' | 'signed';
  provider: string;
  sessionType: string;
  diagnoses: string[];
  interventions: string[];
  plan: string;
  nextSession: string;
}

const ProgressNotes: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [currentNote, setCurrentNote] = useState<Partial<ProgressNote>>({
    patientName: '',
    sessionType: 'Individual Therapy',
    duration: '50 minutes',
    diagnoses: [],
    interventions: [],
    plan: '',
    nextSession: ''
  });
  const [savedNotes, setSavedNotes] = useState<ProgressNote[]>([
    {
      id: '1',
      patientName: 'Jane Smith',
      date: new Date('2024-01-20'),
      content: 'Patient presented with improved mood and affect. Discussed coping strategies for workplace stress. Patient demonstrated good insight into triggers and practiced mindfulness techniques during session.',
      duration: '50 minutes',
      status: 'completed',
      provider: 'Dr. Sarah Johnson',
      sessionType: 'Individual Therapy',
      diagnoses: ['Generalized Anxiety Disorder', 'Adjustment Disorder'],
      interventions: ['Cognitive Behavioral Therapy', 'Mindfulness Training'],
      plan: 'Continue weekly sessions. Patient to practice daily mindfulness exercises and complete thought journal.',
      nextSession: '2024-01-27'
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState('soap');
  const recognitionRef = useRef<any>(null);

  const templates = {
    soap: {
      name: 'SOAP Note',
      sections: ['Subjective', 'Objective', 'Assessment', 'Plan']
    },
    dar: {
      name: 'DAR Note',
      sections: ['Data', 'Action', 'Response']
    },
    birp: {
      name: 'BIRP Note',
      sections: ['Behavior', 'Intervention', 'Response', 'Plan']
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Simulated voice recognition
    setTimeout(() => {
      setTranscription('Patient reports feeling "much better" since last session. Sleep has improved from 4-5 hours to 7 hours nightly. Anxiety levels decreased from 8/10 to 5/10. Patient used breathing exercises successfully during work presentation.');
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const generateAISuggestions = () => {
    // Simulated AI suggestions based on transcription
    const suggestions = {
      diagnoses: ['Generalized Anxiety Disorder - improved'],
      interventions: ['Continued CBT', 'Progressive Muscle Relaxation taught'],
      plan: 'Maintain weekly sessions. Introduce exposure therapy for public speaking anxiety. Review sleep hygiene practices.'
    };
    
    setCurrentNote(prev => ({
      ...prev,
      content: transcription,
      diagnoses: suggestions.diagnoses,
      interventions: suggestions.interventions,
      plan: suggestions.plan
    }));
  };

  const saveNote = () => {
    const newNote: ProgressNote = {
      id: Date.now().toString(),
      patientName: currentNote.patientName || 'New Patient',
      date: new Date(),
      content: currentNote.content || transcription,
      duration: currentNote.duration || '50 minutes',
      status: 'draft',
      provider: 'Current Provider',
      sessionType: currentNote.sessionType || 'Individual Therapy',
      diagnoses: currentNote.diagnoses || [],
      interventions: currentNote.interventions || [],
      plan: currentNote.plan || '',
      nextSession: currentNote.nextSession || ''
    };
    
    setSavedNotes([newNote, ...savedNotes]);
    setTranscription('');
    setCurrentNote({
      patientName: '',
      sessionType: 'Individual Therapy',
      duration: '50 minutes',
      diagnoses: [],
      interventions: [],
      plan: '',
      nextSession: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automated Progress Notes</h1>
        <p className="text-gray-600">Create comprehensive session notes with AI-powered transcription and suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Note Creation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recording Interface */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Voice Recording</h2>
            
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-8 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </button>
            </div>
            
            <p className="text-center text-gray-600 mb-4">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>

            {/* Transcription Area */}
            {transcription && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Transcription</h3>
                <p className="text-gray-700">{transcription}</p>
                <button
                  onClick={generateAISuggestions}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Generate AI Suggestions
                </button>
              </div>
            )}
          </div>

          {/* Note Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={currentNote.patientName}
                  onChange={(e) => setCurrentNote({...currentNote, patientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <select
                  value={currentNote.sessionType}
                  onChange={(e) => setCurrentNote({...currentNote, sessionType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option>Individual Therapy</option>
                  <option>Group Therapy</option>
                  <option>Family Therapy</option>
                  <option>Intake Assessment</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template
              </label>
              <div className="flex gap-2">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTemplate === key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Notes
              </label>
              <textarea
                value={currentNote.content || transcription}
                onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Begin recording or type your session notes here..."
              />
            </div>

            {currentNote.diagnoses && currentNote.diagnoses.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnoses
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentNote.diagnoses.map((diagnosis, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {diagnosis}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentNote.plan && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Plan
                </label>
                <p className="bg-gray-50 p-3 rounded-lg text-gray-700">{currentNote.plan}</p>
              </div>
            )}

            <button
              onClick={saveNote}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Progress Note
            </button>
          </div>
        </div>

        {/* Recent Notes Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
            
            <div className="space-y-3">
              {savedNotes.map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{note.patientName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      note.status === 'completed' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {note.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {note.date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {note.duration}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              AI-Powered Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Automatic diagnosis coding suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Treatment plan recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Session summary generation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>HIPAA-compliant processing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressNotes;