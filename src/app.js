const express = require('express');
<<<<<<< HEAD
const cors = require('cors');
const dotenv = require('dotenv');

// 라우터 불러오기
const goalRouter = require('./routes/goal'); 
const todoRouter = require('./routes/todo'); 

// 환경변수 설정 (.env 파일 읽기)
=======
const dotenv = require('dotenv');
const goalRouter = require('./routes/goal'); // 작성하신 goal.js 불러오기
const todoRouter = require('./routes/todo'); // todo.js도 있다면 연결

// .env 파일의 환경 변수 로드
>>>>>>> 9f7cd18c06ae4752303a14473f3bd656e48f4840
dotenv.config();

const app = express();

<<<<<<< HEAD
// --- [미들웨어 설정] ---

// 1. CORS 설정: 모든 도메인 허용 (보안을 위해 나중에 특정 도메인만 허용하도록 수정 가능)
app.use(cors()); 

// 2. JSON 파싱: 클라이언트에서 보낸 JSON 데이터를 req.body로 읽을 수 있게 함
app.use(express.json()); 

// --- [라우팅 설정] ---

// 메인 접속 확인용
app.get('/', (req, res) => {
    res.send('🚀 백엔드 서버가 정상적으로 작동 중입니다!');
});

// 기능별 API 라우터 연결
app.use('/api/goals', goalRouter);
app.use('/api/todos', todoRouter);

// --- [에러 및 예외 처리] ---

// 

// 3. 404 Not Found: 정의되지 않은 주소로 들어왔을 때 처리
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "존재하지 않는 API 경로입니다. 주소를 다시 확인해 주세요."
    });
});

// 4. 글로벌 에러 핸들러: 서버 내부 로직 중 에러 발생 시 처리
app.use((err, req, res, next) => {
    console.error('서버 에러 발생:', err.stack);
    res.status(500).json({
        success: false,
        message: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        error: process.env.NODE_ENV === 'development' ? err.message : {} // 개발 모드일 때만 에러 내용 노출
    });
});

// --- [서버 실행] ---

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
    console.log('==========================================');
    console.log(`📡 서버가 성공적으로 시작되었습니다!`);
    console.log(`🌐 접속 주소: http://localhost:${PORT}`);
    console.log(`🎯 목표 API: http://localhost:${PORT}/api/goals`);
    console.log(`✅ 할일 API: http://localhost:${PORT}/api/todos`);
    console.log('==========================================');
});
=======
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
>>>>>>> 9f7cd18c06ae4752303a14473f3bd656e48f4840
