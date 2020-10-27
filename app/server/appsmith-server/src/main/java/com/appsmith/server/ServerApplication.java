package com.appsmith.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
//@EnableScheduling
public class ServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServerApplication.class, args);
    }

//    @PostConstruct
//    public void init() {
//        LOGGER.info("CPU: {}", Runtime.getRuntime().availableProcessors());
//    }
}
