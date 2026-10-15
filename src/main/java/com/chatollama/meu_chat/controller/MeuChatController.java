package com.chatollama.meu_chat.controller;

import com.chatollama.meu_chat.dto.MeuChatRequest;
import com.chatollama.meu_chat.dto.MeuChatResponse;
import com.chatollama.meu_chat.service.MeuChatService;
import org.springframework.web.bind.annotation.*;

@RestController
public class MeuChatController {

    private final MeuChatService chatService;

    public MeuChatController(MeuChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/ai")
    public String perguntar(@RequestParam String prompt) {
        return chatService.perguntar(prompt);
    }

    @PostMapping("/api/chat")
    public MeuChatResponse chat(@RequestBody MeuChatRequest chatRequest) {
        return new MeuChatResponse(chatService.perguntar(chatRequest.message()));
    }
}
