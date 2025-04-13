package com.knowledgegrapheditor.kge.config;

import org.neo4j.driver.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Scope;

@Configuration
public class Neo4jDbConfig {

    @Bean
    @Primary
    @Scope("singleton")
    public Driver getPreconfiguredNeo4jDriver() {
        String uri = "bolt://localhost:7687";  // using default uri
        String username = "neo4j";
        String password = "neo4j123"; // CHANGE AND HASH PASSWORD IN PROD

        return GraphDatabase.driver(
                uri,
                AuthTokens.basic(username, password)
        );
    }

    @Bean(name="UseDatabase")
    public SessionConfig getPreconfiguredNeo4jDatabaseSessionConfig() {
        String dbName = "neo4j"; // change this to an arbitrary existent database's name
        return SessionConfig.forDatabase(dbName);
    }

}
