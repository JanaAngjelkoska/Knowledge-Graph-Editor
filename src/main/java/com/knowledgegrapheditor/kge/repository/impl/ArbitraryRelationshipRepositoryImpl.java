package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.util.RelationshipSerializer;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ArbitraryRelationshipRepositoryImpl implements ArbitraryRelationshipRepository {

    private Driver driver;

    public ArbitraryRelationshipRepositoryImpl(Driver driver) {
        this.driver = driver;
    }


    @Override
    public Iterable<RelationshipDTO> findAll() {
        try (Session session = driver.session()) {
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
    public RelationshipDTO findById(UUID id) {
        try (Session session = driver.session()) {
            String referencer = "relationship";
            String query = "MATCH (" + referencer + ":Relationship) WHERE " + referencer + ".id = $id RETURN " + referencer;
            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("id", id.toString());

            Result result = session.run(query, queryParameters);
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Relationship not found"));
        }
    }

    @Override
    public RelationshipDTO findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId) {
        try (Session session = driver.session()) {
            String referencer = "relationship";
            String query = "MATCH (" + referencer + ":Relationship) WHERE " + referencer + ".startNodeId = $sourceNodeId AND " + referencer + ".endNodeId = $destinationNodeId RETURN " + referencer;

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("sourceNodeId", sourceId.toString());
            queryParameters.put("destinationNodeId", destinationId.toString());

            Result result = session.run(query, queryParameters);
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Relationship not found"));
        }
    }

    @Override
    public RelationshipDTO create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> parameters) {
        try (Session session = driver.session()) {
            String referencer = "relationship";
            String query = "CREATE (" + referencer + ":Relationship {startNodeId: $sourceNodeId, endNodeId: $destinationNodeId, relationshipType: $relationshipLabel, properties: $parameters})";

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("sourceNodeId", sourceNodeId.toString());
            queryParameters.put("destinationNodeId", destinationNodeId.toString());
            queryParameters.put("relationshipLabel", relationshipLabel);
            queryParameters.put("parameters", parameters);

            Result result = session.run(query, queryParameters);
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Failed to create relationship"));
        }
    }

    @Override
    public RelationshipDTO modifyLabelOf(UUID sourceNodeId, UUID destinationNodeId, String newLabel) {
        try (Session session = driver.session()) {
            String referencer = "relationship";
            String query = "MATCH (" + referencer + ":Relationship) " +
                    "WHERE " + referencer + ".startNodeId = $sourceNodeId AND " + referencer + ".endNodeId = $destinationNodeId " +
                    "SET " + referencer + ".relationshipType = $relationshipType " +
                    "RETURN " + referencer;

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("sourceNodeId", sourceNodeId.toString());
            queryParameters.put("destinationNodeId", destinationNodeId.toString());
            queryParameters.put("relationshipType", newLabel);

            Result result = session.run(query, queryParameters);
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Failed to modify relationship label"));
        }
    }



}
