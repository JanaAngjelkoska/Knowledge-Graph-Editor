package com.kgt.kgddl.util;

import org.junit.Test;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.Session;

import static org.junit.Assert.*;

public class TestNeo4jDatabaseConnection {


    private static final String URI = "bolt://localhost:7687";
    private static final String USERNAME = "neo4j";
    private static final String PASSWORD = "neo4j123";

    @Test
    public void testNeo4jConnection() {
        try (Driver driver = GraphDatabase.driver(URI, AuthTokens.basic(USERNAME, PASSWORD))) {
            assertNotNull(driver);
            try (Session session = driver.session()) {
                assertNotNull(session);
                String result = session.run("RETURN 'Connection successful' AS message")
                        .single()
                        .get("message")
                        .asString();
                assertEquals("Connection successful", result);
                System.out.println("Neo4j Connection Succeeded!");
            } catch (Exception e) {
                fail("Failed to execute query: " + e.getMessage());
            }
        } catch (Exception e) {
            fail("Failed to connect to Neo4j: " + e.getMessage());
        }
    }

}
