import React, { createContext, useContext } from 'react';

// Context for global form validation state
export const ValidationContext = createContext<Set<string>>(new Set());

// Common interface for inputs
interface BaseInputProps {
    label: string;
    value: number | string;
    onChange: (val: any) => void;
    suffix?: string;
    step?: number;
    // New props for highlighting and error handling
    fieldId?: string;
    onFocus?: (id: string) => void;
    onBlur?: () => void;
    error?: boolean;
}

export const NumInput = ({ label, value, onChange, suffix, step = 10, fieldId, onFocus, onBlur, error }: BaseInputProps) => {
    // Determine suffix based on label if not provided
    const displaySuffix = suffix || (label.toLowerCase().includes('angle') || label.includes('°') ? '°' : 'mm');
    // Sanitize label for ID if not provided
    const safeId = fieldId || label.toLowerCase().replace(/[^a-z0-9]/g, '');

    const contextErrors = useContext(ValidationContext);
    const hasError = error || contextErrors.has(safeId);

    const baseInputClasses = "w-full p-2.5 bg-white dark:bg-cad-800 border rounded text-cad-900 dark:text-cad-100 text-sm font-mono outline-none transition-all";
    const errorClasses = hasError ? "border-red-500 ring-1 ring-red-500 focus:border-red-600 focus:ring-red-600" : "border-cad-300 dark:border-cad-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={safeId}
                className={`block text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors ${hasError ? 'text-red-600 dark:text-red-400' : 'text-cad-700 dark:text-cad-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >{label}</label>
            <div className="relative group">
                <input
                    id={safeId}
                    type="number"
                    min="0"
                    value={value}
                    onKeyDown={(e) => {
                        // Prevent entering negative signs or invalid characters
                        if (['-', '+', 'e', 'E'].includes(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    onChange={(e) => {
                        // Extra safety validation
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                            onChange(val);
                        }
                    }}
                    onFocus={() => onFocus && onFocus(safeId)}
                    onBlur={() => onBlur && onBlur()}
                    className={`${baseInputClasses} ${errorClasses} pr-10`}
                />
                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-cad-500 dark:text-cad-400 text-xs font-semibold pointer-events-none">
                    {displaySuffix}
                </span>

                {/* Stepper Buttons (Visible on Hover/Focus) */}
                <div className="absolute right-0 top-0 h-full flex flex-col border-l border-cad-200 dark:border-cad-600 opacity-0 group-hover:opacity-100 transition-opacity bg-cad-50 dark:bg-cad-800 rounded-r w-7">
                    <button
                        tabIndex={-1}
                        onClick={() => onChange(Number(value) + (step))}
                        className="flex-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-cad-600 dark:text-cad-300 text-[10px] leading-none border-b border-cad-200 dark:border-cad-600 transition-colors"
                    >▲</button>
                    <button
                        tabIndex={-1}
                        onClick={() => onChange(Number(value) - (step))}
                        className="flex-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-cad-600 dark:text-cad-300 text-[10px] leading-none transition-colors"
                    >▼</button>
                </div>
            </div>
        </div>
    );
};

export const TextInput = ({ label, value, onChange, fieldId, onFocus, onBlur, error }: BaseInputProps) => {
    const safeId = fieldId || label.toLowerCase().replace(/[^a-z0-9]/g, '');

    const contextErrors = useContext(ValidationContext);
    const hasError = error || contextErrors.has(safeId);

    const baseInputClasses = "w-full p-2.5 bg-white dark:bg-cad-800 border rounded text-cad-900 dark:text-cad-100 text-sm focus:outline-none transition-all";
    const errorClasses = hasError ? "border-red-500 ring-1 ring-red-500 focus:border-red-600 focus:ring-red-600" : "border-cad-300 dark:border-cad-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={safeId}
                className={`block text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors ${hasError ? 'text-red-600 dark:text-red-400' : 'text-cad-700 dark:text-cad-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >{label}</label>
            <input
                id={safeId}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => onFocus && onFocus(safeId)}
                onBlur={() => onBlur && onBlur()}
                className={`${baseInputClasses} ${errorClasses}`}
            />
        </div>
    );
};

export const TextAreaInput = ({ label, value, onChange, fieldId, onFocus, onBlur, error }: BaseInputProps) => {
    const safeId = fieldId || label.toLowerCase().replace(/[^a-z0-9]/g, '');

    const contextErrors = useContext(ValidationContext);
    const hasError = error || contextErrors.has(safeId);

    const baseInputClasses = "w-full p-2.5 bg-white dark:bg-cad-800 border rounded text-cad-900 dark:text-cad-100 text-sm font-sans resize-y focus:outline-none transition-all";
    const errorClasses = hasError ? "border-red-500 ring-1 ring-red-500 focus:border-red-600 focus:ring-red-600" : "border-cad-300 dark:border-cad-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={safeId}
                className={`block text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors ${hasError ? 'text-red-600 dark:text-red-400' : 'text-cad-700 dark:text-cad-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >{label}</label>
            <textarea
                id={safeId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => onFocus && onFocus(safeId)}
                onBlur={() => onBlur && onBlur()}
                className={`${baseInputClasses} ${errorClasses}`}
                rows={3}
            />
        </div>
    );
};

export const SelectInput = ({ label, value, options, onChange, fieldId, onFocus, onBlur, error }: { label: string, value: string | number, options: (string | number)[], onChange: (v: string) => void, fieldId?: string, onFocus?: (id: string) => void, onBlur?: () => void, error?: boolean }) => {
    const safeId = fieldId || label.toLowerCase().replace(/[^a-z0-9]/g, '');

    const contextErrors = useContext(ValidationContext);
    const hasError = error || contextErrors.has(safeId);

    const baseInputClasses = "w-full p-2.5 bg-white dark:bg-cad-800 border rounded text-cad-900 dark:text-cad-100 text-sm font-mono appearance-none focus:outline-none transition-all";
    const errorClasses = hasError ? "border-red-500 ring-1 ring-red-500 focus:border-red-600 focus:ring-red-600" : "border-cad-300 dark:border-cad-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={safeId}
                className={`block text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors ${hasError ? 'text-red-600 dark:text-red-400' : 'text-cad-700 dark:text-cad-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >{label}</label>
            <div className="relative">
                <select
                    id={safeId}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => onFocus && onFocus(safeId)}
                    onBlur={() => onBlur && onBlur()}
                    className={`${baseInputClasses} ${errorClasses}`}
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cad-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>
        </div>
    );
};