package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.util.NodeSerializer;
import org.neo4j.driver.Record;
import org.neo4j.driver.*;
import org.neo4j.driver.exceptions.Neo4jException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.UUID;

@Repository
public class ArbitraryNodeRepositoryImpl implements ArbitraryNodeRepository {

    private final Driver driver;
    private final SessionConfig databaseConfig;


    public ArbitraryNodeRepositoryImpl(Driver driver,
                                       @Qualifier("UseDatabase") SessionConfig config) {
        this.driver = driver;
        this.databaseConfig = config;
    }

    @Override
    public NodeDTO findById(UUID id) {
        try(Session session = driver.session(databaseConfig)) {

            String referencer = "n";

            String queryBuild = String.format("MATCH (%s {id: \"%s\"}) RETURN %s;", referencer, id, referencer);

            Result result = session.run(queryBuild);

            Record r = result.stream().findFirst().orElseThrow(() -> new Neo4jException("Record non-existent."));

            return NodeSerializer.serialize(r, referencer);
        }
    }

    @Override
    public Iterable<NodeDTO> findAllByLabel(String label) {
        String referencer = "n";

        String query = String.format("MATCH (%s:%s) RETURN %s", referencer, label, referencer);

        try (Session session = driver.session(databaseConfig)) {

            Result result = session.run(query);

            return result
                    .stream()
                    .map(record -> NodeSerializer.serialize(record, referencer))
                    .toList();
        }
    }

    @Override
    public boolean deleteById(UUID id) {
        try(Session session = driver.session(databaseConfig)) {

            String referencer = "n";

            String queryBuild = String.format("MATCH (%s {id: \"%s\"})\n DETACH DELETE %s;", referencer, id, referencer);

            session.run(queryBuild);

            return true;
        }
    }

    @Override
    public NodeDTO create(String nodeLabel, Map<String, Object> parameters) {

        String referencer = "n";

        StringBuilder queryBuild = new StringBuilder(String.format("CREATE (%s:%s {", referencer, nodeLabel));

        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            queryBuild.append(String.format("%s:\"%s\", ", entry.getKey(), entry.getValue().toString()));
        }

        queryBuild.append(String.format("id:\"%s\"})", UUID.randomUUID()));

        queryBuild.append(String.format(" RETURN %s;", referencer));

        try(Session session = driver.session(databaseConfig)) {

            Result result = session.run(queryBuild.toString());

            Record r = result.stream().findFirst().orElseThrow(() -> new Neo4jException("Record non-existent."));

            return NodeSerializer.serialize(r, referencer);
        }

    }
}
