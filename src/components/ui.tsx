import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white shadow rounded-lg overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            {children}
        </div>
    )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-4 py-5 sm:p-6", className)}>
            {children}
        </div>
    )
}

export function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'red' | 'green' | 'yellow' | 'gray' }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-800',
        red: 'bg-red-100 text-red-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        gray: 'bg-gray-100 text-gray-800'
    }
    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colors[color])}>
            {children}
        </span>
    )
}
