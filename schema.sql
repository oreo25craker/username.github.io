-- 데이터베이스 생성
CREATE DATABASE recipe_web;
USE recipe_web;

-- 사용자 테이블 생성
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    kakao_id VARCHAR(100) NOT NULL UNIQUE,   -- 카카오에서 제공하는 사용자 ID
    nickname VARCHAR(50) NOT NULL,           -- 사용자 닉네임
    email VARCHAR(100),                      -- 사용자 이메일
    profile_image VARCHAR(255),              -- 프로필 이미지 URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 레시피 테이블 생성
CREATE TABLE recipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                    -- 레시피 작성자의 사용자 ID (foreign key)
    title VARCHAR(100) NOT NULL,             -- 레시피 제목
    description TEXT,                        -- 레시피 설명
    ingredients TEXT,                        -- 재료 목록
    instructions TEXT,                       -- 조리 방법
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
