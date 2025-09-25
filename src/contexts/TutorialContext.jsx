import React, { createContext, useContext, useState, useEffect } from 'react';

const TutorialContext = createContext();

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [tutorialSkipped, setTutorialSkipped] = useState(false);
  const [showTutorialButton, setShowTutorialButton] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tutorial state from localStorage
  useEffect(() => {
    try {
      const savedTutorialState = localStorage.getItem('karaoke-tutorial-state');
      if (savedTutorialState) {
        const parsed = JSON.parse(savedTutorialState);
        setTutorialCompleted(parsed.completed || false);
        setTutorialSkipped(parsed.skipped || false);
        setShowTutorialButton(parsed.showButton !== false); // Default to true
      } else {
        // First time user - show tutorial button
        setShowTutorialButton(true);
      }
    } catch (error) {
      // Failed to load tutorial state - error handling removed for clean version
      // Set defaults on error
      setTutorialCompleted(false);
      setTutorialSkipped(false);
      setShowTutorialButton(true);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save tutorial state to localStorage
  useEffect(() => {
    const tutorialState = {
      completed: tutorialCompleted,
      skipped: tutorialSkipped,
      showButton: showTutorialButton,
      lastCompleted: tutorialCompleted ? new Date().toISOString() : null
    };
    localStorage.setItem('karaoke-tutorial-state', JSON.stringify(tutorialState));
  }, [tutorialCompleted, tutorialSkipped, showTutorialButton]);

  const startTutorial = () => {
    setIsTutorialActive(true);
    setCurrentStep(0);
    setTutorialSkipped(false);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const completeTutorial = () => {
    setIsTutorialActive(false);
    setTutorialCompleted(true);
    setCurrentStep(0);
  };

  const skipTutorial = () => {
    setIsTutorialActive(false);
    setTutorialSkipped(true);
    setCurrentStep(0);
  };

  const restartTutorial = () => {
    setTutorialCompleted(false);
    setTutorialSkipped(false);
    setShowTutorialButton(true); // Ensure button is visible when restarting
    startTutorial();
  };

  const hideTutorialButton = () => {
    setShowTutorialButton(false);
  };

  const showTutorialButtonAgain = () => {
    setShowTutorialButton(true);
  };

  const value = {
    isTutorialActive,
    currentStep,
    tutorialCompleted,
    tutorialSkipped,
    showTutorialButton,
    isInitialized,
    startTutorial,
    nextStep,
    previousStep,
    goToStep,
    completeTutorial,
    skipTutorial,
    restartTutorial,
    hideTutorialButton,
    showTutorialButtonAgain,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};
