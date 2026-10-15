package com.chatollama.meu_chat.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public class MeuChatService {

    private final ChatClient chatClient;

    public MeuChatService(ChatClient.Builder builder,
                          @Value("classpath:templates/system-financeiro.st") Resource systemPrompt) {
        this.chatClient = builder
                .defaultSystem(systemPrompt)
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .build();
    }

    public String perguntar(String mensagem) {
        return chatClient.prompt()
                .user(mensagem)
                .call()
                .content();
    }

}
