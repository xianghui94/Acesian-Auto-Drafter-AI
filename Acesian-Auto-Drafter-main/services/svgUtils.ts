
/**
 * Shared Utilities for SVG Generation
 */

export const VIEW_BOX_SIZE = 800;

// Fixed visual constants (abstract units)
// These define the "Schematic" limits to prevent viewbox overflow.
export const V_CONSTANTS = {
  // Maximum visual dimensions (pixels) regardless of real input
  MAX_LEN: 360,
  MAX_DIAM: 200,

  // Specific sizing for schematic look
  TAP_STICKOUT: 40,
  BRANCH_MIN_LEN: 50,
  BRANCH_MAX_LEN: 100,

  // Transformation specific
  TRANS_MIN_LEN: 150,
  TRANS_MAX_LEN: 300,
  TRANS_TAN: 50
};

// Drawing Style Config
export const CFG = {
  strokeBody: 3,
  strokeFlange: 2.5,
  strokeDim: 1.5,
  textSize: 28,
  arrowSize: 14,
  dimOffset: 65,
  textOffset: 8
};

export const createSvg = (content: string, width: number = VIEW_BOX_SIZE, height: number = VIEW_BOX_SIZE) => {
  const viewBox = `0 0 ${width} ${height}`;

  // Calculate relative scale so wider views (1300) get larger text natively, 
  // preventing text shrink when the viewBox is squished into the grid.
  const scale = width / VIEW_BOX_SIZE;

  return `<svg viewBox="${viewBox}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <style>
      .line { fill: none; stroke: black; stroke-width: ${CFG.strokeBody * scale}; stroke-linecap: round; stroke-linejoin: round; transition: all 0.2s; }
      .flange { fill: white; stroke: black; stroke-width: ${CFG.strokeFlange * scale}; transition: all 0.2s; }
      .dim-line { stroke: red; stroke-width: ${CFG.strokeDim * scale}; transition: all 0.2s; pointer-events: all; }
      .dim-arrow { fill: red; stroke: none; transition: all 0.2s; pointer-events: all; }
      .dim-text { fill: red; font-family: sans-serif; font-size: ${CFG.textSize * scale}px; font-weight: bold; text-anchor: middle; paint-order: stroke fill; stroke: white; stroke-width: ${4 * scale}px; stroke-linejoin: round; transition: all 0.2s; cursor: pointer; pointer-events: all; }
      .center-line { stroke: #999; stroke-width: ${1 * scale}; stroke-dasharray: ${5 * scale},${3 * scale}; }
      .hidden-line { fill: none; stroke: black; stroke-width: ${1 * scale}; stroke-dasharray: ${3 * scale},${3 * scale}; }
      .phantom-line { fill: none; stroke: #999; stroke-width: ${0.5 * scale}; stroke-dasharray: ${10 * scale},${2 * scale},${2 * scale},${2 * scale}; }
      .npt-text { fill: #9333ea; font-family: sans-serif; font-size: ${CFG.textSize * scale}px; font-weight: bold; text-anchor: middle; paint-order: stroke fill; stroke: white; stroke-width: ${3 * scale}px; }

      .title-text { fill: black; font-family: sans-serif; font-size: ${24 * scale}px; font-weight: bold; text-anchor: middle; text-decoration: underline; }
      .large-title-text { fill: black; font-family: sans-serif; font-size: ${28 * scale}px; font-weight: bold; text-anchor: middle; }

      /* Highlighting Styles */
      .highlight { stroke: #2563eb !important; stroke-width: ${4 * scale}px !important; }
      .highlight.dim-text { fill: #2563eb !important; font-size: ${CFG.textSize * 1.3 * scale}px !important; }
      .highlight.dim-arrow { fill: #2563eb !important; }
      
      /* Hover Effect for Dimensions */
      g[data-param]:hover .dim-line { stroke: #2563eb; stroke-width: ${3 * scale}px; }
      g[data-param]:hover .dim-text { fill: #2563eb; }
      g[data-param]:hover .dim-arrow { fill: #2563eb; }
    </style>
    ${content}
  </svg>`;
};

