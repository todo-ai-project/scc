const express = require('express');
const app = express();
const todoRouter = require('./routes/todo'); // 1단계에서 만든 파일 불러오기

// 설정: JSON 데이터를 읽을 수 있게 함
app.use(express.json());

// 주소 연결: 모든 할 일 관련 요청은 /api/todo 로 들어오게 설정
app.use('/api/todo', todoRouter);

// 서버 상태 확인용 (브라우저에서 localhost:3000 접속 시 확인 가능)
app.get('/', (req, res) => {
    res.json({ status: "running" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[INFO] Server is listening on port ${PORT}...`);
});