package com.example.tenpaws.domain.user.service;

import com.example.tenpaws.domain.shelter.dto.ShelterRequestDTO;
import com.example.tenpaws.domain.user.dto.*;

import java.util.List;

public interface UserService {
    void registerUser(UserJoinDTO userJoinDTO);
    void registerShelter(ShelterRequestDTO shelterRequestDTO);
    UserResponseDTO getUserById(Long id);
    UserUpdateResponseDTO updateUser(Long id, UserUpdateRequestDTO userUpdateRequestDTO);
    void deleteUser(Long id);
    void deleteSocialUser(String id);
    List<UserResponseDTO> getAllUsers();
    List<OAuth2UserDTO> getAllSocialUsers();
    OAuth2UserDTO getSocialUserInfo(String userId);
    OAuth2UserDTO updateSocialUsername(String userId, UpdateSocialUsernameRequestDTO requestDTO);
}