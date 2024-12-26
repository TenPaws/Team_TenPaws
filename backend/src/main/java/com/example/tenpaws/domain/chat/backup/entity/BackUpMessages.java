package com.example.tenpaws.domain.chat.backup.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "backup")
@NoArgsConstructor
public class BackUpMessages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long chatRoomId;

    @Column(nullable = false)
    private String message;

    private LocalDateTime backUpDate = LocalDateTime.now();

    @Builder
    public BackUpMessages(Long chatRoomId, String message) {
        this.chatRoomId = chatRoomId;
        this.message = message;
    }
}
