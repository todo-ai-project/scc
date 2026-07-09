//frontend>src>pages>TodoList>TodoList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TodoItem from './TodoItem';

function TodoList() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [activeGoalID, setActiveGoalID] = useState('all');
  const [addGoalID, setAddGoalID] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIDs, setSelectedIDs] = useState(new Set());

  const API_URL = 'http://localhost:5001/api/todos';
  const GOALS_API_URL = 'http://localhost:5001/api/goals';
  const CURRENT_USER_ID = "test_user_1";

  const fetchTodos = useCallback(async () => {
    try {
      const response = await axios.get(API_URL, {
        params: { userID: CURRENT_USER_ID }
      });
      if (response.data.success) {
        const mappedTodos = response.data.data.map(item => ({
          id: item.id,
          text: item.content || "내용 없음",
          targetDate: item.targetDate || "",
          completed: item.isDone || false,
          goalID: item.goalID || "",
          goalName: item.goalName || "",
          highlighted: false
        }));
        setTodos(mappedTodos);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  }, [API_URL]);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await axios.get(GOALS_API_URL);
      if (response.data.success) {
        setGoals(response.data.data);
      }
    } catch (error) {
      console.error("목표 로드 실패:", error);
    }
  }, [GOALS_API_URL]);

  useEffect(() => {
    fetchTodos();
    fetchGoals();
  }, [fetchTodos, fetchGoals]);

  // goals API에서 가져온 데이터로 탭 생성 (정확한 ID-이름 매핑)
  const goalMap = {};
  goals.forEach(g => {
    goalMap[g.id] = g.goalName || g.id;
  });
  const goalTabs = goals
    .filter(g => todos.some(t => t.goalID === g.id))
    .map(g => ({ id: g.id, name: g.goalName || g.id }));

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}(${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;

  // 현재 선택된 탭 기준 카운트
  const currentTodos = activeGoalID === 'all'
    ? todos
    : todos.filter(todo => todo.goalID === activeGoalID);
  const completedCount = currentTodos.filter(todo => todo.completed).length;
  const remainingCount = currentTodos.length - completedCount;

  const calculateDDay = (targetDateString) => {
    if (!targetDateString) return null;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const targetDate = new Date(targetDateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-Day';
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      alert("삭제 실패");
    }
  };

  const handleToggle = async (id) => {
    const targetTodo = todos.find(todo => todo.id === id);
    try {
      await axios.patch(`${API_URL}/${id}`, {
        isDone: !targetTodo.completed
      });
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error("상태 변경 실패");
    }
  };

  const handleUpdate = async (id, newContent, newDate) => {
    try {
      await axios.patch(`${API_URL}/${id}`, {
        content: newContent,
        targetDate: newDate || ""
      });
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, text: newContent, targetDate: newDate || "" } : todo
      ));
    } catch (error) {
      alert("수정 실패");
    }
  };

  const getTargetGoalID = () => {
    if (activeGoalID !== 'all') return activeGoalID;
    return addGoalID;
  };

  const handleAddTodo = async () => {
    if (!inputValue.trim()) return;

    const targetGoalID = getTargetGoalID();

    if (!targetGoalID) {
      alert("대목표를 선택해주세요.");
      return;
    }

    const targetGoalName = goalMap[targetGoalID] || "";
    console.log("추가 대상 goalID:", targetGoalID, "goalName:", targetGoalName, "activeGoalID:", activeGoalID);

    try {
      const response = await axios.post(API_URL, {
        content: inputValue,
        targetDate: dueDate,
        goalID: targetGoalID,
        goalName: targetGoalName,
        userID: CURRENT_USER_ID
      });
      if (response.data.success) {
        fetchTodos();
        fetchGoals();
        setInputValue('');
        setDueDate('');
        setAddGoalID('');
      }
    } catch (error) {
      alert("저장 실패");
    }
  };

  // 현재 선택된 목표의 할 일만 필터링
  const filteredTodos = activeGoalID === 'all'
    ? todos
    : todos.filter(todo => todo.goalID === activeGoalID);

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return new Date(a.targetDate) - new Date(b.targetDate);
  });

  const handleSelect = (id) => {
    setSelectedIDs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIDs.size === sortedTodos.length) {
      setSelectedIDs(new Set());
    } else {
      setSelectedIDs(new Set(sortedTodos.map(t => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIDs.size === 0) return;
    if (!window.confirm(`${selectedIDs.size}개의 할 일을 삭제하시겠습니까?`)) return;
    try {
      await Promise.all([...selectedIDs].map(id => axios.delete(`${API_URL}/${id}`)));
      setTodos(prev => prev.filter(todo => !selectedIDs.has(todo.id)));
      setSelectedIDs(new Set());
      setSelectMode(false);
    } catch (error) {
      alert("일부 삭제에 실패했습니다.");
    }
  };

  return (
    <div style={{ backgroundColor: '#FBFAF9', minHeight: '100vh', width: '100%', padding: '60px 8%', boxSizing: 'border-box' }}>

      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#eee', cursor: 'pointer' }}>홈으로</button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <p style={{ color: '#bbb', fontWeight: '600' }}>{formattedDate}</p>
        <h1 style={{ fontSize: '48px', fontWeight: '800' }}>To-Do</h1>
        <p style={{ color: '#999', fontSize: '18px' }}>{remainingCount}개 남음 · {completedCount}개 완료</p>
      </div>

      {/* 대목표 탭 버튼 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* 전체 탭 */}
        <button
          onClick={() => { setActiveGoalID('all'); setSelectMode(false); setSelectedIDs(new Set()); }}
          style={{
            padding: '12px 24px',
            borderRadius: '30px',
            border: activeGoalID === 'all' ? '2px solid #aa3bff' : '2px solid #eee',
            backgroundColor: activeGoalID === 'all' ? '#aa3bff' : 'white',
            color: activeGoalID === 'all' ? 'white' : '#555',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          전체
        </button>
        {goalTabs.map(g => {
          const isActive = activeGoalID === g.id;
          const gTodos = todos.filter(t => t.goalID === g.id);
          const gDone = gTodos.filter(t => t.completed).length;
          const gRemain = gTodos.length - gDone;
          return (
            <button
              key={g.id}
              onClick={() => { console.log("탭 클릭:", g.id, g.name); setActiveGoalID(g.id); setSelectMode(false); setSelectedIDs(new Set()); }}
              style={{
                padding: '12px 24px',
                borderRadius: '30px',
                border: isActive ? '2px solid #aa3bff' : '2px solid #eee',
                backgroundColor: isActive ? '#aa3bff' : 'white',
                color: isActive ? 'white' : '#555',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {g.name}
              <span style={{ fontSize: '12px', opacity: 0.8 }}>({gRemain}/{gTodos.length})</span>
            </button>
          );
        })}
      </div>

      {/* 할 일 추가 영역 */}
      <div style={{ display: 'flex', padding: '16px 24px', border: '2px solid #ddd', borderRadius: '16px', backgroundColor: 'white', gap: '10px', marginBottom: '30px', alignItems: 'center' }}>
        {activeGoalID === 'all' && goalTabs.length > 0 && (
          <select
            value={addGoalID}
            onChange={(e) => setAddGoalID(e.target.value)}
            style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', color: '#555' }}
          >
            <option value="">대목표 선택</option>
            {goalTabs.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
        <input
          type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          placeholder="할 일을 입력하세요"
          style={{ border: 'none', outline: 'none', flexGrow: 1, fontSize: '15px' }}
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ border: 'none' }} />
        <button onClick={handleAddTodo} style={{ borderRadius: '50%', width: '30px', height: '30px', border: 'none', backgroundColor: '#aa3bff', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>+</button>
      </div>

      {/* 선택 삭제 버튼 (할 일 목록 바로 위, 오른쪽 정렬) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => { setSelectMode(!selectMode); setSelectedIDs(new Set()); }}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: selectMode ? '2px solid #e74c3c' : '1px solid #ddd',
            backgroundColor: selectMode ? '#fdf0ef' : 'white',
            color: selectMode ? '#e74c3c' : '#999',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {selectMode ? '선택 취소' : '선택 삭제'}
        </button>
        {selectMode && (
          <>
            <button
              onClick={handleSelectAll}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', color: '#555', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              {selectedIDs.size === sortedTodos.length ? '전체 해제' : '전체 선택'}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIDs.size === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedIDs.size > 0 ? '#e74c3c' : '#ccc',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: selectedIDs.size > 0 ? 'pointer' : 'default'
              }}
            >
              {selectedIDs.size}개 삭제
            </button>
          </>
        )}
      </div>

      {/* 선택된 목표의 세부 할 일 목록 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {sortedTodos.length > 0 ? (
          sortedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              {...todo}
              dDay={calculateDDay(todo.targetDate)}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              selectMode={selectMode}
              isSelected={selectedIDs.has(todo.id)}
              onSelect={handleSelect}
            />
          ))
        ) : (
          <p style={{ color: '#aaa' }}>아직 할 일이 없습니다. 목표를 생성해 보세요!</p>
        )}
      </div>
    </div>
  );
}

export default TodoList;
