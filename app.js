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

// 사용자 정보 저장 또는 업데이트 API
app.post('/saveUser', (req, res) => {
    const { kakao_id, nickname, email, profile_image } = req.body;

    // SQL 쿼리: 사용자 정보 저장 또는 업데이트
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
            res.status(200).send('사용자 정보 저장 성공');
        }
    });
});

// 레시피 추가 API
app.post('/addRecipe', (req, res) => {
    const { user_id, title, description, ingredients, instructions } = req.body;

    // 필수 값 체크
    if (!user_id || !title || !description || !ingredients || !instructions) {
        return res.status(400).send('모든 필드가 필수입니다.');
    }

    const sql = `
        INSERT INTO recipes (user_id, title, description, ingredients, instructions)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, title, description, ingredients, instructions], (err, result) => {
        if (err) {
            console.error('레시피 추가 실패:', err);
            return res.status(500).send('레시피 추가에 실패했습니다.');
        }

        console.log('레시피 추가 성공');
        res.status(200).send('레시피가 성공적으로 추가되었습니다.');
    });
});

// 알레르기 정보 저장 API
app.post('/saveAllergies', (req, res) => {
    const { user_id, allergies } = req.body;  // 클라이언트에서 보낸 user_id와 allergies (알레르기 ID 배열)

    const sql = `
        INSERT INTO userAllergies (user_id, allergy_id)
        VALUES (?, ?)
    `;
    
    // 알레르기 항목들 삽입 (배열을 반복문을 통해 처리)
    allergies.forEach(allergy_id => {
        db.query(sql, [user_id, allergy_id], (err, result) => {
            if (err) {
                console.error('알레르기 정보 저장 실패:', err);
                return res.status(500).send('알레르기 정보 저장 실패');
            }
        });
    });

    res.status(200).send('알레르기 정보 저장 성공');
});


// 알레르기 정보 조회 API
app.get('/getAllergies', (req, res) => {
    const userId = req.query.userId;

    const sql = `
        SELECT allergy_name 
        FROM allergies
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('알레르기 정보 조회 실패:', err);
            return res.status(500).send('알레르기 정보 조회에 실패했습니다.');
        }

        if (result.length === 0) {
            res.status(200).send('알레르기 정보가 없습니다.');
        } else {
            res.status(200).json({ allergies: result });
        }
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
