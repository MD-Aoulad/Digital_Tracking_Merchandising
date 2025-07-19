/**
 * Custom Animation Hook
 * 
 * Provides reusable animation utilities and configurations
 * for consistent animations across the application.
 * 
 * @author UI/UX Expert Team
 * @version 1.0.0
 */

import { useCallback } from 'react';

export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
}

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass?: number;
}

export const useAnimation = () => {
  // Common animation configurations
  const fadeIn = useCallback((delay = 0): AnimationConfig => ({
    duration: 0.3,
    ease: "easeOut",
    delay
  }), []);

  const slideIn = useCallback((direction: 'up' | 'down' | 'left' | 'right' = 'up', delay = 0): AnimationConfig => ({
    duration: 0.4,
    ease: "easeOut",
    delay
  }), []);

  const scaleIn = useCallback((delay = 0): AnimationConfig => ({
    duration: 0.3,
    ease: "easeOut",
    delay
  }), []);

  const bounce = useCallback((delay = 0): AnimationConfig => ({
    duration: 0.6,
    ease: "easeInOut",
    delay
  }), []);

  // Spring configurations
  const springConfig = useCallback((damping = 25, stiffness = 300): SpringConfig => ({
    damping,
    stiffness,
    mass: 1
  }), []);

  const softSpring = useCallback((): SpringConfig => ({
    damping: 15,
    stiffness: 150
  }), []);

  const bouncySpring = useCallback((): SpringConfig => ({
    damping: 10,
    stiffness: 400
  }), []);

  // Hover animations
  const hoverScale = useCallback((scale = 1.05): { scale: number } => ({
    scale
  }), []);

  const hoverLift = useCallback((y = -5): { y: number } => ({
    y
  }), []);

  // Tap animations
  const tapScale = useCallback((scale = 0.95): { scale: number } => ({
    scale
  }), []);

  // Stagger animations for lists
  const staggerContainer = useCallback((staggerChildren = 0.1): { staggerChildren: number } => ({
    staggerChildren
  }), []);

  const staggerItem = useCallback((delay = 0): AnimationConfig => ({
    duration: 0.3,
    ease: "easeOut",
    delay
  }), []);

  // Loading animations
  const loadingPulse = useCallback((): AnimationConfig => ({
    duration: 1.5,
    ease: "easeInOut"
  }), []);

  const loadingSpin = useCallback((): AnimationConfig => ({
    duration: 1,
    ease: "linear"
  }), []);

  // Entrance animations
  const entranceFade = useCallback((): AnimationConfig => ({
    duration: 0.5,
    ease: "easeOut"
  }), []);

  const entranceSlide = useCallback((): AnimationConfig => ({
    duration: 0.6,
    ease: "easeOut"
  }), []);

  // Exit animations
  const exitFade = useCallback((): AnimationConfig => ({
    duration: 0.3,
    ease: "easeIn"
  }), []);

  const exitSlide = useCallback((): AnimationConfig => ({
    duration: 0.4,
    ease: "easeIn"
  }), []);

  return {
    // Basic animations
    fadeIn,
    slideIn,
    scaleIn,
    bounce,
    
    // Spring configurations
    springConfig,
    softSpring,
    bouncySpring,
    
    // Interactive animations
    hoverScale,
    hoverLift,
    tapScale,
    
    // List animations
    staggerContainer,
    staggerItem,
    
    // Loading animations
    loadingPulse,
    loadingSpin,
    
    // Entrance/Exit animations
    entranceFade,
    entranceSlide,
    exitFade,
    exitSlide
  };
};

export default useAnimation; 