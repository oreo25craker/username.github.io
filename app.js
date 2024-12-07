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
    password: '', // 비밀번호 (권장: 환경 변수로 관리)
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

// 알레르기 항목 데이터
const allergyItems = [
    { id: 1, name: '난류' },
    { id: 2, name: '메밀' },
    { id: 3, name: '대두' },
    { id: 4, name: '고등어' },
    { id: 5, name: '새우' },
    { id: 6, name: '복숭아' },
    { id: 7, name: '우유' },
    { id: 8, name: '땅콩' },
    { id: 9, name: '밀' },
    { id: 10, name: '게' },
    { id: 11, name: '돼지고기' },
    { id: 12, name: '토마토' }
];

// 사용자 정보 저장 또는 업데이트 API
app.post('/saveUser', (req, res) => {
    const { kakao_id, nickname, email, profile_image, allergies } = req.body;

    // 사용자 정보를 저장하거나 업데이트하는 SQL 쿼리
    const sql = `
        INSERT INTO users (kakao_id, nickname, email, profile_image)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nickname=?, email=?, profile_image=?, allergies=?
    `;
    
    // 알레르기 정보를 JSON 문자열로 저장 (알레르기 항목을 배열로 받았다고 가정)
    const allergyData = JSON.stringify(allergies);

    db.query(sql, [kakao_id, nickname, email, profile_image, nickname, email, profile_image, allergyData], (err, result) => {
        if (err) {
            console.error('사용자 정보 저장 실패:', err);
            return res.status(500).send('사용자 정보 저장 실패');
        }
        console.log('사용자 정보 저장 또는 업데이트 성공');
        res.status(200).send('사용자 정보 저장 성공');
    });
});

// 레시피 추가 API
app.post('/addRecipe', (req, res) => {
    const { user_id, title, description, ingredients, instructions, allergies } = req.body;

    // SQL 쿼리: 레시피 추가
    const sql = `
        INSERT INTO recipes (user_id, title, description, ingredients, instructions, allergies)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // 알레르기 정보를 JSON 문자열로 저장
    const allergyData = JSON.stringify(allergies);

    db.query(sql, [user_id, title, description, ingredients, instructions, allergyData], (err, result) => {
        if (err) {
            console.error('레시피 추가 실패:', err);
            return res.status(500).send('레시피 추가 실패');
        }
        console.log('레시피 추가 성공');
        res.status(200).send('레시피 추가 성공');
    });
});

// 알레르기 정보 조회 API (사용자가 가진 알레르기 목록 가져오기)
app.get('/getUserAllergies/:user_id', (req, res) => {
    const { user_id } = req.params;

    // 사용자 정보에서 알레르기 데이터를 가져오는 SQL 쿼리
    const sql = `
        SELECT allergies FROM users WHERE kakao_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error('알레르기 정보 조회 실패:', err);
            return res.status(500).send('알레르기 정보 조회 실패');
        }

        if (result.length > 0) {
            // 알레르기 정보가 존재하면 JSON 문자열을 다시 배열로 변환
            const allergies = JSON.parse(result[0].allergies);
            res.status(200).json(allergies);
        } else {
            res.status(404).send('사용자를 찾을 수 없습니다');
        }
    });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
