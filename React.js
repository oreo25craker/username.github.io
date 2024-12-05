import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [selectedAllergies, setSelectedAllergies] = useState([]);

    useEffect(() => {
        // 로컬 스토리지에서 선택한 알레르기 항목을 불러옵니다.
        const savedAllergies = JSON.parse(localStorage.getItem('selectedAllergies')) || [];
        setSelectedAllergies(savedAllergies);

        // 레시피와 알레르기 데이터를 가져옵니다.
        const fetchData = async () => {
            try {
                const recipesResponse = await axios.get('/api/recipes'); // 레시피 API 호출
                const allergiesResponse = await axios.get('/api/allergies'); // 알레르기 API 호출
                setRecipes(recipesResponse.data);
                setAllergies(allergiesResponse.data);
            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
            }
        };
        fetchData();
    }, []);

    // 알레르기를 선택하는 함수
    const handleAllergyChange = (allergy) => {
        if (selectedAllergies.includes(allergy)) {
            setSelectedAllergies(selectedAllergies.filter(a => a !== allergy));
        } else {
            setSelectedAllergies([...selectedAllergies, allergy]);
        }

        // 선택한 알레르기를 로컬 스토리지에 저장합니다.
        localStorage.setItem('selectedAllergies', JSON.stringify(
            selectedAllergies.includes(allergy) 
                ? selectedAllergies.filter(a => a !== allergy) 
                : [...selectedAllergies, allergy]
        ));
    };

    // 필터링된 레시피 목록
    const filteredRecipes = recipes.filter(recipe => {
        return !recipe.ingredients.split(',').some(ingredient => 
            selectedAllergies.includes(ingredient.trim().toLowerCase())
        );
    });

    return (
        <div>
            <h1>레시피 목록</h1>
            <div>
                <h2>알레르기 항목 선택</h2>
                {allergies.map(allergy => (
                    <div key={allergy.allergy_id}>
                        <input
                            type="checkbox"
                            checked={selectedAllergies.includes(allergy.allergy_name.toLowerCase())}
                            onChange={() => handleAllergyChange(allergy.allergy_name.toLowerCase())}
                        />
                        {allergy.allergy_name}
                    </div>
                ))}
            </div>

            <h2>필터링된 레시피</h2>
            <div className="recipe-list">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <div key={recipe.recipe_id} className="recipe">
                            <h3>{recipe.title}</h3>
                            <p><strong>조리 방법:</strong> {recipe.instructions}</p>
                        </div>
                    ))
                ) : (
                    <p>해당하는 레시피가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default RecipeList;
