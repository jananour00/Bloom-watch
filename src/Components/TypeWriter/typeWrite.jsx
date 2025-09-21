// TypewriterText.jsx
import { useState, useEffect } from 'react';
import './typeWrite.css'; 

const TypewriterText = ({ text, speed = 100, startDelay = 500 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Start typing after initial delay
    const startTimer = setTimeout(() => {
      setIsTyping(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) return;

    const typingTimer = setTimeout(() => {
      setDisplayedText(text.substring(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(typingTimer);
  }, [currentIndex, isTyping, text, speed]);

  return (
    <span className="typewriter-container">
      {displayedText}
      <span className="typewriter-cursor"></span>
    </span>
  );
};

export default TypewriterText;