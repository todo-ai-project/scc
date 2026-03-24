const express = require('express');
const router = express.Router();

/**
 * 할 일(Task) 등록 API
 * POST /api/todo
 */
router.post('/', (req, res) => {
    // 1. 요청 데이터 추출
    const { task } = req.body;

    try {
        // 2. 데이터 유효성 검사 (입력값이 있는지 확인)
        if (!task) {
            return res.status(400).json({
                success: false,
                message: "할 일 내용(task)이 없습니다."
            });
        }

        // 3. 진행 상황 로깅 (로그 확인이 용이하도록 객체화)
        const logInfo = {
            time: new Date().toLocaleString(),
            action: "CREATE_TASK",
            content: task
        };
        console.log("[API LOG]", logInfo);

        // 4. 성공 응답 전송
        return res.status(201).json({
            success: true,
            data: {
                task: task,
                createdAt: new Date().toISOString()
            }
        });

    } catch (error) {
        // 5. 예외 상황 처리
        console.error("[SERVER ERROR]", error);
        return res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다."
        });
    }
});

module.exports = router;