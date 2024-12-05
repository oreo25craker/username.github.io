import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllergyCheck = () => {
    const [allergies, setAllergies] = useState([]);
    const [selectedAllergies, setSelectedAllergies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/allergies'); // 알레르기 API 호출
                setAllergies(response.data);
            } catch (error) {
                console.error('알레르기 데이터 가져오기 실패:', error);
            }
        };
        fetchData();
    }, []);

    const handleAllergyChange = (allergy) => {
        if (selectedAllergies.includes(allergy)) {
            setSelectedAllergies(selectedAllergies.filter(a => a !== allergy));
        } else {
            setSelectedAllergies([...selectedAllergies, allergy]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post('/saveAllergy', { allergy: selectedAllergies });
            alert('알레르기 정보가 저장되었습니다.');
        } catch (error) {
            console.error('알레르기 정보 저장 실패:', error);
            alert('알레르기 정보 저장에 실패했습니다.');
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h1>음식 알레르기 검사</h1>
            </div>
            <form id="allergyForm" className="allergy-form" onSubmit={handleSubmit}>
                <div className="allergy-group">
                    <label>알레르기 항목을 선택하세요:</label>
                    <div className="allergy-items">
                        {allergies.map(allergy => (
                            <div key={allergy.allergy_id} className="allergy-item">
                                <input
                                    type="checkbox"
                                    id={`allergy-${allergy.allergy_id}`}
                                    name="allergy"
                                    value={allergy.allergy_id} // ID로 변경
                                    checked={selectedAllergies.includes(allergy.allergy_id)}
                                    onChange={() => handleAllergyChange(allergy.allergy_id)}
                                />
                                <label htmlFor={`allergy-${allergy.allergy_id}`}>{allergy.allergy_name}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit">검사 제출</button>
            </form>

            {/* 홈으로 가는 버튼 추가 */}
            <div className="home-button-container">
                <a href="index.html" className="home-button">홈으로</a>
            </div>
        </div>
    );
};

export default AllergyCheck;
