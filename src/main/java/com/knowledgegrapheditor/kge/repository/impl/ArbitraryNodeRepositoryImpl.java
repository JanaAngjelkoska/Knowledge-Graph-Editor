package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.util.NodeSerializer;
import org.neo4j.driver.Record;
import org.neo4j.driver.*;
import org.neo4j.driver.exceptions.Neo4jException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
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
    public Optional<NodeDTO> findById(UUID id) {
        try (Session session = driver.session(databaseConfig)) {

            String referencer = "n";

            String queryBuild = String.format("MATCH (%s {id: \"%s\"}) RETURN %s;", referencer, id, referencer);

            Result result = session.run(queryBuild);

            Optional<Record> r = result.stream().findFirst();

            return r.map(record -> NodeSerializer.serialize(record, referencer));
        }
    }

    @Override
    public Iterable<NodeDTO> findAll() {
        String referencer = "n";

        String query = String.format("MATCH (%s) RETURN %s", referencer, referencer);

        try (Session session = driver.session(databaseConfig)) {

            Result result = session.run(query);

            return result
                    .stream()
                    .map(record -> NodeSerializer.serialize(record, referencer))
                    .toList();
        }
    }

    @Override
    public Iterable<NodeDTO> findAllMatchingName(String name) {
        try (Session session = driver.session(databaseConfig)) {
            String referencer = "n";

            String queryBuild = String.format(
                    "MATCH (%s) WHERE toLower(%s.displayName) CONTAINS toLower($name) RETURN %s",
                    referencer, referencer, referencer);

            Result result = session.run(queryBuild, Collections.singletonMap("name", name));

            return result.stream()
                    .map(record -> NodeSerializer.serialize(record, referencer))
                    .toList();
        }
    }

    @Override
    public boolean deleteById(UUID id) {

        if (findById(id).isEmpty()) {
            throw new IllegalArgumentException(String.format("Node with ID: %s does not exist", id));
        }

        try (Session session = driver.session(databaseConfig)) {

            String referencer = "n";

            String queryBuild = String.format("MATCH (%s {id: \"%s\"})\n DETACH DELETE %s;", referencer, id, referencer);

            session.run(queryBuild);

            return true;
        }
    }

    @Override
    public NodeDTO create(Iterable<String> labels, Map<String, Object> parameters) {

        String referencer = "n";
        StringBuilder labelConcat = new StringBuilder();


        for (String label : labels) {
            labelConcat.append(":").append(label);
        }

        StringBuilder queryBuild = new StringBuilder(String.format("CREATE (%s%s {", referencer, labelConcat));

        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            queryBuild.append(String.format("%s:\"%s\", ", entry.getKey(), entry.getValue().toString()));
        }

        queryBuild.append(String.format("id:\"%s\"})", UUID.randomUUID()));

        queryBuild.append(String.format(" RETURN %s;", referencer));

        try (Session session = driver.session(databaseConfig)) {

            Result result = session.run(queryBuild.toString());

            Record r = result.stream().findFirst().orElseThrow(() -> new Neo4jException("Failure creating record."));

            return NodeSerializer.serialize(r, referencer);
        }

    }

    @Override
    public Optional<NodeDTO> updateProperties(UUID _id, String key, Object value) {
        if (findById(_id).isEmpty()) {
            throw new IllegalArgumentException(String.format("Node with ID: %s does not exist", _id));
        }
        String id = _id.toString();
        String referencer = "n";
        String query = String.format(
                "MATCH (%s {id: $id}) SET %s.%s = $value RETURN %s;",
                referencer, referencer, key, referencer
        );

        try (Session session = driver.session(databaseConfig)) {

            Result result = session.run(query,
                    Values.parameters("id", id, "value", value)
            );

            return result.stream()
                    .map(record -> NodeSerializer.serialize(record, referencer))
                    .findFirst();
        }
    }

    @Override
    public Optional<NodeDTO> deleteProperty(UUID _id, String key) {
        if (findById(_id).isEmpty()) {
            throw new IllegalArgumentException(String.format("Node with ID: %s does not exist", _id));
        }
        String id = _id.toString();
        String referencer = "n";
        String query = String.format(
                "MATCH (%s {id: $id}) REMOVE %s.%s RETURN %s;",
                referencer, referencer, key, referencer
        );
        try (Session session = driver.session(databaseConfig)) {
            Result result = session.run(query, Values.parameters("id", id));
            return result.stream()
                    .map(record -> NodeSerializer.serialize(record, referencer))
                    .findFirst();
        }
    }
}
