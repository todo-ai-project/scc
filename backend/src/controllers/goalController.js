//backend>src>controllers>goalController.js
const { db } = require('../config/firebase');

exports.getGoals = async (req, res) => {
  try {
    const snapshot = await db.collection('goals').get();
    const goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { content, deadline, userID } = req.body;

    const newGoal = {
      goalName: content,
      deadline: deadline ? new Date(deadline) : null,
      createdAt: new Date(),
      userID: userID || "anon_user_default"
    };

    const docRef = await db.collection('goals').add(newGoal);

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: "목표가 성공적으로 저장되었습니다!"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
