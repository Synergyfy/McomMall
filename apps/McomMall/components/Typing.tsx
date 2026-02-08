import React, { useState, useEffect, useMemo } from 'react';

const TypingEffect = () => {
  const words = useMemo(() => ['Restaurants', 'Hotels', 'Attraction'], []);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseBetween = 1000;

  useEffect(() => {
    const currentWord = words[wordIndex];

    const type = () => {
      if (isDeleting) {
        setText(currentWord.substring(0, charIndex));
        setCharIndex(prev => prev - 1);
        if (charIndex <= 0) {
          setIsDeleting(false);
          setWordIndex(prev => (prev + 1) % words.length);
        }
      } else {
        setText(currentWord.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        if (charIndex === currentWord.length) {
          setIsDeleting(true);
        }
      }
    };

    const timer = setTimeout(
      type,
      isDeleting
        ? deletingSpeed
        : charIndex === currentWord.length
        ? pauseBetween
        : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, words]);

  return (
    <div className="">
      <div className="">
        <span>{text}</span>
        <span className="inline-block w-2 h-6 bg-gray-800 animate-blink" />
      </div>
      <style jsx>{`
        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-blink {
          animation: blink 0.7s infinite;
        }
      `}</style>
    </div>
  );
};

export default TypingEffect;
