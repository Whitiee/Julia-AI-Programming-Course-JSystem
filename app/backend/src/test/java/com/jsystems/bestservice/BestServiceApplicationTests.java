package com.jsystems.bestservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

class BestServiceApplicationTests {

    @Test
    void contextLoads() throws ClassNotFoundException {
        Class<?> applicationClass = Class.forName("com.jsystems.bestservice.BestServiceApplication");

        try (ConfigurableApplicationContext context = new SpringApplicationBuilder(applicationClass)
                .profiles("test")
                .web(WebApplicationType.SERVLET)
                .properties(
                        "spring.autoconfigure.exclude="
                                + "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
                                + "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
                                + "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
                )
                .run()) {
            assertThat(context.isRunning()).isTrue();
        }
    }
}
