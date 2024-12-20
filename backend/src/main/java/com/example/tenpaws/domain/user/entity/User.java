package com.example.tenpaws.domain.user.entity;

import com.example.tenpaws.domain.pet.species.Species;
import com.example.tenpaws.global.entity.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "Users")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "species")
    private Species species;

    @Column(name = "preferred_size")
    private String preferredSize;

    @Column(name = "preferred_personality")
    private String preferredPersonality;

    @Column(name = "preferred_exercise_level")
    private Integer preferredExerciseLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private UserRole userRole;

    // 신청 유무
    @Builder.Default
    @Setter
    @Enumerated(EnumType.STRING)
    private User.UserStatus status = User.UserStatus.AVAILABLE; // 기본값: 신청 가능
    public enum UserStatus {
        AVAILABLE, // 신청 가능
        APPLIED    // 신청 완료
    }

    public void changeUsername(String username) { this.username = username; }
    public void changePassword(String password) {
        this.password = password;
    }
    public void changeEmail(String email) { this.email = email; }
    public void changePhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void changeAddress(String address) { this.address = address; }
    public void changeUserRole(UserRole userRole) { this.userRole = userRole; }
    public void chageSpecies(Species species) { this.species = species; }
    public void changePreferredSize(String preferredSize) { this.preferredSize = preferredSize; }
    public void changePreferredPersonality(String preferredPersonality) { this.preferredPersonality = preferredPersonality; }
    public void changePreferredExerciseLevel(Integer preferredExerciseLevel) { this.preferredExerciseLevel = preferredExerciseLevel; }
    public void changeBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
}