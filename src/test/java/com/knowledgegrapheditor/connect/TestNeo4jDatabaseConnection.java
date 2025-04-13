package com.knowledgegrapheditor.connect;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.*;

class TestNeo4jDatabaseConnection {

    private String uri     ;
    private String username;
    private String password;
    private String database;

    @BeforeEach
    public void setup() {
        this.uri        = "bolt://localhost:7687";
        this.username   = "neo4j";
        this.password   = "neo4j123";
        this.database   = "knowledgegrapheditor";
    }

    @Test
    void testNeo4jConnection() {
        try (Driver driver = GraphDatabase.driver(this.uri, AuthTokens.basic(this.username, this.password))) {
            Assertions.assertNotNull(driver);
            try (Session session = driver.session(SessionConfig.forDatabase(this.database))) {
                Assertions.assertNotNull(session);
                String result = session.run("RETURN 'Connection successful' AS message")
                        .single()
                        .get("message")
                        .asString();
                Assertions.assertEquals("Connection successful", result);
                System.out.printf("Neo4j Connection to database: %s Succeeded!%n", this.database);
            } catch (Exception e) {
                Assertions.fail("Failed to execute query: " + e.getMessage());
            }
        } catch (Exception e) {
            Assertions.fail("Failed to connect to Neo4j: " + e.getMessage());
        }
    }
}
