package com.example.tenpaws.domain.chat.chatmessage.controller;

import com.example.tenpaws.domain.chat.chatmessage.dto.ChatMessageRequest;
import com.example.tenpaws.domain.chat.chatmessage.repository.ChatMessageRepository;
import com.example.tenpaws.domain.chat.chatmessage.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import redis.clients.jedis.Jedis;

@RestController
@RequiredArgsConstructor
public class SampleDataController {
    private final ChatMessageService chatMessageService;
    private final ChatMessageRepository chatMessageRepository;
    private final Jedis jedis = new Jedis("localhost", 6379);

    @PostMapping("/sample-data")
    public void saveSampleData() {
        chatMessageRepository.deleteAll();
        jedis.flushDB();
        for (int i = 0; i < 1000; i++) {
            chatMessageService.saveMessage(ChatMessageRequest.builder()
                    .message("sample")
                    .chatRoomId(68L)
                    .senderEmail("user@user.com")
                    .receiverEmail("user2@user.com")
                    .build());
            chatMessageService.createChatMessage(ChatMessageRequest.builder()
                    .message("sample")
                    .chatRoomId(68L)
                    .senderEmail("user@user.com")
                    .receiverEmail("user2@user.com")
                    .build());
        }
    }
}
