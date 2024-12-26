package com.example.tenpaws.domain.chat.chatmessage.dto;

import com.example.tenpaws.domain.chat.chatmessage.entity.ChatMessage;
import com.example.tenpaws.domain.chat.chatroom.entity.ChatRoom;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ChatMessageRequest {
    @NotBlank
    private String message;

    @NotBlank
    private String senderEmail;

    @NotBlank
    private String receiverEmail;

    @NonNull
    private Long chatRoomId;

    private LocalDateTime chatDate = LocalDateTime.now();

    @Builder
    public ChatMessageRequest(String message, String senderEmail, String receiverEmail, @NonNull Long chatRoomId) {
        this.message = message;
        this.senderEmail = senderEmail;
        this.receiverEmail = receiverEmail;
        this.chatRoomId = chatRoomId;
    }

    public ChatMessage toEntity(ChatRoom chatRoom) {
        return ChatMessage.builder()
                .message(message)
                .sender(senderEmail)
                .chatRoom(chatRoom)
                .build();
    }
}
