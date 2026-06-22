"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isDanger?: boolean;
}

export function Modal({ isOpen, onClose, title, children, icon, isDanger }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="p-8 text-center">
          {/* Icon */}
          {icon && (
            <div className={`mx-auto w-14 h-14 flex items-center justify-center rounded-full mb-5 ${
              isDanger
                ? 'bg-status-nonaktif text-status-nonaktif-text'
                : 'bg-primary-subtle text-primary'
            }`}>
              {icon}
            </div>
          )}

          <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>

          <div className="text-sm text-text-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
