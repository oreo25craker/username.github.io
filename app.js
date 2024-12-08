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
    const { allergies } = req.body;
    const userId = 1;  // 예시로 사용자의 ID가 1이라고 가정

    if (!allergies || allergies.length === 0) {
        return res.status(400).json({ success: false, message: '알레르기 항목을 선택해주세요.' });
    }

    // 사용자가 선택한 알레르기를 userAllergies 테이블에 저장
    const allergyPromises = allergies.map(allergyId => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO userAllergies (user_id, allergy_id) VALUES (?, ?)';
            db.query(sql, [userId, allergyId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });

    Promise.all(allergyPromises)
        .then(() => {
            res.status(200).json({ success: true, message: '알레르기 정보 저장 성공' });
        })
        .catch(err => {
            console.error('알레르기 저장 오류:', err);
            res.status(500).json({ success: false, message: '알레르기 저장에 실패했습니다.' });
        });
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
