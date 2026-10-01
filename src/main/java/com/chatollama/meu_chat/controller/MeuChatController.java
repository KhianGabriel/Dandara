package com.chatollama.meu_chat.controller;

import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MeuChatController {

    private final ChatClient chatClient;

    public MeuChatController(@NotNull ChatClient.Builder chatClient) {
        this.chatClient = chatClient.build();
    }

    @GetMapping("/ai")
    String generation(String prompt) {
        return this.chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }



}
