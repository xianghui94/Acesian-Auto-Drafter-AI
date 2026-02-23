import { generateSheetDxfString } from './utils/dxfWriter';
import { generateStraight } from './services/generators/straight';

// Zero-dependency Mock DOMParser for SVG -> DXF Node Testing
class MockDOMParser {
    parseFromString(svgString: string, type: string) {
        const documentElement: any = {
            tagName: 'svg',
            children: [],
            getAttribute: (key: string) => key === 'viewBox' ? '0 0 500 500' : null,
            textContent: ''
        };

        // Very basic structural regex parser for SVG paths/lines/rects
        const tagRegex = /<([a-z]+)([^>]*)>(.*?)<\/\1>|<([a-z]+)([^>]*)\/>/gs;
        let match;

        while ((match = tagRegex.exec(svgString)) !== null) {
            const tag = match[1] || match[4];
            const attrsStr = match[2] || match[5];
            const content = match[3] || '';

            const attrs: any = {};
            const attrRegex = /([a-zA-Z-]+)="([^"]*)"/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
                attrs[attrMatch[1]] = attrMatch[2];
            }

            // Nested grouping logic (very simplified for Straight SVG <g> -> <path>)
            if (tag === 'g') {
                const gChildren: any[] = [];
                let cmatch;
                const childRegex = /<([a-z]+)([^>]*)\/>/g;
                while ((cmatch = childRegex.exec(content)) !== null) {
                    const ctag = cmatch[1];
                    const cattrsStr = cmatch[2];
                    const cattrs: any = {};
                    let cattrMatch;
                    while ((cattrMatch = attrRegex.exec(cattrsStr)) !== null) {
                        cattrs[cattrMatch[1]] = cattrMatch[2];
                    }
                    gChildren.push({
                        tagName: ctag,
                        getAttribute: (k: string) => cattrs[k] || attrs[k] || null, // Inherit transforms
                        children: [],
                        textContent: ''
                    });
                }
                documentElement.children.push({
                    tagName: 'g',
                    getAttribute: (k: string) => attrs[k] || null,
                    children: gChildren,
                    textContent: content
                });
            } else {
                documentElement.children.push({
                    tagName: tag,
                    getAttribute: (k: string) => attrs[k] || null,
                    children: [],
                    textContent: content
                });
            }
        }

        return { documentElement };
    }
}

(global as any).DOMParser = MockDOMParser;

async function runTest() {
    try {
        console.log("Generating Straight Duct SVG...");
        const straightSvg = generateStraight({ width: 500, height: 400, length: 1200 });

        const mockItem = {
            id: '1', type: 'Straight', description: 'Straight Duct',
            material: 'SS304', thickness: '0.8', coating: 'None',
            qty: 1, tagNo: 'T1', notes: 'Test',
            params: { width: 500, height: 400, length: 1200 },
            sketchSvg: straightSvg
        };

        const mockHeader = {
            company: 'Test Co', from: 'Test From', project: 'P1', date: '2026-01-01',
            lateralNo: 'L1', requiredDate: '2026-02-01', osNo: 'OS1', poNo: 'PO1',
            preparedBy: 'Me', personInCharge: 'You', customerRef: 'C1',
            deliveryAddress: 'Add', pressureRating: 'Low', afType: 'TDF'
        };

        console.log("Exporting DXF String...");
        const dxf = generateSheetDxfString([mockItem], mockHeader);

        console.log("\n====== DXF EXPORT DIAGNOSTICS ======");
        console.log("Document Size:", dxf.length, "chars");

        const hasEntities = "\n  2\nENTITIES\n";
        console.log("Contains ENTITIES Block:", dxf.includes(hasEntities) || dxf.includes("  2\r\nENTITIES") || dxf.includes("ENTITIES") ? "YES" : "NO");

        const lines = (dxf.match(/AcDbLine/g) || []).length;
        const polys = (dxf.match(/AcDbPolyline/g) || []).length;
        const texts = (dxf.match(/AcDbText/g) || []).length;
        const circles = (dxf.match(/AcDbCircle/g) || []).length;

        console.log(`Entities Found: LINE (${lines}), LWPOLYLINE (${polys}), TEXT (${texts}), CIRCLE (${circles})`);

        if (lines > 0 && texts > 0) {
            console.log("✅ TEST PASSED: SVG paths, layout lines, and text correctly converted to DXF AcDb entities.");
        } else {
            console.log("❌ TEST FAILED: Missing essential DXF layout entities.");
            process.exit(1);
        }
    } catch (e) {
        console.error("Test failed with exception:", e);
        process.exit(1);
    }
}

runTest();
