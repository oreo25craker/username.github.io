package com.yourpackage.servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.sql.DataSource;

@WebServlet("/saveAllergy")
public class SaveAllergyServlet extends HttpServlet {
    private DataSource dataSource;

    @Override
    public void init() throws ServletException {
        dataSource = (DataSource) getServletContext().getAttribute("dataSource");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        Integer userId = (Integer) session.getAttribute("userId");

        if (userId == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not logged in");
            return;
        }

        String[] allergies = request.getParameterValues("allergy");

        try (Connection conn = dataSource.getConnection()) {
            // 기존 알레르기 정보를 삭제
            String deleteSQL = "DELETE FROM UserAllergies WHERE user_id = ?";
            try (PreparedStatement deleteStmt = conn.prepareStatement(deleteSQL)) {
                deleteStmt.setInt(1, userId);
                deleteStmt.executeUpdate();
            }

            // 새로 선택된 알레르기 정보를 저장
            if (allergies != null) {
                String insertSQL = "INSERT INTO UserAllergies (user_id, allergy_id) VALUES (?, ?)";
                for (String allergy : allergies) {
                    try (PreparedStatement insertStmt = conn.prepareStatement(insertSQL)) {
                        insertStmt.setInt(1, userId);
                        insertStmt.setInt(2, Integer.parseInt(allergy)); // 알레르기 ID로 변환
                        insertStmt.executeUpdate();
                    }
                }
            }

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("알레르기 정보가 저장되었습니다.");
        } catch (SQLException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
        }
    }
}
