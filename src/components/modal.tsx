import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface IModalProps {
  trigger: string | React.ReactNode;
  content: IModalContentProps;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type IModalContentProps = IModalDirectContentProps | IModalGeneralContentProps;

interface IModalDirectContentProps {
  variant: 'direct';
  directContent: React.ReactNode;
}

interface IModalGeneralContentProps {
  variant: 'general';
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: string | React.ReactNode;
}

export default function Modal(props: IModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger>{props.trigger}</DialogTrigger>
      <DialogContent
        className={props.content.variant === 'direct' ? 'p-0' : ''}
      >
        {props.content.variant === 'direct' ? (
          <>
            <DialogTitle className="sr-only">Dialog</DialogTitle>
            <DialogDescription className="sr-only">
              Dialog login atau daftar
            </DialogDescription>
            {props.content.directContent}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="mt-8">{props.content.title}</DialogTitle>
              <DialogDescription>{props.content.description}</DialogDescription>
            </DialogHeader>
            {props.content.children}
            {props.content.footer && (
              <DialogFooter>{props.content.footer}</DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
