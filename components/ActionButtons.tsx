
import React from 'react';

interface ActionButtonsProps {
  isSourceSelected: boolean;
  onGenerateReport: () => void;
  onGenerateFlashcards: () => void;
  isLoading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSourceSelected,
  onGenerateReport,
  onGenerateFlashcards,
  isLoading,
}) => {
  const commonButtonClasses = "px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onGenerateReport}
        disabled={!isSourceSelected || isLoading}
        className={`${commonButtonClasses} bg-gray-700 hover:bg-gray-600 text-gray-200`}
      >
        Generate Report
      </button>
      <button
        onClick={onGenerateFlashcards}
        disabled={!isSourceSelected || isLoading}
        className={`${commonButtonClasses} bg-gray-700 hover:bg-gray-600 text-gray-200`}
      >
        Generate Flashcards
      </button>
    </div>
  );
};

export default ActionButtons;
