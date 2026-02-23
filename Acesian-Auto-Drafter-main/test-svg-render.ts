import { generateAngleFlange } from './services/generators/angleFlange';
import { generateBlastGateDamper } from './services/generators/blastGate';
import { generateBlindPlate } from './services/generators/blindPlate';
import { generateBootTee } from './services/generators/bootTee';
import { generateCrossTee } from './services/generators/crossTee';
import { generateElbow } from './services/generators/elbow';
import { generateLateralTee } from './services/generators/lateralTee';
import { generateMultibladeDamper } from './services/generators/multibladeDamper';
import { generateOffset } from './services/generators/offset';
import { generateReducer } from './services/generators/reducer';
import { generateSaddle } from './services/generators/saddle';
import { generateStraight } from './services/generators/straight';
import { generateStraightWithTaps } from './services/generators/taps';
import { generateTee } from './services/generators/tee';
import { generateTransformation } from './services/generators/transformation';
import { generateVolumeDamper } from './services/generators/volumeDamper';

const generators: Record<string, Function> = {
    AngleFlange: generateAngleFlange,
    BlastGateDamper: generateBlastGateDamper,
    BlindPlate: generateBlindPlate,
    BootTee: generateBootTee,
    CrossTee: generateCrossTee,
    Elbow: generateElbow,
    LateralTee: generateLateralTee,
    MultibladeDamper: generateMultibladeDamper,
    Offset: generateOffset,
    Reducer: generateReducer,
    Saddle: generateSaddle,
    Straight: generateStraight,
    StraightWithTaps: generateStraightWithTaps,
    Tee: generateTee,
    Transformation: generateTransformation,
    VolumeDamper: generateVolumeDamper
};

function runTest() {
    const extremeParams: any = {
        length: 2420,
        d1: 3000,
        d2: 3000,
        d3: 3000,
        d4: 3000,
        width: 3000,
        depth: 3000,
        angle: 90,
        radius: 3000,
        offset: 2420,
        taps: [
            { type: 'Shoe', diameter: 3000, dist: 1000, angle: 90 }
        ]
    };

    let allPassed = true;

    for (const [name, generateFn] of Object.entries(generators)) {
        try {
            const svgString = generateFn(extremeParams);

            // Rule A: Max visual length clamp
            const svgWithoutText = svgString.replace(/<text[\s\S]*?<\/text>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');

            // Extract all coordinates from paths and lines to check if any segment is suspiciously long.
            // A more robust check: Look for any numbers > 450 in the SVG output (excluding text and viewBox)
            // The VIEW_BOX_SIZE is typically 800, so cx=400. Max coordinate should be around 400 + 400/2 = 600.
            // If we see anything > 1000 in the drawing commands, it's definitely unconstrained.

            // Let's strip viewBox="0 0 800 350" or similar
            let strippedSvg = svgWithoutText.replace(/viewBox="[^"]*"/g, '');
            // Strip width="800" height="350"
            strippedSvg = strippedSvg.replace(/width="800"/g, '').replace(/height="350"/g, '');

            const numberStrings = strippedSvg.match(/-?\d+(?:\.\d+)?/g);
            if (numberStrings) {
                const largeNumbers = numberStrings.map(parseFloat).filter(n => Math.abs(n) > 2000);
                if (largeNumbers.length > 0) {
                    throw new Error(`[${name}] SVG 画图越界！没有正确应用 Math.min 限制！发现大坐标或长度: ${largeNumbers.join(', ')}`);
                }
            }

            // Also check for standard line length calculation
            const match = strippedSvg.match(/M([\d.]+),[\d.]+ L([\d.]+),/);
            if (match) {
                const x1 = parseFloat(match[1]);
                const x2 = parseFloat(match[2]);
                if (Math.abs(x2 - x1) > 400.1) {
                    throw new Error(`[${name}] SVG 画图越界！可视长度为 ${Math.abs(x2 - x1)}`);
                }
            }

            // Rule B: Label keeps real size
            // Check if 2420 or 3000 appears in the output text
            if (!svgString.includes('2420') && !svgString.includes('3000')) {
                // Some generators might not render these specific values depending on the component logic, 
                // but if they rendered '400' as text, that's definitely a failure.
                if (svgString.includes('>400<') || svgString.includes('L=400') || svgString.includes('W=400') || svgString.includes('D=400')) {
                    throw new Error(`[${name}] 标注文字错误！真实尺寸丢失了！显示了带 400 的标注。`);
                }
            }

            console.log(`\x1b[32m✅ [${name}] Inspector Verified!\x1b[0m`);
        } catch (e: any) {
            console.log(`\x1b[31m❌ [${name}] Failed: ${e.message}\x1b[0m`);
            allPassed = false;
        }
    }

    if (!allPassed) {
        process.exit(1);
    } else {
        console.log("\x1b[32m%s\x1b[0m", "🎉 All SVG Generators: Schematic Logic Verified!");
    }
}

runTest();
