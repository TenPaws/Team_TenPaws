package com.example.tenpaws.domain.chat.chatmessage.service;

import com.example.tenpaws.domain.chat.chatmessage.dto.ChatMessageRequest;
import com.example.tenpaws.domain.chat.chatmessage.dto.ChatMessageResponse;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;
import java.util.Map;

public interface ChatMessageService {
    ChatMessageResponse createChatMessage(ChatMessageRequest chatMessageRequest);

    List<ChatMessageResponse> getChatMessagesByChatRoomId(Long chatRoomId);

    void saveMessage(ChatMessageRequest chatMessageRequest);

    List<Map<String, String>> getMessages(Long chatRoomId) throws JsonProcessingException;
}
