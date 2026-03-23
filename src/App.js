import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // 스타일링은 여기서!

function App() {
  // 1. 입력값을 저장할 상태(State) 생성
  const [goal, setGoal] = useState('');

  // 2. 버튼 클릭 시 실행될 함수
  const handleSubmit = async () => {
    if (!goal) {
      alert("할 일을 입력해주세요!");
      return;
    }

    try {
      // 3. axios.post를 사용하여 백엔드로 데이터 전송
      // URL('/api/goals' 등)은 실제 백엔드 주소로 바꿔주세요.
      const response = await axios.post('http://localhost:8080/api/goals', {
        title: goal
      });

      console.log("전송 성공:", response.data);
      alert("성공적으로 생성되었습니다!");
    } catch (error) {
      console.error("전송 실패:", error);
      alert("데이터 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p>2026.3.19(목)</p>
      <h1>목표 설정하기</h1>
      <p style={{ color: 'gray' }}>하나의 목표를 입력하면,<br/>AI가 실행 가능한 할 일을 만들어드려요</p>

      {/* 입력창 (Input) */}
      <input 
        type="text" 
        placeholder="새로운 할 일을 입력해보세요"
        value={goal}
        onChange={(e) => setGoal(e.target.value)} // 입력할 때마다 상태 업데이트
        style={inputStyle}
      />

      <br />

      {/* 제출 버튼 (Button) */}
      <button onClick={handleSubmit} style={buttonStyle}>
        ✨ AI로 할 일을 생성해요
      </button>

      <p style={{ fontSize: '12px', color: '#ccc', marginTop: '20px' }}>
        만다라트 기법을 활용하여 목표를 세분화해요
      </p>
    </div>
  );
}

// 간단한 스타일 객체 (App.css에 작성해도 됩니다)
const inputStyle = {
  width: '400px',
  padding: '15px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  marginBottom: '10px',
  fontSize: '16px'
};

const buttonStyle = {
  width: '430px',
  padding: '15px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#ccc', // 이미지처럼 회색 톤
  color: 'white',
  fontSize: '16px',
  cursor: 'pointer'
};

export default App;