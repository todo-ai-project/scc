// backend/src/controllers/todoController.js
const { db } = require('../config/firebase');

// 1. 모든 할 일 목록 가져오기
exports.getTodos = async (req, res) => {
  try {
    const snapshot = await db.collection('todos').orderBy('createdAt', 'desc').get();

    const todos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // goalID에 해당하는 goalName을 goals 컬렉션에서 조회
    const goalIDs = [...new Set(todos.map(t => t.goalID).filter(id => id && id !== "default"))];
    const goalNameMap = {};
    for (const gid of goalIDs) {
      try {
        const goalDoc = await db.collection('goals').doc(gid).get();
        if (goalDoc.exists) {
          goalNameMap[gid] = goalDoc.data().goalName || goalDoc.data().content || "";
        }
      } catch (e) {}
    }

    // todo 자체의 goalName > goals 컬렉션의 goalName > 빈 문자열 순으로 우선
    const todosWithGoalName = todos.map(t => ({
      ...t,
      goalName: t.goalName || goalNameMap[t.goalID] || ""
    }));

    console.log(`✅ [GET] ${todos.length}개의 할 일을 불러왔습니다.`);
    res.status(200).json({ success: true, data: todosWithGoalName });
  } catch (error) {
    console.error("❌ [GET ERROR]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. 개별 할 일 생성 (수동 추가용)
exports.createTodo = async (req, res) => {
  try {
    const { content, goalID, goalName, order, userID, targetDate } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "내용 누락" });

    const newTodo = {
      content,
      goalID: goalID || "default",
      goalName: goalName || "",
      order: order || 0,
      isDone: false,
      userID: userID || "test_user_1",
      targetDate: targetDate || "",
      createdAt: new Date()
    };

    const docRef = await db.collection('todos').add(newTodo);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. 할 일 수정 (완료 토글, 내용/날짜 수정)
exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.isDone !== undefined) updateData.isDone = req.body.isDone;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.targetDate !== undefined) updateData.targetDate = req.body.targetDate;

    await db.collection('todos').doc(id).update(updateData);
    res.status(200).json({ success: true, message: "수정 성공" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. 할 일 삭제
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('todos').doc(id).delete();
    res.status(200).json({ success: true, message: "삭제 성공" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
