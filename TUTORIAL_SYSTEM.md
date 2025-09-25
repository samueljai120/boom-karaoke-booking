# Interactive Tutorial System

This document describes the comprehensive interactive tutorial system implemented for the Boom Karaoke booking application.

## Overview

The tutorial system provides a step-by-step, interactive guide that helps users learn how to use the application effectively. It's designed to be skippable, restartable, and accessible from multiple locations within the app.

## Features

### 🎯 **Interactive Step-by-Step Guide**
- 12 comprehensive tutorial steps covering all major features
- Visual highlights and callouts for important UI elements
- Action prompts that encourage hands-on learning
- Progress tracking with completion percentage

### 🔄 **Flexible Access & Control**
- Floating tutorial button for first-time users
- Tutorial button in Instructions modal
- Skip functionality at any time
- Restart capability for repeated learning
- Hide/show tutorial button option

### 💾 **Persistent State Management**
- Tutorial completion status saved to localStorage
- User preferences for showing/hiding tutorial button
- Cross-session state persistence

### 📱 **Responsive Design**
- Works on desktop, tablet, and mobile devices
- Adaptive layout for different screen sizes
- Touch-friendly interactions

## Components

### 1. TutorialContext (`src/contexts/TutorialContext.jsx`)
Manages the global tutorial state and provides methods for:
- Starting/stopping the tutorial
- Navigating between steps
- Tracking completion status
- Managing user preferences

### 2. InteractiveTutorial (`src/components/InteractiveTutorial.jsx`)
The main tutorial component that renders:
- Step-by-step content with visual guides
- Navigation controls (Previous/Next/Restart)
- Progress indicator
- Action prompts and highlights

### 3. TutorialButton (`src/components/TutorialButton.jsx`)
A reusable button component that:
- Shows appropriate text based on tutorial state
- Handles tutorial start/restart actions
- Displays completion status
- Provides hide/show functionality

## Tutorial Steps

### Step 1: Welcome
- Introduction to the tutorial system
- Overview of what users will learn
- Tips for using the tutorial

### Step 2: Layout Overview
- Explanation of the two layout orientations
- Visual comparison of Horizontal vs Vertical layouts
- Benefits of each layout type

### Step 3: Sidebar Navigation
- Left sidebar components and functionality
- App branding and navigation elements
- Settings and instructions access

### Step 4: Date Navigation
- Date arrow controls
- Today button functionality
- Mini calendar interaction
- **Action**: Try navigating dates

### Step 5: Current Time Indicator
- Red line showing current time
- Real-time updates
- Business hours awareness

### Step 6: Room Information
- Room column headers
- Room types and capacity display
- Color coding system

### Step 7: Creating Bookings
- Click empty slots to create bookings
- Floating + button for quick creation
- **Action**: Try creating a booking

### Step 8: Drag & Drop Bookings
- Moving bookings between times/rooms
- Swapping booking positions
- **Action**: Try dragging a booking

### Step 9: Resize Bookings
- Long press to enter resize mode
- Drag edges to adjust duration
- **Action**: Try resizing a booking

### Step 10: View & Edit Bookings
- Click bookings to view details
- Edit, mark no-show, or delete options
- **Action**: Try clicking a booking

### Step 11: Settings & Customization
- Layout orientations and preferences
- Color coding configuration
- Business hours and timezone settings

### Step 12: Completion
- Tutorial completion confirmation
- Reminder about restarting tutorial
- Next steps for using the app

## Implementation Details

### State Management
```javascript
const {
  isTutorialActive,      // Whether tutorial is currently running
  currentStep,           // Current step index (0-11)
  tutorialCompleted,     // Whether user has completed tutorial
  tutorialSkipped,       // Whether user has skipped tutorial
  showTutorialButton,    // Whether to show floating tutorial button
  startTutorial,         // Function to start tutorial
  nextStep,              // Function to go to next step
  previousStep,          // Function to go to previous step
  completeTutorial,      // Function to complete tutorial
  skipTutorial,          // Function to skip tutorial
  restartTutorial,       // Function to restart tutorial
  hideTutorialButton,    // Function to hide tutorial button
  showTutorialButtonAgain // Function to show tutorial button again
} = useTutorial();
```

### LocalStorage Schema
```javascript
{
  completed: boolean,           // Tutorial completion status
  skipped: boolean,            // Tutorial skip status
  showButton: boolean,         // Show/hide tutorial button preference
  lastCompleted: string        // ISO timestamp of last completion
}
```

### Integration Points

1. **App.jsx**: TutorialProvider wraps the entire app
2. **AppleCalendarDashboard.jsx**: Floating tutorial button and tutorial context
3. **TraditionalSchedule.jsx**: Floating tutorial button and tutorial context
4. **InstructionsModal.jsx**: Tutorial button in instructions

## Usage Examples

### Starting the Tutorial
```javascript
const { startTutorial } = useTutorial();
// Call startTutorial() to begin the tutorial
```

### Checking Tutorial Status
```javascript
const { tutorialCompleted, showTutorialButton } = useTutorial();
// Use these values to conditionally render UI elements
```

### Customizing Tutorial Button
```javascript
<TutorialButton 
  variant="default" 
  size="sm" 
  className="custom-class" 
/>
```

## Customization

### Adding New Tutorial Steps
1. Add step object to `tutorialSteps` array in `InteractiveTutorial.jsx`
2. Include: `id`, `title`, `content`, `highlight`, `action`
3. Update step count in progress calculation

### Modifying Step Content
- Edit the `content` property of each step
- Use JSX for rich content and visual elements
- Include action prompts with `action` property

### Styling
- Tutorial uses Tailwind CSS classes
- Customize colors, spacing, and animations
- Responsive design built-in

## Best Practices

1. **Keep steps focused**: Each step should cover one main concept
2. **Use visual cues**: Highlight relevant UI elements
3. **Encourage interaction**: Include action prompts where appropriate
4. **Provide feedback**: Show progress and completion status
5. **Allow flexibility**: Always provide skip and restart options

## Future Enhancements

- **Video tutorials**: Add video content to steps
- **Branching paths**: Different tutorial paths based on user role
- **Analytics**: Track tutorial completion rates and drop-off points
- **Localization**: Multi-language support
- **Accessibility**: Enhanced screen reader support and keyboard navigation

## Troubleshooting

### Tutorial Not Starting
- Check if TutorialProvider is properly wrapped around the app
- Verify tutorial context is imported and used correctly
- Check localStorage for any corrupted state

### State Not Persisting
- Ensure localStorage is available in the browser
- Check for any errors in the state management functions
- Verify the localStorage key is consistent

### UI Issues
- Check for CSS conflicts with tutorial overlay
- Verify z-index values for proper layering
- Test responsive design on different screen sizes

## Conclusion

The interactive tutorial system provides a comprehensive, user-friendly way to onboard new users to the Boom Karaoke booking application. It balances guided learning with user autonomy, ensuring users can learn at their own pace while having the option to skip or restart as needed.
