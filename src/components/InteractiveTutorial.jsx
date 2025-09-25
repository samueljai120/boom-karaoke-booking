import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  SkipForward, 
  RotateCcw,
  HelpCircle,
  Calendar,
  MousePointer,
  Hand,
  Settings,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft
} from 'lucide-react';
import { useTutorial } from '../contexts/TutorialContext';

const InteractiveTutorial = () => {
  const {
    isTutorialActive,
    currentStep,
    isInitialized,
    startTutorial,
    nextStep,
    previousStep,
    completeTutorial,
    skipTutorial,
    restartTutorial,
  } = useTutorial();

  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const overlayRef = useRef(null);

  // Tutorial steps configuration
  const tutorialSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Boom Karaoke!',
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Interactive Tutorial</h3>
          <p className="text-gray-600">
            Let's take a quick tour of the karaoke booking system. This tutorial will show you all the key features and how to use them effectively.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can skip this tutorial anytime and restart it from the Instructions menu.
            </p>
          </div>
        </div>
      ),
      highlight: null,
      action: null,
    },
    {
      id: 'layout-overview',
      title: 'Layout Overview',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            The app has two main layout orientations. Let's explore the current view:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Horizontal Layout</span>
              </div>
              <p className="text-sm text-green-700">
                Time slots run horizontally, rooms vertically. Great for seeing time progression.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Vertical Layout</span>
              </div>
              <p className="text-sm text-purple-700">
                Rooms run horizontally, time slots vertically. Classic scheduling view.
              </p>
            </div>
          </div>
        </div>
      ),
      highlight: null,
      action: null,
    },
    {
      id: 'sidebar-navigation',
      title: 'Sidebar Navigation',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            The left sidebar contains your calendar and navigation controls:
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">♪</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">App Logo & Title</p>
                <p className="text-sm text-gray-600">Boom Karaoke branding</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Mini Calendar</p>
                <p className="text-sm text-gray-600">Navigate dates and see monthly view</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Settings & Instructions</p>
                <p className="text-sm text-gray-600">Access app configuration and help</p>
              </div>
            </div>
          </div>
        </div>
      ),
      highlight: 'sidebar',
      action: null,
    },
    {
      id: 'date-navigation',
      title: 'Date Navigation',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Navigate through different dates using these controls:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <ChevronLeft className="w-4 h-4 text-blue-600" />
                <ChevronRight className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Date Arrows</span>
              </div>
              <p className="text-sm text-blue-700">Click to go back/forward one day</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Today Button</span>
              </div>
              <p className="text-sm text-green-700">Quickly return to today's date</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Try it:</strong> Click the arrow buttons or select a date in the mini calendar to navigate.
            </p>
          </div>
        </div>
      ),
      highlight: 'date-controls',
      action: 'navigate-date',
    },
    {
      id: 'current-time-indicator',
      title: 'Current Time Indicator',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            The red line shows the current time on the schedule:
          </p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-4 h-1 bg-red-500 rounded"></div>
              <Clock className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Live Time Indicator</span>
            </div>
            <p className="text-sm text-red-700">
              Updates every minute and only shows during business hours
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The time indicator helps you see where you are in the day at a glance.
            </p>
          </div>
        </div>
      ),
      highlight: 'current-time',
      action: null,
    },
    {
      id: 'room-headers',
      title: 'Room Information',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Each room column shows important details:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Room Name</p>
                  <p className="text-sm text-gray-600">Type (Capacity)</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Color coding helps identify room types at a glance
              </p>
            </div>
          </div>
        </div>
      ),
      highlight: 'room-headers',
      action: null,
    },
    {
      id: 'creating-bookings',
      title: 'Creating Bookings',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            There are several ways to create new bookings:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <MousePointer className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Click Empty Slot</span>
              </div>
              <p className="text-sm text-blue-700">Click any empty time slot to create a booking</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">+</span>
                </div>
                <span className="font-medium text-green-800">Floating + Button</span>
              </div>
              <p className="text-sm text-green-700">Quick 1-hour booking at current time</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Try it:</strong> Click an empty time slot or the floating + button to create a booking.
            </p>
          </div>
        </div>
      ),
      highlight: 'booking-creation',
      action: 'create-booking',
    },
    {
      id: 'drag-and-drop',
      title: 'Drag & Drop Bookings',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Move bookings around easily with drag and drop:
          </p>
          <div className="space-y-3">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <Hand className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Drag to Move</span>
              </div>
              <p className="text-sm text-orange-700">Drag bookings to different times or rooms</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-purple-600">🔄</span>
                <span className="font-medium text-purple-800">Swap Bookings</span>
              </div>
              <p className="text-sm text-purple-700">Drop on another booking to swap positions</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Try it:</strong> Drag any existing booking to a new time slot or room.
            </p>
          </div>
        </div>
      ),
      highlight: 'bookings',
      action: 'drag-booking',
    },
    {
      id: 'resize-bookings',
      title: 'Resize Bookings',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Adjust booking duration by resizing:
          </p>
          <div className="space-y-3">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-2 mb-2">
                <Hand className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-indigo-800">Long Press to Resize</span>
              </div>
              <p className="text-sm text-indigo-700">Long press a booking to enter resize mode</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowUp className="w-4 h-4 text-teal-600" />
                <ArrowDown className="w-4 h-4 text-teal-600" />
                <span className="font-medium text-teal-800">Drag Edges</span>
              </div>
              <p className="text-sm text-teal-700">Drag top/bottom edges to adjust duration</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Try it:</strong> Long press a booking, then drag the edges to resize it.
            </p>
          </div>
        </div>
      ),
      highlight: 'bookings',
      action: 'resize-booking',
    },
    {
      id: 'booking-details',
      title: 'View & Edit Bookings',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Click any booking to view and edit details:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <MousePointer className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Click to View</span>
              </div>
              <p className="text-sm text-blue-700">Click any booking to see full details</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Edit Options</span>
              </div>
              <p className="text-sm text-green-700">Edit, mark no-show, or delete bookings</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Try it:</strong> Click any booking to open the details modal.
            </p>
          </div>
        </div>
      ),
      highlight: 'bookings',
      action: 'click-booking',
    },
    {
      id: 'settings-customization',
      title: 'Settings & Customization',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Customize the app to your preferences:
          </p>
          <div className="space-y-3">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Layout Orientations</span>
              </div>
              <p className="text-sm text-purple-700">Switch between Horizontal and Vertical layouts</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-orange-600">🎨</span>
                <span className="font-medium text-orange-800">Color Coding</span>
              </div>
              <p className="text-sm text-orange-700">Color by room type or booking source</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span className="font-medium text-teal-800">Business Hours</span>
              </div>
              <p className="text-sm text-teal-700">Set operating hours and time zones</p>
            </div>
          </div>
        </div>
      ),
      highlight: 'settings-button',
      action: 'open-settings',
    },
    {
      id: 'completion',
      title: 'Tutorial Complete!',
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">You're All Set!</h3>
          <p className="text-gray-600">
            You now know how to use all the key features of the Boom Karaoke booking system.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Remember:</strong> You can always restart this tutorial from the Instructions menu if you need a refresher.
            </p>
          </div>
        </div>
      ),
      highlight: null,
      action: null,
    },
  ];

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  // Handle step actions
  const handleStepAction = (action) => {
    switch (action) {
      case 'navigate-date':
        // Simulate date navigation
        break;
      case 'create-booking':
        // Simulate booking creation
        break;
      case 'drag-booking':
        // Simulate drag and drop
        break;
      case 'resize-booking':
        // Simulate resize
        break;
      case 'click-booking':
        // Simulate booking click
        break;
      case 'open-settings':
        // Simulate settings open
        break;
      default:
        break;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (currentStepData.action) {
      handleStepAction(currentStepData.action);
    }
    
    if (isLastStep) {
      completeTutorial();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        nextStep();
        setIsAnimating(false);
      }, 300);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setIsAnimating(true);
    setTimeout(() => {
      previousStep();
      setIsAnimating(false);
    }, 300);
  };

  // Handle skip tutorial
  const handleSkip = () => {
    skipTutorial();
  };

  // Handle restart tutorial
  const handleRestart = () => {
    restartTutorial();
  };

  if (!isInitialized || !isTutorialActive) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            handleSkip();
          }
        }}
      >
        {/* Tutorial Card */}
        <Card 
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Interactive Tutorial</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-6">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {currentStepData.title}
              </h2>
              
              <div className="mb-6">
                {currentStepData.content}
              </div>

              {/* Step-specific highlights */}
              {currentStepData.highlight && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-800">Look for this on the screen:</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {currentStepData.highlight === 'sidebar' && 'The left sidebar with calendar and navigation'}
                    {currentStepData.highlight === 'date-controls' && 'The date navigation arrows and today button'}
                    {currentStepData.highlight === 'current-time' && 'The red line showing current time'}
                    {currentStepData.highlight === 'room-headers' && 'The room column headers with names and types'}
                    {currentStepData.highlight === 'booking-creation' && 'Empty time slots and the floating + button'}
                    {currentStepData.highlight === 'bookings' && 'Existing bookings on the schedule'}
                    {currentStepData.highlight === 'settings-button' && 'The settings button in the sidebar'}
                  </p>
                </div>
              )}

              {/* Action prompts */}
              {currentStepData.action && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MousePointer className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Try it now:</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {currentStepData.action === 'navigate-date' && 'Click the date arrows or select a date in the mini calendar'}
                    {currentStepData.action === 'create-booking' && 'Click an empty time slot or the floating + button'}
                    {currentStepData.action === 'drag-booking' && 'Drag any booking to a new time slot or room'}
                    {currentStepData.action === 'resize-booking' && 'Long press a booking, then drag the edges to resize'}
                    {currentStepData.action === 'click-booking' && 'Click any booking to view its details'}
                    {currentStepData.action === 'open-settings' && 'Click the settings button in the sidebar'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart</span>
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2"
                >
                  <span>{isLastStep ? 'Complete' : 'Next'}</span>
                  {isLastStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default InteractiveTutorial;
