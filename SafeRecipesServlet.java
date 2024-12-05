package com.yourpackage.servlets;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.sql.DataSource;
import com.google.gson.Gson;

@WebServlet("/safe-recipes")
public class SafeRecipesServlet extends HttpServlet {
    private AllergyFilterService allergyFilterService;

    @Override
    public void init() throws ServletException {
        DataSource dataSource = (DataSource) getServletContext().getAttribute("dataSource");
        allergyFilterService = new AllergyFilterService(dataSource);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        int userId = getUserIdFromSession(request);
        
        try {
            List<AllergyFilterService.Recipe> safeRecipes = allergyFilterService.getSafeRecipesForUser(userId);
            
            response.setContentType("application/json");
            response.getWriter().write(convertToJson(safeRecipes));
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error fetching safe recipes");
        }
    }

    private int getUserIdFromSession(HttpServletRequest request) {
        HttpSession session = request.getSession();
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("User not logged in");
        }
        return userId;
    }

    private String convertToJson(List<AllergyFilterService.Recipe> recipes) {
        Gson gson = new Gson();
        return gson.toJson(recipes);
    }
}

class AllergyFilterService {
    private DataSource dataSource;

    public AllergyFilterService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Recipe> getSafeRecipesForUser(int userId) throws SQLException {
        // Implementation of getSafeRecipesForUser method
        // This is a placeholder and should be replaced with actual implementation
        return new ArrayList<>();
    }

    public static class Recipe {
        private int id;
        private String title;
        private String ingredients;
        private String instructions;

        // Constructor, getters, and setters
    }
}
