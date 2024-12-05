import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [selectedAllergies, setSelectedAllergies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recipesResponse = await axios.get('/api/recipes');
                const allergiesResponse = await axios.get('/api/allergies');
                
                setRecipes(recipesResponse.data);
                setAllergies(allergiesResponse.data);

                // 사용자 알레르기를 로컬 스토리지에서 불러오기
                const savedAllergies = JSON.parse(localStorage.getItem('selectedAllergies')) || [];
                setSelectedAllergies(savedAllergies);
            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
            }
        };
        fetchData();
    }, []);

    // 필터링된 레시피 목록
    const filteredRecipes = recipes.filter(recipe => 
        !recipe.ingredients.split(',').some(ingredient =>
            selectedAllergies.includes(ingredient.trim().toLowerCase())
        )
    );

    return (
        <div>
            <h1>레시피 목록</h1>
            
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
