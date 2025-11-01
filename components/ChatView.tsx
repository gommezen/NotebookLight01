import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageSender } from '../types';
import { SendIcon, BrainCircuitIcon, DownloadIcon } from './icons';
import ActionButtons from './ActionButtons';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, useThinkingMode: boolean) => void;
  onGenerateReport: () => void;
  onGenerateFlashcards: () => void;
  isLoading: boolean;
  sourceTitle: string;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  messages, 
  onSendMessage, 
  onGenerateReport,
  onGenerateFlashcards,
  isLoading,
  sourceTitle
}) => {
  const [input, setInput] = useState('');
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input, useThinkingMode);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleDownloadChat = () => {
    if (messages.length === 0) return;

    const formattedChat = messages.map(msg => `${msg.sender === MessageSender.USER ? 'You' : 'Bot'}: ${msg.text}`).join('\n\n');
    
    const blob = new Blob([formattedChat], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = sourceTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `chat_with_${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <header className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-end">
        <div className="flex items-center space-x-2">
            <button
                onClick={handleDownloadChat}
                disabled={messages.length === 0 || isLoading}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="h-4 w-4 mr-2" />
                <span>Download Chat</span>
            </button>
            <ActionButtons 
            isSourceSelected={true}
            onGenerateReport={onGenerateReport}
            onGenerateFlashcards={onGenerateFlashcards}
            isLoading={isLoading}
            />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === MessageSender.BOT && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <BrainCircuitIcon className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-xl ${msg.sender === MessageSender.USER ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-300'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <BrainCircuitIcon className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-xl p-4 rounded-xl bg-gray-900">
                    <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about the source..."
            className="w-full bg-gray-900 rounded-lg p-4 pr-28 text-white resize-none border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button
              onClick={() => setUseThinkingMode(!useThinkingMode)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                useThinkingMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Toggle Thinking Mode"
            >
              <BrainCircuitIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;