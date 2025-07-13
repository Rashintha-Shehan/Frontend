import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const [onboardingState, setOnboardingState] = useState({
    isCompleted: false,
    isSkipped: false,
    currentStep: 0,
    userRole: 'STAFF',
    preferences: {
      showTooltips: true,
      autoPlay: false,
      theme: 'light'
    },
    completedSteps: [],
    showOnboarding: false
  });

  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const [helpSystemEnabled, setHelpSystemEnabled] = useState(true);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    const loadOnboardingState = () => {
      try {
        const completed = localStorage.getItem('onboardingCompleted') === 'true';
        const skipped = localStorage.getItem('onboardingSkipped') === 'true';
        const preferences = JSON.parse(localStorage.getItem('onboardingPreferences') || '{}');
        const userRole = localStorage.getItem('role') || 'STAFF';

        setOnboardingState(prev => ({
          ...prev,
          isCompleted: completed,
          isSkipped: skipped,
          userRole: userRole,
          preferences: {
            showTooltips: true,
            autoPlay: false,
            theme: 'light',
            ...preferences
          },
          showOnboarding: !completed && !skipped
        }));

        setTooltipsEnabled(preferences.showTooltips !== false);
        setHelpSystemEnabled(true);
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      }
    };

    loadOnboardingState();
  }, []);

  // Check if user is new (first time login)
  const checkIfNewUser = () => {
    const isNewUser = !onboardingState.isCompleted && !onboardingState.isSkipped;
    return isNewUser;
  };

  // Start onboarding
  const startOnboarding = (role = null) => {
    const userRole = role || localStorage.getItem('role') || 'STAFF';
    setOnboardingState(prev => ({
      ...prev,
      showOnboarding: true,
      currentStep: 0,
      userRole: userRole,
      completedSteps: []
    }));
  };

  // Complete onboarding
  const completeOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      isCompleted: true,
      showOnboarding: false,
      completedSteps: [...prev.completedSteps, prev.currentStep]
    }));

    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingPreferences', JSON.stringify(onboardingState.preferences));
    
    toast.success('Onboarding completed! Welcome to the Leave Management System.');
  };

  // Skip onboarding
  const skipOnboarding = () => {
    setOnboardingState(prev => ({
      ...prev,
      isSkipped: true,
      showOnboarding: false
    }));

    localStorage.setItem('onboardingSkipped', 'true');
    toast.info('Onboarding skipped. You can replay it anytime from settings.');
  };

  // Update onboarding step
  const updateStep = (step) => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: step,
      completedSteps: step > prev.currentStep 
        ? [...prev.completedSteps, prev.currentStep]
        : prev.completedSteps
    }));
  };

  // Update preferences
  const updatePreferences = (newPreferences) => {
    const updatedPreferences = { ...onboardingState.preferences, ...newPreferences };
    
    setOnboardingState(prev => ({
      ...prev,
      preferences: updatedPreferences
    }));

    setTooltipsEnabled(updatedPreferences.showTooltips);
    
    localStorage.setItem('onboardingPreferences', JSON.stringify(updatedPreferences));
  };

  // Reset onboarding
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('onboardingSkipped');
    
    setOnboardingState(prev => ({
      ...prev,
      isCompleted: false,
      isSkipped: false,
      currentStep: 0,
      completedSteps: [],
      showOnboarding: false
    }));

    toast.info('Onboarding has been reset. You can start it again.');
  };

  // Show help tooltip
  const showHelp = (content, position = 'top') => {
    if (!helpSystemEnabled) return;
    
    // This would integrate with a global tooltip system
    // For now, we'll use toast notifications
    toast.info(content, {
      position: position === 'top' ? 'top-center' : 'bottom-center',
      autoClose: 5000
    });
  };

  // Toggle tooltips
  const toggleTooltips = () => {
    const newValue = !tooltipsEnabled;
    setTooltipsEnabled(newValue);
    updatePreferences({ showTooltips: newValue });
    
    toast.info(`Tooltips ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Toggle help system
  const toggleHelpSystem = () => {
    const newValue = !helpSystemEnabled;
    setHelpSystemEnabled(newValue);
    
    toast.info(`Help system ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Get onboarding progress
  const getProgress = () => {
    const totalSteps = onboardingState.userRole === 'ADMIN' ? 2 : 6;
    return {
      current: onboardingState.currentStep + 1,
      total: totalSteps,
      percentage: ((onboardingState.currentStep + 1) / totalSteps) * 100,
      completed: onboardingState.completedSteps.length
    };
  };

  // Check if step is completed
  const isStepCompleted = (stepIndex) => {
    return onboardingState.completedSteps.includes(stepIndex);
  };

  // Get contextual help content
  const getHelpContent = (context) => {
    const helpContent = {
      'leave-request': {
        title: 'Leave Request Form',
        content: 'Fill out all required fields including leave type, dates, purpose, and arrangement details. Make sure to attach any required documents like medical certificates.'
      },
      'leave-history': {
        title: 'Leave History',
        content: 'View all your submitted leave requests and their current status. You can filter by date range, leave type, or status.'
      },
      'profile': {
        title: 'Profile Management',
        content: 'Update your personal information, profile picture, and account settings. Ensure your faculty and department information is correct.'
      },
      'dashboard': {
        title: 'Dashboard Overview',
        content: 'Your dashboard shows quick access to leave requests, history, and account settings. Use the navigation menu to access different features.'
      },
      'admin-pending': {
        title: 'Pending Requests',
        content: 'Review and approve/reject leave requests from staff members. Check supporting documents and verify leave balances before making decisions.'
      },
      'admin-users': {
        title: 'User Management',
        content: 'Manage user accounts, approve new registrations, and assign admin roles. You can also deactivate/reactivate user accounts.'
      }
    };

    return helpContent[context] || {
      title: 'Help',
      content: 'Need assistance? Contact your department administrator or IT support.'
    };
  };

  const value = {
    // State
    onboardingState,
    tooltipsEnabled,
    helpSystemEnabled,
    
    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    updateStep,
    updatePreferences,
    resetOnboarding,
    showHelp,
    toggleTooltips,
    toggleHelpSystem,
    
    // Utilities
    checkIfNewUser,
    getProgress,
    isStepCompleted,
    getHelpContent
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}; 