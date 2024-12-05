const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password', // 실제 MySQL 비밀번호 입력
    database: 'recipe_web'
});

db.connect((err) => {
    if (err) throw err;
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

// 특정 사용자의 레시피 목록 조회 API
app.get('/getRecipes/:user_id', (req, res) => {
    const user_id = req.params.user_id;

    const sql = `
        SELECT * FROM recipes WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('레시피 조회 실패:', err);
            res.status(500).send('레시피 조회 실패');
        } else {
            res.json(results);
        }
    });
});

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password', // 데이터베이스 비밀번호
    database: 'your_database_name' // 데이터베이스 이름
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL에 연결되었습니다.');
});

// 사용자 알레르기 정보 저장 API
app.post('/saveAllergy', (req, res) => {
    const userId = req.body.userId;
    const allergies = req.body.allergies; // 알레르기 항목 ID 배열

    // 사용자 알레르기 정보 저장
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

app.listen(3000, () => {
    console.log('서버가 3000 포트에서 실행 중입니다.');
});
