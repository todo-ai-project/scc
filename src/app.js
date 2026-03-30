const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경변수 설정 (라우터 불러오기 전에 실행해야 안전함)
dotenv.config();

// Firebase 연결
require('./config/firebase');

// 라우터 불러오기
const todoRouter = require('./routes/todo'); 
// const goalRouter = require('./routes/goal'); // 필요시 활성화

const app = express();

// 미들웨어 설정
app.use(cors()); 
app.use(express.json()); 

// 라우팅 설정
app.get('/', (req, res) => {
    res.send('🚀 AI 투두 메이트 서버가 가동 중입니다!');
});

app.use('/api/todos', todoRouter);

// 404 및 에러 처리
app.use((req, res) => {
    res.status(404).json({ success: false, message: "경로를 찾을 수 없습니다." });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "서버 내부 에러 발생" });
});

// 서버 실행
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`📡 서버 실행 중: http://localhost:${PORT}`);
    console.log(`✅ 테스트 경로: http://localhost:${PORT}/api/todos/generate`);
});