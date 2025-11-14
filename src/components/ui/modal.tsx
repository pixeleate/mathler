'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  maxHeight?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  maxHeight = 'max-h-[90vh]',
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`w-full max-w-md ${maxHeight} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 text-sm text-gray-700 dark:text-gray-300'>
          {children}
        </div>

        {actions && <div className='mt-6 flex justify-end'>{actions}</div>}
      </DialogContent>
    </Dialog>
  );
};

interface ModalActionsProps {
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
  };
  className?: string;
}

export const ModalActions = ({
  primaryAction,
  secondaryAction,
  className = 'flex gap-2',
}: ModalActionsProps) => {
  return (
    <div className={className}>
      {primaryAction && (
        <Button
          onClick={primaryAction.onClick}
          variant={primaryAction.variant || 'default'}
          className='flex-1'
        >
          {primaryAction.label}
        </Button>
      )}
      {secondaryAction && (
        <Button
          onClick={secondaryAction.onClick}
          variant={secondaryAction.variant || 'outline'}
          className='flex-1'
        >
          {secondaryAction.label}
        </Button>
      )}
    </div>
  );
};
