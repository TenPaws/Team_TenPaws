package com.example.tenpaws.domain.chat.backup.service;

import com.example.tenpaws.domain.chat.backup.entity.BackUpMessages;
import com.example.tenpaws.domain.chat.backup.repository.BackUpRepository;
import org.springframework.stereotype.Service;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.params.ScanParams;
import redis.clients.jedis.resps.ScanResult;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BackUpService {
    private final Jedis jedis;
    private final BackUpRepository backUpRepository;

    public BackUpService(BackUpRepository backUpRepository) {
        this.jedis = new Jedis("localhost", 6379);
        this.backUpRepository = backUpRepository;
    }

    public void backUpMessages(Long chatRoomId) {
        String key = "room:" + chatRoomId;
        List<String> messages = jedis.lrange(key, 0, -1);

        if (messages.isEmpty()) {
            return;
        }

        List<BackUpMessages> backUpMessagesList = messages.stream()
                .map(message -> BackUpMessages.builder()
                        .chatRoomId(chatRoomId)
                        .message(message)
                        .build())
                .collect(Collectors.toList());

        backUpRepository.saveAll(backUpMessagesList);

        jedis.del(key);
    }

    public List<String> getAllRoomIdsFromRedis() {
        List<String> roomIds = new ArrayList<>();
        String cursor = "0";
        ScanParams scanParams = new ScanParams().match("room:*").count(100);

        do {
            ScanResult<String> scanResult = jedis.scan(cursor, scanParams);
            List<String> keys = scanResult.getResult();
            cursor = scanResult.getCursor();

            for (String key : keys) {
                roomIds.add(key.replace("room:", ""));
            }
        } while (!cursor.equals("0"));

        return roomIds;
    }
}
