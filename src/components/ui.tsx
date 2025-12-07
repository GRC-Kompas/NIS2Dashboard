import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white border border-brand-border shadow-sm rounded-lg overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, children, subtitle }: { title: string; children?: React.ReactNode, subtitle?: string }) {
    return (
        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-gray-50/50">
            <div>
                <h3 className="text-lg leading-6 font-semibold text-brand-dark">{title}</h3>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {children}
        </div>
    )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-6 py-6", className)}>
            {children}
        </div>
    )
}

export function Badge({ children, color = 'blue', className }: { children: React.ReactNode; color?: 'blue' | 'red' | 'green' | 'yellow' | 'gray' | 'brand', className?: string }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
        red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
        green: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
        yellow: 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
        gray: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10',
        brand: 'bg-sky-50 text-brand-primary ring-1 ring-inset ring-brand-primary/20'
    }
    return (
        <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium", colors[color], className)}>
            {children}
        </span>
    )
}

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline',
    size?: 'sm' | 'md' | 'lg'
}) {
    const variants = {
        primary: "bg-brand-primary text-white hover:bg-sky-700 shadow-sm",
        secondary: "bg-brand-dark text-white hover:bg-gray-800 shadow-sm",
        outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
    }
    const sizes = {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    }
    return (
        <button
            className={cn(
                "inline-flex items-center border border-transparent font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