export const drawArrow = (x: number, y: number, angleDeg: number, isHighlight: boolean = false) => {
  const size = isHighlight ? CFG.arrowSize * 1.5 : CFG.arrowSize;
  const rad = angleDeg * Math.PI / 180;
  const x1 = x - size * Math.cos(rad - Math.PI / 6);
  const y1 = y - size * Math.sin(rad - Math.PI / 6);
  const x2 = x - size * Math.cos(rad + Math.PI / 6);
  const y2 = y - size * Math.sin(rad + Math.PI / 6);
  const cls = isHighlight ? "dim-arrow highlight" : "dim-arrow";
  return `<polygon points="${x},${y} ${x1},${y1} ${x2},${y2}" class="${cls}" />`;
};

// Updated drawDim to accept an ID and the currently active ID
export const drawDim = (
  x1: number, y1: number, x2: number, y2: number,
  text: string,
  offsetDir: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
  customOffset: number | null = null,
  id: string | null = null,
  activeId: string | null = null
) => {
  const isVert = Math.abs(x1 - x2) < 1;
  const off = customOffset !== null ? customOffset : CFG.dimOffset;
  const isActive = id && activeId && (id === activeId);

  // Apply Highlight Classes
  const lineClass = isActive ? "dim-line highlight" : "dim-line";
  const textClass = isActive ? "dim-text highlight" : "dim-text";

  let dPath = "";
  let tx = 0, ty = 0;
  let arrows = "";
  let rotate = 0;
  let dy = "0";

  if (isVert) {
    // Vertical Dimension
    const lx = (offsetDir === 'right') ? x1 + off : x1 - off;

    // Draw extension lines and main line
    dPath = `M${x1},${y1} L${lx},${y1} M${x2},${y2} L${lx},${y2} M${lx},${y1} L${lx},${y2}`;

    arrows += drawArrow(lx, y1, -90, isActive); // Up
    arrows += drawArrow(lx, y2, 90, isActive);  // Down

    // Text Position: Center of line
    tx = lx;
    ty = (y1 + y2) / 2;
    rotate = -90;
    dy = "-0.4em"; // Moves text 'up' (left) relative to rotated baseline

  } else {
    // Horizontal Dimension
    const ly = (offsetDir === 'bottom') ? y1 + off : y1 - off;

    dPath = `M${x1},${y1} L${x1},${ly} M${x2},${y2} L${x2},${ly} M${x1},${ly} L${x2},${ly}`;

    arrows += drawArrow(x1, ly, 180, isActive); // Left
    arrows += drawArrow(x2, ly, 0, isActive);   // Right

    tx = (x1 + x2) / 2;
    ty = ly; // Text on line Y
    rotate = 0;
    dy = "-0.4em";
  }

  // Wrap in a group with data-param attribute for click handling
  const groupAttrs = id ? `data-param="${id}" style="cursor: pointer;"` : '';

  return `
    <g ${groupAttrs}>
        <path d="${dPath}" class="${lineClass}" />
        <text x="${tx}" y="${ty}" class="${textClass}" transform="rotate(${rotate}, ${tx}, ${ty})" dy="${dy}">${text}</text>
        ${arrows}
    </g>
  `;
};

export const drawFlange = (
  x: number,
  y: number,
  length: number,
  isVertical: boolean,
  type: 'normal' | 'small' = 'normal',
  dir: 'left' | 'right' | 'up' | 'down' | 'none' = 'none'
) => {
  const ext = type === 'small' ? 4 : 8; // Flange extension
  const thk = type === 'small' ? 3 : 4; // Flange thickness
  const leg = type === 'small' ? 6 : 10; // Flange inner leg length

  if (dir !== 'none') {
    if (dir === 'left') {
      return `<path d="M ${x},${y - length / 2 - ext} L ${x + thk},${y - length / 2 - ext} L ${x + thk},${y - length / 2} L ${x + leg},${y - length / 2} L ${x + leg},${y + length / 2} L ${x + thk},${y + length / 2} L ${x + thk},${y + length / 2 + ext} L ${x},${y + length / 2 + ext} Z" class="flange" />`;
    } else if (dir === 'right') {
      return `<path d="M ${x},${y - length / 2 - ext} L ${x - thk},${y - length / 2 - ext} L ${x - thk},${y - length / 2} L ${x - leg},${y - length / 2} L ${x - leg},${y + length / 2} L ${x - thk},${y + length / 2} L ${x - thk},${y + length / 2 + ext} L ${x},${y + length / 2 + ext} Z" class="flange" />`;
    } else if (dir === 'up') {
      return `<path d="M ${x - length / 2 - ext},${y} L ${x - length / 2 - ext},${y + thk} L ${x - length / 2},${y + thk} L ${x - length / 2},${y + leg} L ${x + length / 2},${y + leg} L ${x + length / 2},${y + thk} L ${x + length / 2 + ext},${y + thk} L ${x + length / 2 + ext},${y} Z" class="flange" />`;
    } else if (dir === 'down') {
      return `<path d="M ${x - length / 2 - ext},${y} L ${x - length / 2 - ext},${y - thk} L ${x - length / 2},${y - thk} L ${x - length / 2},${y - leg} L ${x + length / 2},${y - leg} L ${x + length / 2},${y - thk} L ${x + length / 2 + ext},${y - thk} L ${x + length / 2 + ext},${y} Z" class="flange" />`;
    }
  }

  if (isVertical) {
    // Pipe runs horizontal, flange is vertical line
    return `<rect x="${x - thk / 2}" y="${y - length / 2 - ext}" width="${thk}" height="${length + ext * 2}" class="flange" />`;
  } else {
    // Pipe runs vertical, flange is horizontal line
    return `<rect x="${x - length / 2 - ext}" y="${y - thk / 2}" width="${length + ext * 2}" height="${thk}" class="flange" />`;
  }
};

