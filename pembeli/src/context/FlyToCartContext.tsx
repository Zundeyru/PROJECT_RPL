"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  image?: string;
}

interface FlyToCartContextType {
  startFlyAnimation: (startX: number, startY: number, image?: string) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined);

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [itemId, setItemId] = useState(0);

  const startFlyAnimation = useCallback((startX: number, startY: number, image?: string) => {
    const id = itemId;
    setItemId(prev => prev + 1);
    setFlyingItems(prev => [...prev, { id, startX, startY, image }]);
  }, [itemId]);

  const removeFlyingItem = useCallback((id: number) => {
    setFlyingItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <FlyToCartContext.Provider value={{ startFlyAnimation }}>
      {children}
      {flyingItems.map(item => (
        <FlyingDot key={item.id} item={item} onComplete={() => removeFlyingItem(item.id)} />
      ))}
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (context === undefined) {
    throw new Error('useFlyToCart must be used within a FlyToCartProvider');
  }
  return context;
}

function FlyingDot({ item, onComplete }: { item: FlyingItem, onComplete: () => void }) {
  const [position, setPosition] = useState({ x: item.startX, y: item.startY });
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      // Find the cart icon (works for both mobile and desktop)
      let cartIcon = document.getElementById('global-cart-icon-mobile');
      if (!cartIcon || cartIcon.offsetParent === null) {
        cartIcon = document.getElementById('global-cart-icon-desktop');
      }

      if (cartIcon) {
        const rect = cartIcon.getBoundingClientRect();
        // Calculate center of the cart icon
        const endX = rect.left + rect.width / 2;
        const endY = rect.top + rect.height / 2;
        
        setIsAnimating(true);
        setPosition({ x: endX, y: endY });
        setScale(0.1);
        setOpacity(0.2);
        
        // Trigger bump effect exactly when it lands
        setTimeout(() => {
          if (cartIcon) {
            cartIcon.classList.remove('animate-cart-bump');
            void cartIcon.offsetWidth; // trigger reflow
            cartIcon.classList.add('animate-cart-bump');
          }
        }, 600);
      } else {
        onComplete();
        return;
      }
    });

    const timer = setTimeout(() => {
      onComplete();
    }, 700);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '40px',
        height: '40px',
        marginLeft: '-20px',
        marginTop: '-20px',
        opacity: opacity,
        transform: `scale(${scale})`,
        // Use a nice arc curve if possible, but cubic-bezier gives a good sweep
        transition: isAnimating ? 'left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.6s cubic-bezier(0.5, 0, 0.8, 0.2), transform 0.6s ease-in, opacity 0.6s ease-in' : 'none',
        zIndex: 9999,
        pointerEvents: 'none',
        borderRadius: '50%',
        backgroundColor: item.image ? 'transparent' : '#FFD700',
        boxShadow: item.image ? 'none' : '0 4px 12px rgba(255, 215, 0, 0.6)',
        backgroundImage: item.image ? `url(${item.image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
