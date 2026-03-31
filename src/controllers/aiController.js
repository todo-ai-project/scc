const model = require('../config/gemini'); 
const { db } = require('../config/firebase');

exports.generateTodoMate = async (req, res) => {
    // 클라이언트 데이터 추출 (목표 내용, 목표 ID, 유저 ID)
    const { userGoal, goalID, userID } = req.body;

    try {
        // 유효성 검사
        if (!userGoal) {
            return res.status(400).json({ 
                success: false, 
                message: "목표(userGoal)가 입력되지 않았습니다." 
            });
        }

        console.log(`[AI 요청 시작] 목표: ${userGoal}`);

        // Gemini에게 보낼 프롬프트 구성 (가장 최신 최적화 버전)
        const prompt = `
너는 10년 경력의 베테랑 목표 달성 코치야. 
사용자의 목표 "${userGoal}"을 분석하여, 30일 안에 반드시 성공할 수 있는 최적의 9단계 액션 플랜을 설계하라.

[미션: 마감 기한 중심 TODO 리스트 생성]

1. 구조 (카테고리별 3개씩, 총 9개):
   - [learning_plan]: 목표 달성을 위한 핵심 지식 습득 및 전략 수립 (준비 단계)
   - [practical_goals]: 성과를 내기 위한 직접적인 핵심 행동 (실행 단계)
   - [environment_setup]: 포기하지 않도록 만드는 물리적/시스템적 환경 구축 (지속 단계)

2. 필수 형식:
   - 각 항목은 반드시 "D-숫자: 할 일 내용" 형식을 지킬 것.
   - 숫자는 마감까지 남은 일수(30부터 1까지)이며, D-30(시작)에서 D-1(마무리) 순으로 논리적으로 배치할 것.

3. 작성 가이드라인:
   - 모든 문장은 한국어 명사형으로 종결 (예: ~하기, ~설정, ~완료).
   - 각 문장은 공백 포함 25자 이내로 제한할 것.

4. 출력 제한:
   - 응답은 반드시 순수 JSON 데이터만 출력하라. 마크다운(\`\`\`json)이나 설명을 포함하지 마라.

[출력 형식]
{
  "learning_plan": ["D-30: 내용", "D-25: 내용", "D-20: 내용"],
  "practical_goals": ["D-15: 내용", "D-10: 내용", "D-5: 내용"],
  "environment_setup": ["D-30: 내용", "D-15: 내용", "D-1: 내용"]
}
        `;

        // AI 응답 생성 및 처리 (await 추가로 파란 줄 방지)
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();
        
        console.log("📩 Gemini 응답 수신 완료");

        // JSON 파싱 (마크다운 제거 안전장치 포함)
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        let parsedData;
        try {
            parsedData = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("JSON 파싱 에러:", responseText);
            throw new Error("AI가 올바른 JSON 형식을 생성하지 못했습니다.");
        }

        // Firestore 일괄 저장 (Batch)
        const batch = db.batch();
        const categories = ['learning_plan', 'practical_goals', 'environment_setup'];

        categories.forEach(cat => {
            if (parsedData[cat] && Array.isArray(parsedData[cat])) {
                parsedData[cat].forEach((taskContent, index) => {
                    const todoRef = db.collection('todos').doc(); // 새 문서 ID 자동 생성
                    batch.set(todoRef, {
                        content: taskContent,
                        category: cat,
                        goalID: goalID || "ai_generated_goal",
                        userID: userID || "anon_user",
                        isDone: false,
                        order: index,
                        createdAt: new Date()
                    });
                });
            }
        });

        // 실제 DB 반영
        await batch.commit();
        console.log("✅ Firestore 저장 완료 (9개 항목)");

        // 성공 응답 전송
        return res.status(200).json({
            success: true,
            message: "AI 추천 할 일이 생성되어 DB에 저장되었습니다.",
            data: parsedData
        });

    } catch (error) {
        console.error("❌ AI Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "AI 플랜 생성 및 저장 중 오류가 발생했습니다.",
            error: error.message
        });
    }
};