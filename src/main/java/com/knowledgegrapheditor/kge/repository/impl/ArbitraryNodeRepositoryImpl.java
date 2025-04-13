package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.util.NodeSerializer;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public class ArbitraryNodeRepositoryImpl implements ArbitraryNodeRepository {

    private Driver driver;
    private SessionConfig databaseConfig;


    public ArbitraryNodeRepositoryImpl(Driver driver,
                                       @Qualifier("UseDatabase") SessionConfig config) {
        this.driver = driver;
        this.databaseConfig = config;
    }


    public Iterable<NodeDTO> findAll() {
        // todo test code (To be changed)
        try (Session session = driver.session(databaseConfig)) {

            String referencer = "n";

            String query = String.format("MATCH (%s:Person) RETURN %s", referencer, referencer);

            Result result = session.run(query);

            return result
                    .stream()
                    .map(record -> NodeSerializer.serialize(record, referencer))
                    .toList();
        }
    }


    @Override
    public NodeDTO findById(UUID id) {
        return null;
    }

    @Override
    public Iterable<NodeDTO> findAllByLabel(String label) {
        return List.of();
    }

    @Override
    public NodeDTO deleteById(UUID id) {
        return null;
    }

    @Override
    public NodeDTO create(String nodeLabel, Map<String, Object> parameters) {
        return null;
    }
}
