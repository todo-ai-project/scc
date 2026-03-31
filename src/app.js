const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경변수 설정
dotenv.config();

// Firebase 연결
require('./config/firebase');

// 라우터 불러오기
const todoRouter = require('./routes/todo'); 
const goalRouter = require('./routes/goal'); 

const app = express();

// 미들웨어 설정
app.use(cors()); 
app.use(express.json()); 

// 라우팅 설정
app.get('/', (req, res) => {
    res.send('🚀 AI 투두 메이트 서버가 가동 중입니다!');
});

app.use('/api/todos', todoRouter);
app.use('/api/goals', goalRouter); 

// 404 처리
app.use((req, res) => {
    res.status(404).json({ success: false, message: "경로를 찾을 수 없습니다." });
});

// 에러 처리
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "서버 내부 에러 발생" });
});

// 서버 실행
const PORT = process.env.PORT || 5000; 
const HOST = `http://localhost:${PORT}`;

app.listen(PORT, () => {
    console.log(`서버 실행: ${HOST}`);
    console.log(`[GET]  기본 접속 : ${HOST}/`);
    console.log(`[POST] 목표 생성 : ${HOST}/api/goals`);
    console.log(`[POST] 할일 생성 : ${HOST}/api/todos`);
    console.log(`[POST] AI 추천  : ${HOST}/api/todos/generate`);
});