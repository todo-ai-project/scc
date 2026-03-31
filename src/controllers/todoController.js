const { db } = require('../config/firebase');

exports.createTodo = async (req, res) => {
  try {
    const { content, goalID, order, userID } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "내용 누락" });

    const newTodo = {
      content,
      goalID: goalID || "default",
      order: order || 0,
      isDone: false,
      userID: userID || "anon_user_789",
      createdAt: new Date()
    };

    const docRef = await db.collection('todos').add(newTodo);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 특정 할 일(Todo) 삭제하기

exports.deleteTodo = async (req, res) => {
  try {
    // URL 파라미터에서 삭제할 문서의 ID를 가져옵니다 (예: /api/todos/:id)
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "삭제할 할 일의 ID가 필요합니다." });
    }

    // Firestore의 'todos' 컬렉션에서 해당 ID를 가진 문서를 찾아 삭제
    await db.collection('todos').doc(id).delete();

    console.log(`🗑️ [Firestore] 할 일 삭제 완료! ID: ${id}`);

    return res.status(200).json({
      success: true,
      message: "할 일이 성공적으로 삭제되었습니다."
    });
  } catch (error) {
    console.error("❌ [DELETE ERROR]", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};