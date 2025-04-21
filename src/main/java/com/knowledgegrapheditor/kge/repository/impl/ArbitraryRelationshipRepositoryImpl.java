package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.util.RelationshipSerializer;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.neo4j.driver.exceptions.Neo4jException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ArbitraryRelationshipRepositoryImpl implements ArbitraryRelationshipRepository {

    private final Driver driver;
    private final SessionConfig sessionConfig;

    public ArbitraryRelationshipRepositoryImpl(Driver driver,
                                               @Qualifier("UseDatabase") SessionConfig sessionConfig) {
        this.driver = driver;
        this.sessionConfig = sessionConfig;
    }


    @Override
    public Iterable<RelationshipDTO> findAll() {
        try (Session session = driver.session(sessionConfig)) {
            String referencer = "relationship";
            String query = "MATCH (" + referencer + ":Relationship) RETURN " + referencer;

            Result result = session.run(query);

            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .toList();
        }
    }


    @Override
    public Optional<RelationshipDTO> findById(UUID id) {
        try (Session session = driver.session(sessionConfig)) {
            String referencer = "relationship";
            String query = String.format("MATCH ()-[%s]->() WHERE %s.id = $id RETURN %s", referencer, referencer, referencer);

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("id", id.toString());

            Result result = session.run(query, queryParameters);
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst();
        }
    }


    @Override
    public Optional<RelationshipDTO> findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId) {
        try (Session session = driver.session(sessionConfig)) {
            String referencer = "relationship";
            String query =
                    String.format("MATCH (a)-[%s]->(b) WHERE a.id = $sourceNodeId AND b.id = $destinationNodeId RETURN %s;", referencer, referencer);

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("sourceNodeId", sourceId.toString());
            queryParameters.put("destinationNodeId", destinationId.toString());

            Result result = session.run(query, queryParameters);
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst();
        }
    }


    @Override
    public RelationshipDTO create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> properties) {
        try (Session session = driver.session(sessionConfig)) {
            String referencer = "rel";
            StringBuilder queryBuild = new StringBuilder();
            queryBuild.append("MATCH (a), (b) ")
                    .append("WHERE a.id = $sourceNodeId AND b.id = $destinationNodeId ")
                    .append("CREATE (a)-[")
                    .append(referencer)
                    .append(":")
                    .append(relationshipLabel)
                    .append(" {id: $id");

            for (Map.Entry<String, Object> entry : properties.entrySet()) {
                queryBuild.append(", ").append(entry.getKey()).append(": $").append(entry.getKey());
            }

            queryBuild.append("}]->(b) RETURN ").append(referencer);

            Map<String, Object> queryParameters = new HashMap<>(properties);
            queryParameters.put("sourceNodeId", sourceNodeId.toString());
            queryParameters.put("destinationNodeId", destinationNodeId.toString());
            queryParameters.put("id", UUID.randomUUID().toString());


            Result result = session.run(queryBuild.toString(), queryParameters);

            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Failed to create relationship"));
        }
    }


    @Override
    public RelationshipDTO modifyLabelOf(UUID sourceNodeId, UUID destinationNodeId, String newLabel) {
        try (Session session = driver.session(sessionConfig)) {
            String referencer = "relationship";
            StringBuilder queryBuild = new StringBuilder("MATCH (" + referencer + ":Relationship) WHERE " + referencer +
                    ".startNodeId = $sourceNodeId AND " + referencer + ".endNodeId = $destinationNodeId SET " + referencer +
                    ".relationshipType = $relationshipType RETURN " + referencer);

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("sourceNodeId", sourceNodeId.toString());
            queryParameters.put("destinationNodeId", destinationNodeId.toString());
            queryParameters.put("relationshipType", newLabel);

            Result result = session.run(queryBuild.toString(), queryParameters);
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Failed to modify relationship label"));
        }
    }

    @Override
    public boolean deleteBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId) {

        if (findBySourceAndDestinationNodeId(sourceId, destinationId).isEmpty()) {
            throw new IllegalArgumentException(String.format("Relationship connecting node with ID: %s to node with ID: %s does not exist.", sourceId, destinationId));
        }

        try (Session session = driver.session(sessionConfig)) {
            String referencer = "rel";

            String query = "MATCH (a)-[" + referencer + "]->(b) " +
                    "WHERE a.id = $sourceNodeId AND b.id = $destinationNodeId " +
                    "DELETE " + referencer;

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("sourceNodeId", sourceId.toString());
            queryParameters.put("destinationNodeId", destinationId.toString());

            session.run(query, queryParameters);
            return true;
        }
    }

    @Override
    public boolean deleteById(UUID relationshipId) {

        if (findById(relationshipId).isEmpty()) {
            throw new IllegalArgumentException(String.format("Relationship with ID: %s does not exist.", relationshipId));
        }

        try (Session session = driver.session(sessionConfig)) {
            String referencer = "rel";
            StringBuilder queryBuild = new StringBuilder();

            queryBuild.append("MATCH ()-[").append(referencer).append("]->() ")
                    .append("WHERE ").append(referencer).append(".id = $relationshipId ")
                    .append("DELETE ").append(referencer);

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("relationshipId", relationshipId.toString());

            session.run(queryBuild.toString(), queryParameters);
            return true;
        }
    }
}