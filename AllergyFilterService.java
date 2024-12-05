import java.sql.*;
import java.util.*;
import javax.sql.DataSource;

public class AllergyFilterService {
    private DataSource dataSource;

    public AllergyFilterService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Recipe> getSafeRecipesForUser(int userId) throws SQLException {
        List<Recipe> safeRecipes = new ArrayList<>();
        Set<String> userAllergies = getUserAllergies(userId);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM recipes");
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                Recipe recipe = new Recipe(
                    rs.getInt("recipe_id"),
                    rs.getString("title"),
                    rs.getString("ingredients"),
                    rs.getString("instructions")
                );

                if (isSafeRecipe(recipe, userAllergies)) {
                    safeRecipes.add(recipe);
                }
            }
        }

        return safeRecipes;
    }

    private Set<String> getUserAllergies(int userId) throws SQLException {
        Set<String> allergies = new HashSet<>();
        String query = "SELECT a.allergy_name FROM Allergies a " +
                       "JOIN UserAllergies ua ON a.allergy_id = ua.allergy_id " +
                       "WHERE ua.user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setInt(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    allergies.add(rs.getString("allergy_name").toLowerCase());
                }
            }
        }

        return allergies;
    }

    private boolean isSafeRecipe(Recipe recipe, Set<String> userAllergies) {
        String[] ingredients = recipe.getIngredients().toLowerCase().split(",");
        for (String ingredient : ingredients) {
            if (userAllergies.contains(ingredient.trim())) {
                return false;
            }
        }
        return true;
    }

    public static class Recipe {
        private int id;
        private String title;
        private String ingredients;
        private String instructions;

        public Recipe(int id, String title, String ingredients, String instructions) {
            this.id = id;
            this.title = title;
            this.ingredients = ingredients;
            this.instructions = instructions;
        }

        // Getters
        public int getId() { return id; }
        public String getTitle() { return title; }
        public String getIngredients() { return ingredients; }
        public String getInstructions() { return instructions; }
    }
}
