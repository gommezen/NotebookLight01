
import React, { useEffect, useRef } from 'react';
import { useLiveConversation } from '../hooks/useLiveConversation';
import { MicrophoneIcon, StopIcon } from './icons';

interface LiveConversationProps {
  onClose: () => void;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ onClose }) => {
  const {
    isListening,
    userTranscript,
    modelTranscript,
    transcriptHistory,
    startConversation,
    stopConversation,
  } = useLiveConversation();
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptHistory, userTranscript, modelTranscript]);

  const handleToggleConversation = () => {
    if (isListening) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col transform transition-all">
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Live Conversation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {transcriptHistory.map((line, index) => (
                 <p key={index} className={`text-lg ${line.startsWith('You:') ? 'text-gray-300' : 'text-blue-300'}`}>
                    {line}
                 </p>
            ))}
            {userTranscript && <p className="text-lg text-gray-400 italic">You: {userTranscript}...</p>}
            {modelTranscript && <p className="text-lg text-blue-400 italic">Bot: {modelTranscript}...</p>}
            <div ref={historyEndRef} />
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-700 flex flex-col items-center justify-center">
            <button 
                onClick={handleToggleConversation} 
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                `}
            >
                {isListening ? 
                    <StopIcon className="w-8 h-8 text-white" /> :
                    <MicrophoneIcon className="w-8 h-8 text-white" />
                }
            </button>
            <p className="mt-4 text-sm text-gray-400">
                {isListening ? 'Tap to stop' : 'Tap to start speaking'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default LiveConversation;
