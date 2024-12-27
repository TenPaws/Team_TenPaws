package com.example.tenpaws.domain.pet.service;

import com.example.tenpaws.domain.pet.dto.PetRequestDTO;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIDescriptionService {

    @Value("${openai.api.key}")
    private String API_KEY;
    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public String generatePetIntroduction(PetRequestDTO petRequestDTO) throws IOException {
        String prompt = createPrompt(petRequestDTO);

        ChatRequest chatRequest = new ChatRequest(prompt);
        String json = objectMapper.writeValueAsString(chatRequest);

        Request request = new Request.Builder()
                .url(apiUrl)
                .post(RequestBody.create(json, MediaType.parse("application/json")))
                .addHeader("Authorization", "Bearer " + API_KEY)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected response: " + response);
            }
            String responseBody = response.body().string();
            Map<String, Object> jsonResponse = objectMapper.readValue(responseBody, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) jsonResponse.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
            throw new IOException("Unexpected API response");
        }
    }

    private String createPrompt(PetRequestDTO petRequestDTO) {
        return String.format(
                "당신은 보호소에 입소한 반려동물이에요. 다음 반려동물에 대한 자기소개를 귀엽게 작성해 주세요:\n" +
                        "이름: %s\n" +
                        "종: %s\n" +
                        "크기: %s\n" +
                        "나이: %s\n" +
                        "성별: %s\n" +
                        "성격: %s\n" +
                        "활동량: %s\n" +
                        "보호소 입소 이유: %s\n",
                petRequestDTO.getPetName(),
                petRequestDTO.getSpecies(),
                petRequestDTO.getSize(),
                petRequestDTO.getAge(),
                petRequestDTO.getGender(),
                petRequestDTO.getPersonality(),
                petRequestDTO.getExerciseLevel(),
                petRequestDTO.getReason()
        );
    }

    @Getter
    public static class ChatRequest {
        private String model = "gpt-4o-mini"; // 모델 선택
        private Message[] messages;

        public ChatRequest(String prompt) {
            this.messages = new Message[]{new Message("user", prompt)};
        }

        @Getter
        @Setter
        public static class Message {
            private String role;
            private String content;

            public Message(String role, String content) {
                this.role = role;
                this.content = content;
            }
        }
    }
}
