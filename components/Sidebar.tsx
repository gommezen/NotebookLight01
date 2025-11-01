import React, { useState } from 'react';
import { Source } from '../types';
import SourceModal from './SourceModal';
import { PlusIcon, BookOpenIcon } from './icons';

interface SidebarProps {
  sources: Source[];
  selectedSourceId: string | null;
  onSelectSource: (id: string) => void;
  onAddSource: (title: string, content: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sources, selectedSourceId, onSelectSource, onAddSource }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-900/70 backdrop-blur-md border-r border-gray-700/50 w-full md:w-80 flex flex-col h-full p-4">
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-300 mb-4 px-2">Sources</h2>
          <ul className="space-y-2">
            {sources.map(source => (
              <li key={source.id}>
                <button
                  onClick={() => onSelectSource(source.id)}
                  className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    selectedSourceId === source.id
                      ? 'bg-blue-600/30 text-white'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <BookOpenIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate flex-1">{source.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Source
          </button>
        </div>
      </div>
      {isModalOpen && <SourceModal onClose={() => setIsModalOpen(false)} onAddSource={onAddSource} />}
    </>
  );
};

export default Sidebar;
