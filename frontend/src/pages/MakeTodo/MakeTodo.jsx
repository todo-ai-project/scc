//frontend>src>pages>MakeTodo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnalyzePage from "./AnalyzePage";

function MakeTodo() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const CURRENT_USER_ID = "test_user_1";

  const handleSubmit = async () => {
    if (!goal.trim()) {
      alert("목표를 입력해주세요!");
      return;
    }

    setIsAnalyzing(true);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5001/api/todos/generate', {
        userGoal: goal,
        userID: CURRENT_USER_ID, 
        goalID: `goal_${Date.now()}`
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        alert("AI 플랜 생성에 실패했습니다.");
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("AI 요청 에러:", error);
      alert("백엔드 서버 연결에 실패했습니다.");
      setIsAnalyzing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToList = () => {
    navigate('/list'); 
  };

  if (isAnalyzing) {
    return (
      <AnalyzePage 
        isLoading={isLoading} 
        result={result} 
        userGoal={goal}
        onGoToList={handleGoToList}
        onReset={() => {
            setIsAnalyzing(false);
            setResult(null);
            setGoal('');
        }}
      />
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#FBFAF9', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '0 20px',
      position: 'relative' // 버튼 배치를 위해 추가
    }}>
      
      {/* ⭐️ 상단 좌측 뒤로가기 버튼 추가 */}
      <div style={{ 
        position: 'absolute', 
        top: '40px', 
        left: '40px' 
      }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '10px 18px', 
            borderRadius: '10px', 
            border: '1px solid #eee', 
            backgroundColor: 'white', 
            cursor: 'pointer',
            fontWeight: '600',
            color: '#555',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← 홈으로
        </button>
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px', color: '#111' }}>
        어떤 목표를 이루고 싶으신가요?
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
        AI가 당신의 목표를 분석해 최적의 할 일 리스트를 만들어드립니다.
      </p>
      
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        display: 'flex', 
        gap: '15px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}>
        <input 
          type="text" 
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="예: 집밥 만들어 먹기" 
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', fontWeight: '500' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button 
          onClick={handleSubmit}
          style={{
            padding: '15px 30px',
            backgroundColor: '#aa3bff',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          분석 시작
        </button>
      </div>
    </div>
  );
}

export default MakeTodo;