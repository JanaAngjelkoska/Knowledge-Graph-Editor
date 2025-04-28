package com.knowledgegrapheditor.kge.util;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.springframework.stereotype.Component;


@Component
public class DbConnectionStatus {

    private final Driver driver;
    private final SessionConfig sessionConfig;

    public DbConnectionStatus(Driver driver, SessionConfig sessionConfig) {
        this.driver = driver;
        this.sessionConfig = sessionConfig;
    }

    public boolean connectionStatus() {
        try (Session session = driver.session(sessionConfig)) {
            session.run("RETURN 1");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public SessionConfig getSessionConfig() {
        return sessionConfig;
    }
}
