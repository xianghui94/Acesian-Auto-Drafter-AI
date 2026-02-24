
import React from 'react';
import { DuctParams } from '../../types';
import { NumInput, TextAreaInput, SelectInput } from '../InputFields';

interface InputProps {
    params: DuctParams;
    onChange: (key: string, val: any) => void;
    onFocus?: (id: string) => void;
    onBlur?: () => void;
}

export const VolumeDamperInputs: React.FC<InputProps> = ({ params, onChange, onFocus, onBlur }) => (
    <>
        <NumInput label="Diameter Ø" fieldId="d1" value={params.d1} onChange={v => onChange('d1', v)} onFocus={onFocus} onBlur={onBlur} />
        <div>
            <label className="block text-[10px] uppercase font-bold text-cad-400 mb-1">Length L (Fixed)</label>
            <input
                type="number"
                value={params.length}
                disabled
                className="w-full p-2 border border-cad-200 bg-cad-50 rounded text-sm font-mono text-cad-500 cursor-not-allowed"
            />
        </div>
        <SelectInput
            label="Actuation"
            value={params.actuation}
            options={["Handle", "Worm Gear"]}
            onChange={v => onChange('actuation', v)}
        />
    </>
);

export const MultibladeDamperInputs: React.FC<InputProps> = ({ params, onChange, onFocus, onBlur }) => (
    <>
        <NumInput label="Diameter Ø" fieldId="d1" value={params.d1} onChange={v => onChange('d1', v)} onFocus={onFocus} onBlur={onBlur} />
        <NumInput label="Length L" fieldId="length" value={params.length} onChange={v => onChange('length', v)} onFocus={onFocus} onBlur={onBlur} />
        <SelectInput
            label="Blade Type"
            value={params.bladeType}
            options={["Parallel", "Opposed"]}
            onChange={v => onChange('bladeType', v)}
        />
    </>
);

export const BlindPlateInputs: React.FC<InputProps> = ({ params, onChange, onFocus, onBlur }) => (
    <>
        <NumInput label="Diameter Ø" fieldId="d1" value={params.d1} onChange={v => onChange('d1', v)} onFocus={onFocus} onBlur={onBlur} suffix="mm" />
        <div className="grid grid-cols-2 gap-2">
            <NumInput label="P.C.D" fieldId="pcd" value={params.pcd} onChange={v => onChange('pcd', v)} onFocus={onFocus} onBlur={onBlur} suffix="mm" />
            <NumInput label="Holes" fieldId="holeCount" value={params.holeCount} onChange={v => onChange('holeCount', v)} onFocus={onFocus} onBlur={onBlur} suffix="" step={2} />
        </div>
    </>
);

export const BlastGateDamperInputs: React.FC<InputProps> = ({ params, onChange, onFocus, onBlur }) => (
    <>
        <NumInput label="Diameter Ø" fieldId="d1" value={params.d1} onChange={v => onChange('d1', v)} onFocus={onFocus} onBlur={onBlur} />
        <NumInput label="Length L" fieldId="length" value={params.length} onChange={v => onChange('length', v)} onFocus={onFocus} onBlur={onBlur} />
    </>
);

export const AngleFlangeInputs: React.FC<InputProps> = ({ params, onChange, onFocus, onBlur }) => (
    <>
        <NumInput label="Diameter Ø" fieldId="d1" value={params.d1} onChange={v => onChange('d1', v)} onFocus={onFocus} onBlur={onBlur} />
        <div className="grid grid-cols-2 gap-2">
            <NumInput label="P.C.D" fieldId="pcd" value={params.pcd} onChange={v => onChange('pcd', v)} onFocus={onFocus} onBlur={onBlur} suffix="mm" />
            <NumInput label="Holes" fieldId="holeCount" value={params.holeCount} onChange={v => onChange('holeCount', v)} onFocus={onFocus} onBlur={onBlur} suffix="" step={2} />
        </div>
    </>
);

export const ManualInputs: React.FC<InputProps> = ({ params, onChange, onFocus, onBlur }) => (
    <div className="col-span-2 md:col-span-3 space-y-4">
        <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100 flex items-start gap-2">
            <span className="text-lg">ℹ️</span>
            <span><strong>Manual Mode:</strong> Parametric sketch generation is disabled. Please enter a custom description below. The sketch area will be left blank.</span>
        </div>
        <TextAreaInput
            label="Description"
            value={params.userDescription || ""}
            onChange={v => onChange('userDescription', v)}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    </div>
);

export const CustomInputs: React.FC<InputProps> = ({ params, onChange, onFocus, onBlur }) => {

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            onChange('imageUrl', reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="col-span-2 md:col-span-3 space-y-4">
            <div className="p-4 bg-purple-50 text-purple-700 text-sm rounded border border-purple-100 flex items-start gap-2">
                <span className="text-lg">🛠️</span>
                <span><strong>Non-Standard / Custom Item selected.</strong> Geometric parameters are disabled. Please provide the explicit Item Name. You can use the Note field below to attach drawing references.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                    <label className="block text-[10px] uppercase font-bold text-cad-500 dark:text-cad-400 mb-1">Item Name / 零件名称 <span className="text-red-500">*</span></label>
                    <input
                        id="itemName"
                        type="text"
                        value={params.itemName || ""}
                        onChange={e => onChange('itemName', e.target.value)}
                        onFocus={() => onFocus && onFocus('itemName')}
                        onBlur={onBlur}
                        className="w-full p-2.5 bg-white dark:bg-cad-900 border border-cad-300 dark:border-cad-600 rounded text-cad-900 dark:text-cad-100 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-sm font-medium"
                        placeholder="e.g. Custom Filter Box 600x600"
                    />
                </div>

                <div className="w-full flex flex-col justify-end">
                    <label className="block text-[10px] uppercase font-bold text-cad-500 dark:text-cad-400 mb-1">Attached Reference Drawing (Optional)</label>
                    <div className="flex items-center gap-2 h-[42px]">
                        <label className="flex-1 cursor-pointer bg-white text-cad-700 text-center text-xs font-bold border border-cad-300 rounded hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm h-full flex items-center justify-center">
                            {params.imageUrl ? '✓ Image Attached (Click to Replace)' : '📎 Upload Image / PDF Screenshot'}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                        {params.imageUrl && (
                            <button
                                onClick={() => onChange('imageUrl', '')}
                                className="px-3 h-full bg-red-50 text-red-600 border border-red-200 rounded font-bold hover:bg-red-100 transition"
                                title="Remove Attachment"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
