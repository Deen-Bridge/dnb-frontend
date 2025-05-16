'use client';

import React from 'react';
import { Loader2Icon } from 'lucide-react';
import Ripples from 'react-ripples';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { poppins_500 } from '@/lib/config/font.config';

const Button = ({
    children,
    loaderSize = 25,
    className,
    to,
    download,
    type,
    wide,
    outlined,
    loading,
    round,
    onClick,
    disabled,
    loaderColor,
    id,
    childrenClassName,
    ...props
}) => {
    const commonClasses = cn(
        wide && 'flex-grow w-full',
        outlined && 'border border-accent bg-white hover:bg-accent text-black hover:text-white animate-in-out transition-all delay-100',
        round ? 'rounded-full' : 'rounded-lg',
        'inline-block py-2 px-4 font-medium flex items-center justify-center cursor-pointer flex-shrink-0 font-nunito font-normal',
        poppins_500.className,
        className
    );

    const commonProps = {
        className: commonClasses,
        disabled: disabled || loading,
        id,
    };

    if (to) {
        if (disabled) {
            return (
                <span {...props} {...commonProps}>
                    {children}
                </span>
            );
        } else {
            return (
                <Link download={download} href={to} className="overflow-hidden">
                    <button
                        type={type}
                        {...props}
                        disabled={commonProps.disabled}
                        id={commonProps.id}
                        className={cn(wide && 'w-full flex-grow')}
                    >
                        <div
                            id={commonProps.id}
                            className={cn(
                                'hover:!shadow-none !shadow-none inline-block',
                                commonProps.className
                            )}
                            onClick={onClick}
                            itemScope
                        >
                            <p
                                className={cn(
                                    'text-clash-grotesk font-medium flex items-center justify-center space-x-2',
                                    childrenClassName
                                )}
                            >
                                {loading ? (
                                    <FaSpinner
                                        className="animate-spin"
                                        color={loaderColor}
                                        size={loaderSize}
                                    />
                                ) : (
                                    children
                                )}
                            </p>
                        </div>
                    </button>
                </Link>
            );
        }
    }
    return (
        <button
            type={type}
            {...props}
            disabled={commonProps.disabled}
            id={commonProps.id}
            className={cn(wide && 'w-full flex-grow h-auto focus:outline-none border-none text-white')}
        >
            <Ripples
                id={commonProps.id}
                className={cn(
                    'hover:!shadow-none !shadow-none inline-block',
                    commonProps.className
                )}
                onClick={onClick}
                itemScope
            >
                <div
                    className={cn(
                        'text-clash-grotesk font-medium flex items-center justify-center space-x-2',
                        childrenClassName
                    )}
                >
                    {loading ? (
                        <Loader2Icon
                            className="animate-spin"
                            color={loaderColor}
                            size={loaderSize}
                        />
                    ) : (
                        children
                    )}
                </div>
            </Ripples>
        </button>
    );
};

export default Button;