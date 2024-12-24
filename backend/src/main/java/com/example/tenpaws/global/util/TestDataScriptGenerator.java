//package com.example.tenpaws.global.util;
//
//import java.io.*;
//import java.nio.charset.StandardCharsets;
//
//public class TestDataScriptGenerator {
//    private static final String PASSWORD = "$2a$10$BuCFwfmsYeHDjMGbolqOMe3XRPiXMbzwUokpaglBM8J08A5PxzLsu";
//    private static final int NUM_USERS = 100;
//
//    public static void generateTestDataScript() {
//        String projectDir = System.getProperty("user.dir");
//        String resourcePath = projectDir + "/backend/src/main/resources/data.sql";
//
//        File resourceDir = new File(projectDir + "/backend/src/main/resources");
//        if (!resourceDir.exists()) {
//            resourceDir.mkdirs();
//        }
//
//        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
//                new FileOutputStream(resourcePath), StandardCharsets.UTF_8))) {
//
//            // 기존 데이터 삭제
//            writer.write("SET FOREIGN_KEY_CHECKS = 0;\n");
//            writer.write("DELETE FROM apply;\n");
//            writer.write("DELETE FROM pet_images;\n");
//            writer.write("DELETE FROM pets;\n");
//            writer.write("DELETE FROM Users;\n");
//            writer.write("DELETE FROM Shelters;\n");
//            writer.write("DELETE FROM Notifications;\n");
//            writer.write("ALTER TABLE Shelters AUTO_INCREMENT = 1;\n");
//            writer.write("SET FOREIGN_KEY_CHECKS = 1;\n\n");
//
//            // 사용자 데이터 생성
//            writer.write("INSERT INTO Users (email, username, password, birth_date, phone_number, address, user_role) VALUES\n");
//            for (int i = 1; i <= NUM_USERS; i++) {
//                String username = String.format("user%d", i);
//                String email = String.format("user%d@test.com", i);
//                String line = String.format("('%s', '%s', '%s', '1990-01-01', '010-1234-5678', 'Test Address %d', 'ROLE_USER')%s\n",
//                        email, username, PASSWORD, i, (i == NUM_USERS ? ";" : ","));
//                writer.write(line);
//            }
//
//            // 보호소 데이터 생성
//            writer.write("\nINSERT INTO Shelters (shelter_name, email, password, phone_number, address, user_role) VALUES\n");
//            writer.write("('Test Shelter', 'shelter@test.com', '" + PASSWORD + "', '02-1234-5678', 'Shelter Address', 'ROLE_SHELTER');\n");
//
//            // 반려동물 데이터 생성 (SELECT 문을 사용하여 shelter_id 참조)
//            writer.write("\nINSERT INTO pets (pet_name, species, size, age, gender, neutering, reason, pre_adoption, personality, exercise_level, shelter_id, status)\n");
//            writer.write("SELECT 'TestPet', '강아지', 'MEDIUM', '2', 'MALE', 'YES', 'Test Purpose', 'None', 'Friendly', 3, shelter_id, 'AVAILABLE'\n");
//            writer.write("FROM Shelters WHERE email = 'shelter@test.com';\n");
//
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
//
//    public static void main(String[] args) {
//        generateTestDataScript();
//    }
//}