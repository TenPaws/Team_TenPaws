package com.example.tenpaws.domain.chat.backup.scheduler;

import com.example.tenpaws.domain.chat.backup.service.BackUpService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class BackUpScheduler {
    private final BackUpService backUpService;

//    @Scheduled(fixedRate = 3600000)
    public void backUp() {
        List<String> roomIds = backUpService.getAllRoomIdsFromRedis();
        for (String roomId : roomIds) {
            backUpService.backUpMessages(Long.valueOf(roomId));
        }
    }
}
