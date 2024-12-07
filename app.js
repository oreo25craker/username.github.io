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

            // 사용자 ID 가져오기
            const userId = result.insertId || req.body.user_id;

            // 사용자의 알레르기 항목 저장
            if (allergies && allergies.length > 0) {
                // 기존 알레르기 정보 삭제
                const deleteAllergiesSql = 'DELETE FROM user_allergies WHERE user_id = ?';
                db.query(deleteAllergiesSql, [userId], (err) => {
                    if (err) {
                        console.error('알레르기 삭제 실패:', err);
                        return res.status(500).send('알레르기 삭제 실패');
                    }

                    // 새로운 알레르기 항목 추가
                    const insertAllergiesSql = 'INSERT INTO user_allergies (user_id, allergy_id) VALUES ?';
                    const allergyValues = allergies.map(allergyId => [userId, allergyId]);

                    db.query(insertAllergiesSql, [allergyValues], (err) => {
                        if (err) {
                            console.error('알레르기 항목 추가 실패:', err);
                            return res.status(500).send('알레르기 항목 추가 실패');
                        } else {
                            console.log('알레르기 항목 저장 성공');
                            res.status(200).send('사용자 정보와 알레르기 정보 저장 성공');
                        }
                    });
                });
            } else {
                res.status(200).send('사용자 정보 저장 성공');
            }
        }
    });
});

// 사용자 정보와 알레르기 정보 조회 API
app.get('/getUserAllergies/:userId', (req, res) => {
    const userId = req.params.userId;

    // 사용자 정보 조회
    const userSql = 'SELECT * FROM users WHERE id = ?';
    db.query(userSql, [userId], (err, userResult) => {
        if (err || userResult.length === 0) {
            console.error('사용자 조회 실패:', err);
            return res.status(404).send('사용자 정보가 없습니다.');
        }

        // 알레르기 항목 조회
        const allergiesSql = `
            SELECT a.name FROM allergies a
            JOIN user_allergies ua ON a.id = ua.allergy_id
            WHERE ua.user_id = ?
        `;
        db.query(allergiesSql, [userId], (err, allergyResult) => {
            if (err) {
                console.error('알레르기 정보 조회 실패:', err);
                return res.status(500).send('알레르기 정보 조회 실패');
            }
            res.status(200).json({
                user: userResult[0],
                allergies: allergyResult.map(item => item.name)
            });
        });
    });
});

// 서버 실행
app.listen(3000, () => {
    console.log('서버가 3000 포트에서 실행 중입니다.');
});
