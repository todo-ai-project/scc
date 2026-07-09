//backend>src>controllers>aiController.js
const model = require('../config/gemini'); 
const { db } = require('../config/firebase');

exports.generateTodoMate = async (req, res) => {
    const { userGoal, goalID, userID } = req.body;

    try {
        if (!userGoal) {
            return res.status(400).json({ 
                success: false, 
                message: "목표(userGoal)가 입력되지 않았습니다." 
            });
        }

        console.log(`\n🚀 [AI 요청 시작] 사용자: ${userID || 'test_user_1'} | 목표: ${userGoal}`);

        const prompt = `
너는 10년 경력의 목표 달성 코치야. 사용자의 목표 "${userGoal}"을 분석해 30일 액션 플랜을 짜라.
반드시 아래 JSON 형식으로만 응답하고, 마크다운 태그(\`\`\`json)는 절대 포함하지 마라.

{
  "learning_plan": ["D-30: 내용", "D-25: 내용", "D-20: 내용"],
  "practical_goals": ["D-15: 내용", "D-10: 내용", "D-5: 내용"],
  "environment_setup": ["D-30: 내용", "D-15: 내용", "D-1: 내용"]
}
        `;

        // 1. AI 응답 생성
        const result = await model.generateContent(prompt);
        const response = result.response;
        let responseText = response.text().trim();
        
        console.log("📩 AI로부터 응답을 받았습니다.");

        // 2. JSON 데이터 추출 (더 강력한 정규식 처리)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("❌ AI 응답 형식이 잘못되었습니다:", responseText);
            throw new Error("AI 응답에서 JSON 데이터를 추출할 수 없습니다.");
        }
        
        const parsedData = JSON.parse(jsonMatch[0]);

        // 3. Firestore Batch 작업 준비
        const batch = db.batch();
        const categories = ['learning_plan', 'practical_goals', 'environment_setup'];
        const savedTodos = [];
        const currentGoalID = goalID || `goal_${Date.now()}`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 대목표(Goal) 저장
        const goalRef = db.collection('goals').doc(currentGoalID);
        batch.set(goalRef, {
            goalName: userGoal,
            userID: userID || "test_user_1",
            createdAt: new Date()
        });

        // 데이터 가공 및 Batch 추가
        categories.forEach(cat => {
            if (parsedData[cat] && Array.isArray(parsedData[cat])) {
                parsedData[cat].forEach((taskContent, index) => {
                    // D-Day 숫자 추출
                    const dDayMatch = taskContent.match(/D-(\d+)/);
                    let targetDate = "";
                    
                    if (dDayMatch) {
                        const daysBefore = parseInt(dDayMatch[1]);
                        const calculatedDate = new Date(today);
                        calculatedDate.setDate(today.getDate() + (30 - daysBefore));
                        const y = calculatedDate.getFullYear();
                        const m = String(calculatedDate.getMonth() + 1).padStart(2, '0');
                        const d = String(calculatedDate.getDate()).padStart(2, '0');
                        targetDate = `${y}-${m}-${d}`;
                    }

                    const cleanContent = taskContent.replace(/^D-\d+:\s*/, '');
                    const todoRef = db.collection('todos').doc();
                    const todoData = {
                        content: cleanContent,
                        category: cat,
                        goalID: currentGoalID,
                        goalName: userGoal,
                        userID: userID || "test_user_1",
                        isDone: false,
                        targetDate: targetDate,
                        order: index,
                        createdAt: new Date() 
                    };
                    
                    batch.set(todoRef, todoData);
                    savedTodos.push({ id: todoRef.id, ...todoData });
                });
            }
        });

        // ⭐️ 4. 실제 DB에 물리적으로 커밋 (가장 중요)
        if (savedTodos.length === 0) {
            throw new Error("저장할 데이터가 생성되지 않았습니다.");
        }

        await batch.commit();
        console.log(`✅ [Firestore] ${userID || 'test_user_1'}의 할 일 ${savedTodos.length}개 저장 완료!`);

        // 5. 성공 응답 전송
        return res.status(200).json({
            success: true,
            message: "AI 플랜이 생성되어 DB에 저장되었습니다.",
            data: savedTodos 
        });

    } catch (error) {
        // 상세 에러 로그 출력 (터미널에서 확인 가능)
        console.error("❌ [AI Controller 에러 발생]:", error);
        return res.status(500).json({
            success: false,
            message: "AI 플랜 생성 또는 저장 중 오류가 발생했습니다.",
            error: error.message
        });
    }
};