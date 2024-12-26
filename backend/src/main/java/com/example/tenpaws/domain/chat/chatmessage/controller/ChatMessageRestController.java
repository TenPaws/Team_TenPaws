package com.example.tenpaws.domain.chat.chatmessage.controller;

import com.example.tenpaws.domain.chat.chatmessage.dto.ChatMessageRequest;
import com.example.tenpaws.domain.chat.chatmessage.dto.ChatMessageResponse;
import com.example.tenpaws.domain.chat.chatmessage.service.ChatMessageService;
import com.example.tenpaws.global.security.service.CustomUserDetailsService;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chatmessages")
@Tag(name = "채팅메시지 API", description = "채팅메시지 기능을 모아둔 컨트롤러 입니다")
public class ChatMessageRestController {
    private final ChatMessageService chatMessageService;
    private final CustomUserDetailsService customUserDetailsService;

    @Operation(summary = "채팅메시지 MySQL 조회", description = "MySQL로 특정 채팅방에서의 전체 채팅메시지 조회 API")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN') or (hasAnyRole('ROLE_USER', 'ROLE_SHELTER') and @chatRoomServiceImpl.isUserParticipated(#chatRoomId))")
    @GetMapping("/{chatRoomId}/mysql")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(@PathVariable("chatRoomId") Long chatRoomId) {
        List<ChatMessageResponse> chatMessageResponseList = chatMessageService.getChatMessagesByChatRoomId(chatRoomId);
        List<ChatMessageResponse> list = chatMessageResponseList.stream().peek(chatMessageResponse -> {
            Map<String, Object> userDetails = customUserDetailsService.getInfosByEmail(chatMessageResponse.getSenderEmail());
            chatMessageResponse.setSenderName(userDetails.get("username").toString());
        }).toList();
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "채팅메시지 Redis 조회", description = "Redis로 특정 채팅방에서의 전체 채팅메시지 조회 API")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN') or (hasAnyRole('ROLE_USER', 'ROLE_SHELTER') and @chatRoomServiceImpl.isUserParticipated(#chatRoomId))")
    @GetMapping("/{chatRoomId}")
    public ResponseEntity<List<Map<String, String>>> getChatMessagesFromRedis(@PathVariable("chatRoomId") Long chatRoomId) throws JsonProcessingException {
        return ResponseEntity.ok(chatMessageService.getMessages(chatRoomId));
    }
}
