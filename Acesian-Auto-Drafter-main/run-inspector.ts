import { parseExcelWithGemini } from "./services/aiAgent.js";
import { mockSalesData } from "./mock-sales-data.js";

async function runInspector() {
    console.log("🕵️ Inspector starting...");

    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("🚨 API Key is required to run the inspector. Please set GEMINI_API_KEY environment variable.");
    }

    try {
        const results = await parseExcelWithGemini(mockSalesData, apiKey);

        // 1. Test Port 1/2"x1/2" -> Qty NPT = 2
        const item1 = results[0];
        if (item1.params?.['Qty NPT'] !== 2) {
            throw new Error(`检查员报错：数据提取失败，第一条数据的 Qty NPT 期望为 2，但实际是 ${item1.params?.['Qty NPT']}. Result: ${JSON.stringify(item1.params)}`);
        }

        // 2. Test Port 1"x1/2"x1/2" -> Qty NPT = 3
        const item2 = results[1];
        if (item2.params?.['Qty NPT'] !== 3) {
            throw new Error(`检查员报错：数据提取失败，第二条数据的 Qty NPT 期望为 3，但实际是 ${item2.params?.['Qty NPT']}. Result: ${JSON.stringify(item2.params)}`);
        }

        // 3. Worm Gear -> actuation="Worm Gear"
        const item3 = results[2];
        if (item3.params?.actuation !== "Worm Gear") {
            throw new Error(`检查员报错：数据提取失败，第三条数据的 actuation 期望为 'Worm Gear'，但实际是 '${item3.params?.actuation}'. Result: ${JSON.stringify(item3.params)}`);
        }

        // 4. Radius 1D for Ø800 -> radius=400
        const item4 = results[3];
        if (item4.params?.radius !== 400) {
            throw new Error(`检查员报错：数据提取失败，第四条数据的 radius 期望为 400，但实际是 ${item4.params?.radius}. Result: ${JSON.stringify(item4.params)}`);
        }

        console.log("✅ Inspector: All cases passed!");
    } catch (error) {
        console.error("❌ \x1b[31mError during inspection:\x1b[0m", error);
        process.exit(1);
    }
}

runInspector();
