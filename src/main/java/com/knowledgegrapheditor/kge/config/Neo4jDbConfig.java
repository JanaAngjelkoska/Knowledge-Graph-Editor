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
        String uri = "bolt://localhost:7687";
        String username = "neo4j";
        String password = "neo4j123";

        return GraphDatabase.driver(
                uri,
                AuthTokens.basic(username, password)
        );
    }

    @Bean(name="UseDatabase")
    public SessionConfig getPreconfiguredNeo4jDatabaseSessionConfig() {
        String dbName = "knowledgegrapheditor"; // change this to an arbitrary existent database's name in the active Neo4j DBMS
        return SessionConfig.forDatabase(dbName);
    }

}
