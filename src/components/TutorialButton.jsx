import React from 'react';
import { Button } from './ui/Button';
import { Play, RotateCcw, HelpCircle } from 'lucide-react';
import { useTutorial } from '../contexts/TutorialContext';

const TutorialButton = ({ variant = 'default', size = 'default', className = '' }) => {
  const {
    isTutorialActive,
    tutorialCompleted,
    tutorialSkipped,
    showTutorialButton,
    isInitialized,
    startTutorial,
    restartTutorial,
    hideTutorialButton,
    showTutorialButtonAgain,
  } = useTutorial();

  // Don't render if not initialized, tutorial is active, or button is hidden
  if (!isInitialized || isTutorialActive || !showTutorialButton) return null;

  const handleClick = () => {
    if (tutorialCompleted || tutorialSkipped) {
      restartTutorial();
    } else {
      startTutorial();
    }
  };

  const getButtonText = () => {
    if (tutorialCompleted) return 'Restart Tutorial';
    if (tutorialSkipped) return 'Start Tutorial';
    return 'Start Tutorial';
  };

  const getButtonIcon = () => {
    if (tutorialCompleted) return <RotateCcw className="w-4 h-4" />;
    return <Play className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={`flex items-center space-x-2 ${className}`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </Button>
      
      {tutorialCompleted && (
        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center space-x-1">
            <HelpCircle className="w-3 h-3" />
            <span>Tutorial completed</span>
          </div>
          <button
            onClick={hideTutorialButton}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Hide this button
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorialButton;
