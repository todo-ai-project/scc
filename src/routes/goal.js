const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/todo
 * @desc    프론트엔드로부터 새로운 할 일(Task)을 수신
 * @access  Public
 */
router.post('/', (req, res) => {
    // 요청 본문(body)에서 task 데이터 추출
    const { task } = req.body;

    // 데이터 수신 여부 확인을 위한 서버 콘솔 로그
    console.log('==========================================');
    console.log(`[LOG] Received Task: ${task}`);
    console.log('==========================================');

    // 클라이언트에 성공 응답 및 수신 데이터 반환
    return res.status(201).json({
        status: "success",
        data: {
            task: task,
            createdAt: new Date().toISOString() // 전송 시간까지 넣어주면 더 전문적이에요!
        }
    });
});

module.exports = router;