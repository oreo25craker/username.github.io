const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

// JSON 파싱을 위한 bodyParser 미들웨어 설정
app.use(bodyParser.json());

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    port: '3306', // MySQL 포트 번호
    user: 'root', // 사용자 이름
    password: '', // 비밀번호
    database: 'recipe_web' // 사용할 데이터베이스
});

// MySQL 연결 확인
db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공');
});

// 사용자 정보 저장 또는 업데이트 API
app.post('/saveUser', (req, res) => {
    const { kakao_id, nickname, email, profile_image } = req.body;

    const sql = `
        INSERT INTO users (kakao_id, nickname, email, profile_image)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nickname=?, email=?, profile_image=?
    `;

    db.query(sql, [kakao_id, nickname, email, profile_image, nickname, email, profile_image], (err, result) => {
        if (err) {
            console.error('사용자 정보 저장 실패:', err);
            res.status(500).send('사용자 정보 저장 실패');
        } else {
            console.log('사용자 정보 저장 또는 업데이트 성공');
            res.send('사용자 정보 저장 성공');
        }
    });
});

// 레시피 추가 API
app.post('/addRecipe', (req, res) => {
    const { user_id, title, description, ingredients, instructions } = req.body;

    const sql = `
        INSERT INTO recipes (user_id, title, description, ingredients, instructions)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, title, description, ingredients, instructions], (err, result) => {
        if (err) {
            console.error('레시피 추가 실패:', err);
            res.status(500).send('레시피 추가 실패');
        } else {
            console.log('레시피 추가 성공');
            res.send('레시피 추가 성공');
        }
    });
});

// 알레르기 정보 저장 API
app.post('/saveAllergy', (req, res) => {
    const { userId, allergies } = req.body;  // 사용자 ID와 알레르기 ID 배열

    // 알레르기 정보를 저장할 쿼리
    const query = 'INSERT INTO UserAllergies (user_id, allergy_id) VALUES ?';
    const values = allergies.map(allergyId => [userId, allergyId]);

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('알레르기 정보 저장 실패:', err);
            return res.status(500).json({ message: '알레르기 정보 저장에 실패했습니다.' });
        }

        res.status(200).json({ message: '알레르기 정보가 성공적으로 저장되었습니다.' });
    });
});

// 알레르기 정보 조회 API
app.get('/getAllergies', (req, res) => {
    const userId = req.query.userId; // 쿼리 파라미터로 사용자 ID를 받음

    const query = `
        SELECT a.allergy_name
        FROM Allergies a
        JOIN UserAllergies ua ON a.allergy_id = ua.allergy_id
        WHERE ua.user_id = ?
    `;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('알레르기 정보 조회 실패:', err);
            return res.status(500).json({ message: '알레르기 정보 조회에 실패했습니다.' });
        }

        if (result.length === 0) {
            return res.status(200).json({ message: '알레르기 정보가 없습니다.' });
        }

        res.status(200).json({ allergies: result });
    });
});

// 서버 시작
const PORT = 3000; // 서버 포트 설정
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중`);
});
