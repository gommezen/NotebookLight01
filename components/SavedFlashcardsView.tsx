import React from 'react';
import { Flashcard } from '../types';
import { TrashIcon, CollectionIcon } from './icons';

interface SavedFlashcardsViewProps {
  flashcards: Flashcard[];
  onDelete: (cardId: string) => void;
}

const SavedFlashcardsView: React.FC<SavedFlashcardsViewProps> = ({ flashcards, onDelete }) => {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Saved Flashcards</h2>
      {flashcards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card) => (
            <div 
              key={card.id}
              className="group relative bg-gray-700 rounded-lg p-6 transition-all duration-200 hover:bg-gray-600/80 hover:shadow-lg h-64 flex flex-col justify-between"
            >
              <div>
                <p className="text-sm text-gray-400 mb-2">QUESTION</p>
                <p className="text-xl">{card.question}</p>
              </div>
              <div className='pt-4 border-t border-gray-500/50'>
                <p className="text-sm text-blue-300 mb-2">ANSWER</p>
                <p className="text-lg text-gray-200">{card.answer}</p>
              </div>
              
              <button 
                 onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this flashcard?')) {
                        onDelete(card.id);
                    }
                 }}
                 className="absolute top-3 right-3 p-2 bg-red-600/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-red-500"
                 aria-label="Delete flashcard"
                >
                  <TrashIcon className="w-5 h-5 text-white pointer-events-none" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 mt-20">
          <CollectionIcon className="w-24 h-24 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-400">No Saved Flashcards</h2>
          <p>You can save flashcards after generating them from a source.</p>
        </div>
      )}
    </div>
  );
};

export default SavedFlashcardsView;
