package com.example.tenpaws.domain.chat.chatroom.controller;

import com.example.tenpaws.domain.chat.chatroom.dto.ChatRoomRequest;
import com.example.tenpaws.domain.chat.chatroom.dto.ChatRoomResponse;
import com.example.tenpaws.domain.chat.chatroom.service.ChatRoomService;
import com.example.tenpaws.domain.chat.unread.dto.UnReadChatMessagesResponse;
import com.example.tenpaws.domain.chat.unread.service.UnReadChatMessagesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chatrooms")
public class ChatRoomController {
    private final ChatRoomService chatRoomService;
    private final UnReadChatMessagesService unReadChatMessagesService;

    @GetMapping("/{user1}/{user2}")
    public ResponseEntity<ChatRoomResponse> findChatRoomByUsers(@PathVariable("user1") String user1, @PathVariable("user2") String user2) {
        return ResponseEntity.ok(chatRoomService.getChatRoomByUsers(user1, user2));
    }

    @GetMapping("/user/{user}")
    public ResponseEntity<List<ChatRoomResponse>> findChatRoomsByUser(@PathVariable("user") String user) {
        List<ChatRoomResponse> chatRoomResponseList = chatRoomService.getChatRoomsByUser(user);
        List<UnReadChatMessagesResponse> unReadChatMessagesResponseList = unReadChatMessagesService.read(user);
        for (int i = 0; i < chatRoomResponseList.size(); i++) {
            chatRoomResponseList.get(i).setUnReadCount(unReadChatMessagesResponseList.get(i).getUnReadCount());
        }
        return ResponseEntity.ok(chatRoomResponseList);
    }

    @PostMapping
    public ResponseEntity<ChatRoomResponse> createChatRoom(@Valid @RequestBody ChatRoomRequest chatRoomRequest) {
        ChatRoomResponse chatRoomResponse = chatRoomService.create(chatRoomRequest);
        unReadChatMessagesService.create(chatRoomResponse.getChatRoomId(), chatRoomResponse.getUser1(), chatRoomResponse.getUser2());
        return ResponseEntity.ok(chatRoomResponse);
    }

    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<Map<String, String>> deleteChatRoom(@PathVariable("chatRoomId") Long chatRoomId) {
        chatRoomService.delete(chatRoomId);
        return ResponseEntity.ok(Map.of("message", "ChatRoom deleted"));
    }
}
