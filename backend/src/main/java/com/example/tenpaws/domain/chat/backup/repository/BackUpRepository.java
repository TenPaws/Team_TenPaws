package com.example.tenpaws.domain.chat.backup.repository;

import com.example.tenpaws.domain.chat.backup.entity.BackUpMessages;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackUpRepository extends JpaRepository<BackUpMessages, Long> {
}