export const drawRotatedFlange = (cx: number, cy: number, length: number, angleDeg: number, type: 'normal' | 'small' = 'normal') => {
  const ext = type === 'small' ? 4 : 8;
  const thk = type === 'small' ? 3 : 4;
  const leg = type === 'small' ? 6 : 10;
  // A 'right' facing flange (flat face on right, extending left into duct)
  const d = `M ${cx},${cy - length / 2 - ext} L ${cx - thk},${cy - length / 2 - ext} L ${cx - thk},${cy - length / 2} L ${cx - leg},${cy - length / 2} L ${cx - leg},${cy + length / 2} L ${cx - thk},${cy + length / 2} L ${cx - thk},${cy + length / 2 + ext} L ${cx},${cy + length / 2 + ext} Z`;
  return `<path d="${d}" class="flange" transform="rotate(${angleDeg}, ${cx}, ${cy})" />`;
};

// --- Helper: Draw Annotation Leader ---
export const drawAnnotation = (
  x: number,
  y: number,
  text: string,
  isTop: boolean = true,
  isRight: boolean = true,
  leaderLength: number = 50,
  textBelow: boolean = false,
  customFontSize: number | null = null
) => {
  // Top annotation goes Up, Bot annotation goes Down
  // Use custom leaderLength if provided
  const dy = isTop ? -leaderLength : leaderLength;
  const dx = isRight ? 30 : -30;
  const x2 = x + dx;
  const y2 = y + dy;

  // Updated to match Dimension Text Size (CFG.textSize = 24) or use custom if provided
  const fontSize = customFontSize !== null ? customFontSize : CFG.textSize;
  const lineHeight = fontSize * 1.2;
  const charWidth = fontSize * 0.55;

  const lines = text.split('\n');
  const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, "");
  const textLen = Math.max(longestLine.length * charWidth, 40);

  const x3 = isRight ? (x2 + textLen + 15) : (x2 - textLen - 15);

  let svg = `<polyline points="${x},${y} ${x2},${y2} ${x3},${y2}" fill="none" stroke="#006400" stroke-width="2" />`;

  // Draw text lines
  const textAnchor = isRight ? "start" : "end";

  if (textBelow) {
    // Text sits below the horizontal landing
    const baseTextY = y2 + fontSize; // Start first line down

    lines.forEach((line, i) => {
      const offset = i * lineHeight;
      const lineY = baseTextY + offset;
      svg += `<text x="${x2}" y="${lineY}" fill="#006400" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" stroke="var(--svg-bg)" stroke-width="3px" paint-order="stroke fill" text-anchor="${textAnchor}">${line}</text>`;
    });
  } else {
    // Bottom-most line sits just above the horizontal landing
    const baseTextY = y2 - 8;

    lines.forEach((line, i) => {
      // Reverse index logic relative to bottom
      const offset = (lines.length - 1 - i) * lineHeight;
      const lineY = baseTextY - offset;

      svg += `<text x="${x2}" y="${lineY}" fill="#006400" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" stroke="var(--svg-bg)" stroke-width="3px" paint-order="stroke fill" text-anchor="${textAnchor}">${line}</text>`;
    });
  }

  // Return total vertical height used to adjust exclusion zones
  const totalHeight = Math.abs(dy) + (lines.length * lineHeight);
  return { svg, height: totalHeight };
};
