package com.example.tenpaws.domain.chat.chatmessage.service;

import com.example.tenpaws.domain.chat.chatmessage.dto.ChatMessageRequest;
import com.example.tenpaws.domain.chat.chatmessage.dto.ChatMessageResponse;
import com.example.tenpaws.domain.chat.chatmessage.repository.ChatMessageRepository;
import com.example.tenpaws.domain.chat.chatroom.entity.ChatRoom;
import com.example.tenpaws.domain.chat.chatroom.repository.ChatRoomRepository;
import com.example.tenpaws.global.exception.BaseException;
import com.example.tenpaws.global.exception.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import redis.clients.jedis.Jedis;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatMessageServiceImpl implements ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final Jedis jedis;

    public ChatMessageServiceImpl(ChatMessageRepository chatMessageRepository, ChatRoomRepository chatRoomRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.jedis = new Jedis("localhost", 6379);
    }

    @Override
    @Transactional
    public ChatMessageResponse createChatMessage(ChatMessageRequest chatMessageRequest) {
        try {
            ChatRoom chatRoom = chatRoomRepository.findById(chatMessageRequest.getChatRoomId()).orElseThrow(() -> new BaseException(ErrorCode.CHATROOM_NOT_FOUND));
            return new ChatMessageResponse(chatMessageRepository.save(chatMessageRequest.toEntity(chatRoom)));
        } catch (Exception e) {
            throw new BaseException(ErrorCode.CHAT_MESSAGE_NOT_REGISTERED);
        }
    }

    @Override
    public List<ChatMessageResponse> getChatMessagesByChatRoomId(Long chatRoomId) {
        return chatMessageRepository.findByChatRoomId(chatRoomId).stream().map(ChatMessageResponse::new).toList();
    }

    @Override
    public void saveMessage(ChatMessageRequest chatMessageRequest) {
        String key = "room:" + chatMessageRequest.getChatRoomId();
        String jsonMessage = String.format("{\"senderEmail\": \"%s\", \"message\": \"%s\", \"chatDate\": \"%s\"}", chatMessageRequest.getSenderEmail(), chatMessageRequest.getMessage(), chatMessageRequest.getChatDate());
        jedis.rpush(key, jsonMessage);
//        jedis.ltrim(key, -100, 0);
    }

    @Override
    public List<Map<String, String>> getMessages(Long chatRoomId) throws JsonProcessingException {
        String key = "room:" + chatRoomId;
        List<String> rawMessages = jedis.lrange(key, 0, -1);
        List<Map<String, String>> parsedMessages = new ArrayList<>();

        for (String rawMessage : rawMessages) {
            Map<String, String> messageMap = new ObjectMapper().readValue(rawMessage, HashMap.class);
            parsedMessages.add(messageMap);
        }

        return parsedMessages;
    }
}
