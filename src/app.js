const express = require('express');
const dotenv = require('dotenv');
const goalRouter = require('./routes/goal'); // 작성하신 goal.js 불러오기
const todoRouter = require('./routes/todo'); // todo.js도 있다면 연결

// .env 파일의 환경 변수 로드
dotenv.config();

const app = express();

// 중요: JSON 형태의 데이터를 받기 위한 미들웨어
app.use(express.json()); 

// 라우터 경로 설정
// 브라우저나 포스트맨에서 http://localhost:3000/api/goals 로 접근하게 됩니다.
app.use('/api/goals', goalRouter);
app.use('/api/todos', todoRouter);

// 기본 접속 테스트용
app.get('/', (req, res) => {
    res.send('Backend Server is Running!');
});

// 포트 번호 설정 (기본값 3000)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('==========================================');
    console.log(`🚀 서버가 성공적으로 시작되었습니다!`);
    console.log(`📡 접속 주소: http://localhost:${PORT}`);
    console.log(`📝 목표 설정 API: http://localhost:${PORT}/api/goals`);
    console.log('==========================================');
});
