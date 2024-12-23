package com.example.tenpaws.domain.recommendation.service;

import com.example.tenpaws.domain.pet.dto.PetResponseDTO;
import com.example.tenpaws.domain.pet.entity.Pet;
import com.example.tenpaws.domain.pet.repository.PetRepository;
import com.example.tenpaws.domain.user.entity.User;
import com.example.tenpaws.global.exception.BaseException;
import com.example.tenpaws.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RecommendService {

    private final ApiService apiService;
    private final PetRepository petRepository;

    // 추천된 Pet ID 저장
    private final Map<Long, Set<Long>> userRecommendedPets = new HashMap<>();

    public Map<String, Object> recommendPet(User user) throws IOException {
        try {
            // Step 1: 사용자 선호 기준 가져오기
            String size = user.getPreferredSize();
            String personality = user.getPreferredPersonality();
            Integer exerciseLevel = user.getPreferredExerciseLevel();

//            // Step 2: 보호소에서 등록된 모든 반려동물 데이터 가져오기
//            List<Pet> allPets = petRepository.findAll();
//            // Step 3: Pet 데이터를 AI에 전달하기 위한 포맷으로 변환
//            String petDescriptions = allPets.stream()
//                    .map(pet -> String.format(
//                            "Id: %s, Size: %s, Personality: %s, Exercise Level: %s",
//                            pet.getId(), pet.getSize(), pet.getPersonality(), pet.getExerciseLevel()))
//                    .collect(Collectors.joining("\n"));

            // Step 2: 사용자가 이미 추천받은 Pet ID 확인
            Set<Long> excludedPetIds = userRecommendedPets.getOrDefault(user.getId(), new HashSet<>());

            // Step 3: 보호소에서 등록된 Pet 중 제외된 ID를 필터링
            List<Pet> filteredPets = petRepository.findAll().stream()
                    .filter(pet -> !excludedPetIds.contains(pet.getId()))
                    .collect(Collectors.toList());
            // No pets avaliable이 발생하면 추천된 반려동물 id 목록 초기화
            if (filteredPets.isEmpty()) {
                userRecommendedPets.remove(user.getId());
                throw new BaseException(ErrorCode.NO_PETS_AVAILABLE);
            }

            // Step 4: 필터링된 Pet 데이터를 AI에 전달
            String petDescriptions = filteredPets.stream()
        .map(pet -> String.format(
            "Name: %s, Id: %s, Size: %s, Personality: %s, Exercise Level: %s, Story: %s",
            pet.getPetName(),
            pet.getId(),
            pet.getSize(),
            pet.getPersonality(),
            pet.getExerciseLevel(),
            pet.getReason() // reason 필드 추가
        ))
        .collect(Collectors.joining("\n"));

    String prompt = String.format(
        "안녕하세요! 저는 새로운 가족을 찾아주는 매칭 도우미예요 :)\n" +
        "입양을 희망하시는 분의 선호도는 다음과 같아요:\n" +
        "- Size: %s\n" +
        "- Personality: %s\n" +
        "- Exercise Level: %s\n\n" +
        "현재 보호소에 있는 아이들은 다음과 같아요:\n%s\n\n" +
        "위 정보를 바탕으로 한 마리의 아이를 추천해주세요.\n" +
        "추천하는 아이의 이야기를 다음과 같은 형식으로 들려주세요:\n" +
        "1. 자기소개 형식으로 작성해주세요\n" +
        "2. 보호소에 오게 된 사연을 포함하여 아이의 이야기를 들려주세요\n" + // 스토리텔링 요청 추가
        "3. 입양 희망자와 잘 맞을 것 같은 이유를 구체적으로 설명해주세요\n" +
        "4. Status가 APPLIED인 아이는 추천하지 말아주세요\n" +
        "5. 마지막에 반드시 (Id: ?) 형식으로 추천하는 아이의 ID를 포함해주세요\n" +
        "6. 부정적인 표현이나 '완벽하게 맞지 않지만' 같은 문구는 사용하지 말아주세요",
        size, personality, exerciseLevel, petDescriptions);

            // Step 5: OpenAI 호출
            String aiResponseContent = apiService.getRecommendation(prompt);  // aiResponseContent로 바로 처리;
            String recommendedId = extractRecommendedId(aiResponseContent);

            if (recommendedId == null) {
                // recommendedId가 null인 경우, AI 응답만 반환
                Map<String, Object> result = new HashMap<>();
                result.put("content", aiResponseContent);
                return result;
            }

            // Step 5: 추천된 반려동물 정보 가져오기
            Long petId = Long.valueOf(recommendedId);
            Pet recommendedPet = petRepository.findById(Long.valueOf(recommendedId))
                    .orElseThrow(() -> new BaseException(ErrorCode.PET_NOT_FOUND));

            // 추천된 id를 user에 따라 저장
            excludedPetIds.add(petId);
            userRecommendedPets.put(user.getId(), excludedPetIds);

            // petResponseDTO로 변환
            PetResponseDTO petResponseDTO = PetResponseDTO.fromEntity(recommendedPet); //dto에 fromEntity 존재, 이걸로 정적 팩토리 메서드 사용

            Map<String, Object> result = new HashMap<>();

            // ai 응답에서 (Id: ~~~) 부분을 클라이언트에 반환 시 삭제하여 공백으로 반환(서버 응답은 남아있으므로 여전히 petId는 사용 가능함.
            String reason = aiResponseContent.replaceAll("\\(Id: \\s*\\d+\\)", "");

            result.put("content", reason); // AI 응답의 content
            result.put("petId", petResponseDTO.getPetId()); // 추천된 Pet의 ID
            result.put("pet", petResponseDTO); // Pet 정보

            return result;
        } catch (IOException e) {
            throw new BaseException(ErrorCode.AI_COMMUNICATION_ERROR);
        }
    }

    private String extractRecommendedId(String response) {
        Pattern pattern = Pattern.compile("Id:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(response);

        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
