'use client';

import { useEffect, useState } from 'react';

interface Flower {
  id: string;
  x: number;
  y: number;
  type: number;
}

const FLOWER_TYPES = [
  'flower-1-daisy.png',
  'flower-2-five.png',
  'flower-3-rosette.png',
  'flower-4-pompom.png',
  'flower-5-rose.png',
];

const isClickable = (element: Element): boolean => {
  const tag = element.tagName.toLowerCase();
  if (['button', 'a', 'input', 'textarea', 'select'].includes(tag)) {
    return true;
  }
  if (element.hasAttribute('role')) {
    const role = element.getAttribute('role');
    if (role && ['button', 'link', 'menuitem', 'tab'].includes(role)) {
      return true;
    }
  }
  if (element.getAttribute('onclick')) {
    return true;
  }
  return false;
};

export default function FlowerOverlay() {
  const [flowers, setFlowers] = useState<Flower[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;

      // Don't plant flowers on clickable elements
      if (isClickable(target)) {
        return;
      }

      // Check if the click landed on a parent clickable element
      const clickableParent = (target as Element).closest(
        'button, a, input, textarea, select, [role="button"], [role="link"], [role="menuitem"], [role="tab"]'
      );
      if (clickableParent) {
        return;
      }

      // Plant a flower!
      const id = Math.random().toString(36);
      const type = Math.floor(Math.random() * FLOWER_TYPES.length);

      setFlowers(prev => [...prev, {
        id,
        x: e.clientX,
        y: e.clientY,
        type,
      }]);

      // Remove flower after animation completes (1.2s)
      setTimeout(() => {
        setFlowers(prev => prev.filter(f => f.id !== id));
      }, 1200);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {flowers.map(flower => (
        <img
          key={flower.id}
          src={`/${FLOWER_TYPES[flower.type]}`}
          alt=""
          className="absolute w-16 h-16 animate-flower"
          style={{
            left: `${flower.x}px`,
            top: `${flower.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
