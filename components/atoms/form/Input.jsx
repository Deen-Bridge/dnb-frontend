'use client';
import React, { useState } from 'react';
import { EyeIcon } from 'lucide-react';
import { EyeClosed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { poppins_400 } from '@/app/lib/config/font.config';

const Input = ({
    type = 'text',
    label,
    className,
    inputClassName,
    id,
    value,
    handleChange,
    required = true,
    name = '',
    placeholder,
    errMsg,
    min,
    max,
    maxLength,
    minLength,
    autoComplete,
    register,
    labelClassName,
    disabled,
    ...props
}) => {
    const [passwordShown, setPasswordShown] = useState(false);

    return (
        <div className={cn('w-full', poppins_400.className)}>
            <label
                htmlFor={id}
                className={cn(
                    'block text-left w-full text-base mb-2 text-gray6',
                    labelClassName,
                    poppins_400.className
                )}
            >
                {label}
            </label>
            <div
                className={cn(
                    'border border-[#D9DCE0] rounded-lg w-full p-4 outline-none flex items-center',
                    className
                )}
            >
                <input
                    className={cn(
                        'bg-transparent text-gray1 w-full outline-none',
                        inputClassName
                    )}
                    {...props}
                    value={value}
                    required={required}
                    name={name}
                    onChange={handleChange}
                    type={passwordShown ? 'text' : type}
                    id={id}
                    placeholder={placeholder || ' '}
                    min={min}
                    max={max}
                    maxLength={maxLength}
                    minLength={minLength}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    {...register}
                />

                {type === 'password' && (
                    <div
                        className="flex items-center cursor-pointer mx-4 no-select"
                        onClick={() => setPasswordShown(!passwordShown)}
                    >
                        {passwordShown ? <EyeIcon /> : <EyeClosed />}
                    </div>
                )}
            </div>

            <span
                className={`text-[indianred] text-2 w-fit text-left float-left mt-0`}
            >
                {errMsg}
            </span>
        </div>
    );
};

export default Input;