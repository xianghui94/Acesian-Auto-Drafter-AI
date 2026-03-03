
import { DuctParams } from "../../types";
import { createSvg, drawDim, drawFlange, VIEW_BOX_SIZE, V_CONSTANTS } from "../svgUtils";

const { MAX_DIAM: V_DIAM } = V_CONSTANTS;

export const generateVolumeDamper = (params: DuctParams, activeField: string | null = null) => {
    const VIEW_WIDTH = VIEW_BOX_SIZE;
    const VIEW_HEIGHT = 500;
    const cy = VIEW_HEIGHT / 2;
    const D = V_DIAM + 30;
    const L = 150;

    // Centered View Calculations
    // Total Width = D (Front View) + Gap + L (Side View)
    // Approximate Gap = 100
    // Total W approx 230 + 100 + 150 = 480.
    // Center of this block should be at VIEW_WIDTH/2 (400)
    // Start X = 400 - 480/2 = 160

    const cxFront = 250;
    const cxSide = 550;
    const rOuter = (D / 2) + 12;

    const frontFlange = `<circle cx="${cxFront}" cy="${cy}" r="${rOuter}" class="line" fill="none" />`;
    const frontInner = `<circle cx="${cxFront}" cy="${cy}" r="${D / 2}" class="line" />`;
    const rBolt = rOuter - 6;
    const bolts = `
        <circle cx="${cxFront}" cy="${cy - rBolt}" r="3" fill="var(--svg-stroke)" />
        <circle cx="${cxFront}" cy="${cy + rBolt}" r="3" fill="var(--svg-stroke)" />
        <circle cx="${cxFront - rBolt}" cy="${cy}" r="3" fill="var(--svg-stroke)" />
        <circle cx="${cxFront + rBolt}" cy="${cy}" r="3" fill="var(--svg-stroke)" />
    `;
    const cLines = `
        <line x1="${cxFront - rOuter - 15}" y1="${cy}" x2="${cxFront + rOuter + 15}" y2="${cy}" class="center-line" />
        <line x1="${cxFront}" y1="${cy - rOuter - 15}" x2="${cxFront}" y2="${cy + rOuter + 15}" class="center-line" />
        <line x1="${cxSide - L / 2 - 15}" y1="${cy}" x2="${cxSide + L / 2 + 15}" y2="${cy}" class="center-line" />
    `;
    const blade = `<ellipse cx="${cxFront}" cy="${cy}" rx="${D / 2}" ry="${D / 2 * 0.3}" fill="none" stroke="var(--svg-stroke)" stroke-width="1" />`;

    const dimD = drawDim(cxFront - rOuter, cy, cxFront + rOuter, cy, `Ø${params.d1}`, 'top', rOuter + 25, 'd1', activeField);

    const xLeft = cxSide - L / 2;
    const xRight = cxSide + L / 2;
    const yTop = cy - D / 2;

    const sideRect = `<rect x="${xLeft}" y="${yTop}" width="${L}" height="${D}" class="line" />`;
    const f1 = drawFlange(xLeft, cy, D, true, 'normal', 'left');
    const f2 = drawFlange(xRight, cy, D, true, 'normal', 'right');

    const dimL = drawDim(xLeft, yTop, xRight, yTop, `L=${params.length}`, 'top', null, 'length', activeField);

    let mechanism = "";
    const pSize = 50;
    mechanism += `<rect x="${cxSide - pSize / 2}" y="${cy - pSize / 2}" width="${pSize}" height="${pSize}" fill="var(--svg-fill)" stroke="var(--svg-stroke)" stroke-width="1" />`;

    if (params.actuation === "Handle") {
        const qR = 18;
        const qPath = `M${cxSide - qR},${cy} A${qR},${qR} 0 0,1 ${cxSide},${cy - qR}`;
        mechanism += `<path d="${qPath}" fill="none" stroke="var(--svg-stroke)" stroke-width="1" />`;
        mechanism += `<line x1="${cxSide - qR}" y1="${cy}" x2="${cxSide + qR}" y2="${cy}" stroke="var(--svg-stroke)" stroke-width="0.5" />`;
        const hW = 12;
        const hL = 80;
        mechanism += `<rect x="${cxSide - hW / 2}" y="${cy - 8}" width="${hW}" height="${hL}" rx="${hW / 2}" fill="var(--svg-fill)" stroke="var(--svg-stroke)" stroke-width="2" />`;
        mechanism += `<circle cx="${cxSide}" cy="${cy}" r="4" fill="var(--svg-stroke)" />`;
    } else {
        const gSize = 35;
        mechanism += `<rect x="${cxSide - gSize / 2}" y="${cy - gSize / 2}" width="${gSize}" height="${gSize}" fill="var(--svg-fill)" stroke="var(--svg-stroke)" stroke-width="1" />`;
        const wR = 20;
        mechanism += `<circle cx="${cxSide}" cy="${cy}" r="${wR}" fill="var(--svg-fill)" stroke="var(--svg-stroke)" stroke-width="2" />`;
        mechanism += `<line x1="${cxSide - wR}" y1="${cy}" x2="${cxSide + wR}" y2="${cy}" stroke="var(--svg-stroke)" stroke-width="1" />`;
        mechanism += `<line x1="${cxSide}" y1="${cy - wR}" x2="${cxSide}" y2="${cy + wR}" stroke="var(--svg-stroke)" stroke-width="1" />`;
        mechanism += `<circle cx="${cxSide}" cy="${cy}" r="5" fill="var(--svg-stroke)" />`;
        mechanism += `<line x1="${cxSide}" y1="${cy + wR}" x2="${cxSide}" y2="${cy + wR + 15}" stroke="var(--svg-stroke)" stroke-width="3" />`;
        mechanism += `<line x1="${cxSide - 15}" y1="${cy + wR + 15}" x2="${cxSide + 15}" y2="${cy + wR + 15}" stroke="var(--svg-stroke)" stroke-width="3" />`;
    }
    // --- View Labels ---
    const yBottom = Math.max(cy + D / 2, cy + rOuter);
    const titles = `
        <text x="${cxFront}" y="${yBottom + 60}" text-anchor="middle" class="title-text">FRONT VIEW</text>
        <text x="${cxSide}" y="${yBottom + 60}" text-anchor="middle" class="title-text">SIDE VIEW</text>
    `;

    return createSvg(frontFlange + frontInner + bolts + blade + cLines + dimD + sideRect + f1 + f2 + dimL + mechanism + titles, VIEW_WIDTH, VIEW_HEIGHT);
};
