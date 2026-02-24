import { DuctParams } from '../../types';

export const generateCustom = (params: DuctParams): string => {
  const { hideImage = false } = params;

  if (params.imageUrl && !hideImage) {
    // Return a pristine, full-bleed 100% Raw IMG tag, skipping SVG entirely
    return `
<img src="${params.imageUrl}" style="width: 100%; height: 100%; object-fit: contain; display: block; border: none; padding: 0; margin: 0;" />
    `.trim();
  }

  // Render a hyper-minimalist blank placeholder when there's no image
  return `
<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: transparent;">
  <span style="font-family: sans-serif; font-size: 14px; font-weight: bold; color: #94a3b8; user-select: none;">
    See Attached Reference
  </span>
</div>
  `.trim();
};
