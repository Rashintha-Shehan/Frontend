import React, { useState, useRef, useEffect } from 'react';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Tooltip.css';

const Tooltip = ({ 
  content, 
  children, 
  position = 'top', 
  trigger = 'hover',
  className = '',
  showArrow = true,
  maxWidth = 300,
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isPinned) {
      setIsVisible(false);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
      setIsPinned(!isPinned);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsVisible(false);
        setIsPinned(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  const getPositionClasses = () => {
    const baseClass = 'tooltip';
    const positionClass = `tooltip-${position}`;
    const visibilityClass = isVisible ? 'tooltip-visible' : '';
    const pinnedClass = isPinned ? 'tooltip-pinned' : '';
    
    return `${baseClass} ${positionClass} ${visibilityClass} ${pinnedClass} ${className}`.trim();
  };

  const getArrowPosition = () => {
    switch (position) {
      case 'top': return 'tooltip-arrow-bottom';
      case 'bottom': return 'tooltip-arrow-top';
      case 'left': return 'tooltip-arrow-right';
      case 'right': return 'tooltip-arrow-left';
      default: return 'tooltip-arrow-bottom';
    }
  };

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
      onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
      onClick={trigger === 'click' ? handleClick : undefined}
      ref={triggerRef}
    >
      {children}
      
      <div
        ref={tooltipRef}
        className={getPositionClasses()}
        style={{ maxWidth: `${maxWidth}px` }}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        <div className="tooltip-content">
          {typeof content === 'string' ? (
            <div className="tooltip-text">{content}</div>
          ) : (
            content
          )}
          
          {isPinned && (
            <button
              className="tooltip-close"
              onClick={togglePin}
              aria-label="Close tooltip"
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        {showArrow && (
          <div className={`tooltip-arrow ${getArrowPosition()}`}></div>
        )}
      </div>
    </div>
  );
};

// Info Tooltip Component
export const InfoTooltip = ({ content, ...props }) => (
  <Tooltip content={content} {...props}>
    <FaInfoCircle className="info-icon" />
  </Tooltip>
);

// Help Tooltip Component
export const HelpTooltip = ({ content, ...props }) => (
  <Tooltip 
    content={
      <div className="help-tooltip">
        <div className="help-header">
          <FaInfoCircle />
          <span>Help</span>
        </div>
        <div className="help-content">
          {content}
        </div>
      </div>
    }
    trigger="click"
    position="right"
    maxWidth={400}
    {...props}
  >
    <button className="help-button" aria-label="Show help">
      <FaInfoCircle />
    </button>
  </Tooltip>
);

// Form Field Tooltip Component
export const FieldTooltip = ({ content, fieldName, ...props }) => (
  <Tooltip 
    content={
      <div className="field-tooltip">
        <div className="field-tooltip-header">
          <strong>{fieldName}</strong>
        </div>
        <div className="field-tooltip-content">
          {content}
        </div>
      </div>
    }
    position="top"
    maxWidth={350}
    {...props}
  >
    <FaInfoCircle className="field-info-icon" />
  </Tooltip>
);

export default Tooltip; 