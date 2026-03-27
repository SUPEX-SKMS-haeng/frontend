import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

/* Modal 본체 컴포넌트 선언 */
const ModalMain = ({ isOpen, onClose, size = 'lg', children }: ModalProps) => {
  /* ESC 키를 누르면 onClose가 호출되어 모달이 사라지도록 처리되어 있음 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className={clsx(
          'w-full bg-white rounded-xl shadow-lg border border-neutral-200 flex flex-col',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

interface ModalHeaderProps {
  title: ReactNode;
  onClose: () => void;
}

/* 모달 헤더 컴포넌트: 닫기 버튼 접근성(type='button', aria-label) 속성 및 시맨틱 보완 */
const ModalHeader = function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <div className='flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0'>
      <h2 className='text-lg font-bold text-neutral-900'>{title}</h2>
      <button
        type='button'
        aria-label='닫기'
        onClick={onClose}
        className='p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors'
      >
        <X className='w-5 h-5' />
      </button>
    </div>
  );
};

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

/* 모달 본문 영역 컴포넌트 */
const ModalBody = function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={clsx('px-6 py-5', className)}>{children}</div>;
};

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

/* 모달 하단(Action) 영역 컴포넌트 */
const ModalFooter = function ModalFooter({
  children,
  className,
}: ModalFooterProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-100 shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
};

/* Modal에 Header, Body, Footer를 속성으로 결합하여 Compound Component 형태로 내보냄 (TypeScript 교차 타입 추론 완벽 지원) */
export const Modal = Object.assign(ModalMain, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
