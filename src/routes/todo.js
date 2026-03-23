const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: "Todo 라우터 연결 성공" });
});

module.exports = router;
