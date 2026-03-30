require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateTodoMate = async (req, res) => {
    const { userGoal } = req.body;

    try {
        if (!userGoal) {
            return res.status(400).json({
                success: false,
                message: "학습 목표(userGoal)가 입력되지 않았습니다."
            });
        }

        // 함수 안에서 API 키를 읽어오면 더 안전합니다.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key가 설정되지 않았습니다.");

        const genAI = new GoogleGenerativeAI(apiKey);
        console.log(`[AI 요청] 목표: ${userGoal}`);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash" 
        });

        const prompt = `
너는 전문 목표 달성 코치야. 
사용자의 목표 "${userGoal}"를 기준으로 "마감 기한 중심 TODO 리스트"를 만들어라.

[중요 규칙]
1. 총 9개 (각 카테고리 3개씩)
2. 반드시 "D-숫자: 할 일" 형식으로 작성 (예: D-30: 식단 계획 세우기)
3. 숫자는 목표일까지 남은 일수 기준 (D-30 ~ D-1)
4. 구체적이고 바로 실행 가능한 행동으로 작성
5. 한국어, 25자 이내
6. 절대 설명하지 말고 JSON만 출력
7. 마크다운 금지

[카테고리]
- learning_plan: 준비/이해 단계
- practical_goals: 실제 행동
- environment_setup: 환경/세팅

[출력 형식]
{
  "learning_plan": ["", "", ""],
  "practical_goals": ["", "", ""],
  "environment_setup": ["", "", ""]
}
`;

        const result = await model.generateContent(prompt);
        // .text() 호출 시 await를 붙여주세요.
        const responseText = await result.response.text();
        
        console.log("📩 Gemini 응답 원본:", responseText);

        // JSON 정리 및 파싱
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        let parsedData;
        try {
            parsedData = JSON.parse(cleanJson);
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "AI 응답 파싱 실패",
                raw: responseText
            });
        }

        return res.status(200).json({
            success: true,
            data: parsedData
        });

    } catch (error) {
        console.error("[Gemini Error]:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "AI 플랜 생성 실패"
        });
    }
};