import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  AlertCircle,
  CheckCircle,
  Upload,
  Download
} from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number, transcript?: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  maxDuration?: number; // in seconds, default 300 (5 minutes)
  enableTranscription?: boolean;
  className?: string;
}

interface AudioData {
  blob: Blob;
  url: string;
  duration: number;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onTranscriptUpdate,
  maxDuration = 300,
  enableTranscription = true,
  className = ''
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      cleanup();
    };
  }, []);

  // Update duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused, maxDuration]);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionStatus(result.state);
    } catch (error) {
      console.warn('Permission API not supported');
    }
  };

  const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      setPermissionStatus('granted');
      setError('');
      return stream;
    } catch (error: any) {
      setPermissionStatus('denied');
      setError('Microphone access denied. Please enable microphone permissions to record.');
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await requestMicrophoneAccess();
      if (!stream) return;

      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);
        
        const newAudioData = {
          blob,
          url,
          duration
        };
        
        setAudioData(newAudioData);
        
        // Transcribe if enabled
        if (enableTranscription && blob.size > 0) {
          await transcribeAudio(blob);
        }
        
        // Notify parent component
        if (onRecordingComplete) {
          onRecordingComplete(blob, duration, transcript);
        }
        
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setError('');
      
    } catch (error: any) {
      setError(`Recording failed: ${error.message}`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (audioData?.url) {
      URL.revokeObjectURL(audioData.url);
    }
    
    setAudioData(null);
    setDuration(0);
    setTranscript('');
    setError('');
    cleanup();
  };

  const playAudio = () => {
    if (audioData && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // Create FormData for API call
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'en-US');
      formData.append('model', 'healthcare'); // Use healthcare-specific model

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      const transcriptText = data.transcript || '';
      
      setTranscript(transcriptText);
      
      if (onTranscriptUpdate) {
        onTranscriptUpdate(transcriptText);
      }
      
    } catch (error: any) {
      console.error('Transcription error:', error);
      setError(`Transcription failed: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const downloadRecording = () => {
    if (audioData) {
      const a = document.createElement('a');
      a.href = audioData.url;
      a.download = `voice-recording-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const uploadRecording = async () => {
    if (!audioData) return;

    try {
      const formData = new FormData();
      formData.append('audio', audioData.blob, 'recording.webm');
      formData.append('duration', duration.toString());
      formData.append('transcript', transcript);

      const response = await fetch('/api/voice-recordings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setError('');
      // Show success message or handle upload completion
      
    } catch (error: any) {
      setError(`Upload failed: ${error.message}`);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatusColor = () => {
    if (error) return 'text-red-500';
    if (isRecording) return isPaused ? 'text-yellow-500' : 'text-red-500 animate-pulse';
    if (audioData) return 'text-green-500';
    return 'text-gray-500';
  };

  const getRecordingStatusText = () => {
    if (error) return 'Error';
    if (isRecording) return isPaused ? 'Paused' : 'Recording';
    if (audioData) return 'Ready';
    return 'Ready to record';
  };

  return (
    <div className={`bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Voice Recorder</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getRecordingStatusColor()}`}></div>
          <span className={`text-sm font-medium ${getRecordingStatusColor()}`}>
            {getRecordingStatusText()}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Permission Warning */}
      {permissionStatus === 'denied' && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-600 dark:text-yellow-400 text-sm">
            <p className="font-medium">Microphone access required</p>
            <p>Please enable microphone permissions in your browser settings to use voice recording.</p>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-6">
        {/* Main Record Button */}
        <div className="relative">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={permissionStatus === 'denied'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                : 'bg-gradient-to-br from-primary-500 to-secondary-500 hover:shadow-lg hover:shadow-primary-500/25'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          
          {isRecording && (
            <div className="absolute inset-0 w-20 h-20 border-4 border-red-400/30 rounded-full animate-ping"></div>
          )}
        </div>

        {/* Duration Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
            {formatTime(duration)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Max: {formatTime(maxDuration)}
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center space-x-4">
          {isRecording && (
            <button
              onClick={pauseRecording}
              className="w-12 h-12 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 rounded-full flex items-center justify-center transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Pause className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          )}

          <button
            onClick={resetRecording}
            className="w-12 h-12 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 rounded-full flex items-center justify-center transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Audio Playback */}
      {audioData && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recording</h4>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                {formatTime(audioData.duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={playAudio}
              className="w-10 h-10 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 rounded-full flex items-center justify-center transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <div className="flex-1">
              <div className="h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
            </div>

            <button
              onClick={downloadRecording}
              className="w-10 h-10 bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 rounded-full flex items-center justify-center transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={uploadRecording}
              className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              title="Upload"
            >
              <Upload className="w-4 h-4 text-white" />
            </button>
          </div>

          <audio
            ref={audioRef}
            src={audioData.url}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      {/* Transcription Status */}
      {enableTranscription && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transcription</span>
            {isTranscribing && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-primary-600 dark:text-primary-400">Processing...</span>
              </div>
            )}
          </div>
          
          {transcript && (
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}