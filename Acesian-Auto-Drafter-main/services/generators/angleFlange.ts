import { DuctParams } from "../../types";
import { createSvg, drawDim, drawAnnotation, VIEW_BOX_SIZE } from "../svgUtils";
import { getFlangeParams } from "../flangeStandards";

export const generateAngleFlange = (params: DuctParams, activeField: string | null = null) => {
    const VIEW_WIDTH = VIEW_BOX_SIZE;
    const VIEW_HEIGHT = 450;
    const cx = VIEW_WIDTH / 2;
    // Shift the center downwards to explicitly make room for the Top Dimension text
    const cy = VIEW_HEIGHT / 2 + 25;

    const realD1 = params.d1 || 800;

    const std = getFlangeParams(realD1);
    const realPCD = params.pcd !== undefined ? params.pcd : std.bcd;
    const numBolts = params.holeCount !== undefined ? params.holeCount : std.holeCount;

    // Detect Manual Override
    const isManual = (params.pcd !== undefined && params.pcd !== std.bcd) ||
        (params.holeCount !== undefined && params.holeCount !== std.holeCount);

    // Scale logic - Strictly proportional to real world dimensions
    const realOD = params.pcd !== undefined ?
        realPCD + (std.od - std.bcd) : std.od;

    // Buffer algorithm: We must leave visual room for the Dimension Line and its Text at the top.
    // dimOffset is V_R_OD + 30. Text is typically 15px high. 
    // Max V_R_OD = (targetDiam/2). So (targetDiam/2) + 45 must be < (VIEW_HEIGHT/2)
    // targetDiam < VIEW_HEIGHT - 90
    const targetDiam = VIEW_HEIGHT - 120; // Fit comfortably within 450px height while leaving top buffer
    const scale = targetDiam / realOD;

    let V_R_ID = (realD1 / 2) * scale;
    let V_R_PCD = (realPCD / 2) * scale;
    let V_R_OD = (realOD / 2) * scale;

    // Fallback for gigantic ducts (e.g., D=3000) where the flange on screen would be < 10 pixels wide
    const flangeVisualWidth = V_R_OD - V_R_ID;
    if (flangeVisualWidth < 24) {
        const add = 24 - flangeVisualWidth;
        const pcdRatio = (realPCD - realD1) / (realOD - realD1); // Typically ~0.6
        V_R_PCD += add * pcdRatio;
        V_R_OD += add;
    }

    // Flange Body (Concentric Circles)
    const odCircle = `<circle cx="${cx}" cy="${cy}" r="${V_R_OD}" class="line" fill="none" />`;
    const idCircle = `<circle cx="${cx}" cy="${cy}" r="${V_R_ID}" class="line" fill="none" />`;
    const pcdCircle = `<circle cx="${cx}" cy="${cy}" r="${V_R_PCD}" class="phantom-line" />`;

    // Crosshair Center Lines
    const cLen = V_R_OD + 30;
    const centerLines = `
        <line x1="${cx - cLen}" y1="${cy}" x2="${cx + cLen}" y2="${cy}" class="center-line" />
        <line x1="${cx}" y1="${cy - cLen}" x2="${cx}" y2="${cy + cLen}" class="center-line" />
    `;

    // Bolt Holes & Annotation
    let holes = "";
    let annotation = "";
    const targetHoleIdx = Math.round(numBolts / 4); // Target hole at ~90deg (3 o'clock)

    for (let i = 0; i < numBolts; i++) {
        // Start from -90 (Top)
        const rad = (i * (360 / numBolts) - 90) * Math.PI / 180;
        const bx = cx + V_R_PCD * Math.cos(rad);
        const by = cy + V_R_PCD * Math.sin(rad);

        holes += `<circle cx="${bx}" cy="${by}" r="2.5" fill="none" stroke="var(--svg-stroke)" stroke-width="1.5" />`;

        // Point to the target hole (Right side) if manual override exists
        if (isManual && i === targetHoleIdx) {
            // Leader goes Down-Right to avoid Top Dimension collision
            annotation = drawAnnotation(bx, by, `P.C.D: ${realPCD}\n${numBolts} HOLES`, false, true, 45, false).svg;
        }
    }

    // Dimension Pattern
    const dimOffset = V_R_OD + 25;
    const dim = drawDim(cx - V_R_ID, cy, cx + V_R_ID, cy, `Ø${realD1}`, 'top', dimOffset, 'd1', activeField);

    return createSvg(odCircle + idCircle + pcdCircle + centerLines + holes + dim + annotation, VIEW_WIDTH, VIEW_HEIGHT);
};
