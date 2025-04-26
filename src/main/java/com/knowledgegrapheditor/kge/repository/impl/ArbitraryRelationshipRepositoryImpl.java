package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.util.RelationshipSerializer;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ArbitraryRelationshipRepositoryImpl implements ArbitraryRelationshipRepository {

    private final Driver driver;
    private final ArbitraryNodeRepository nodeRepository;
    private final SessionConfig sessionConfig;

    public ArbitraryRelationshipRepositoryImpl(Driver driver,
                                               ArbitraryNodeRepository nodeRepository,
                                               @Qualifier("UseDatabase") SessionConfig sessionConfig) {
        this.driver = driver;
        this.nodeRepository = nodeRepository;
        this.sessionConfig = sessionConfig;
    }


    @Override
    public Iterable<RelationshipDTO> findAll() {
        try (Session session = driver.session(sessionConfig)) {
            String referencer = "relationship";
            String query = String.format("MATCH (a)-[%s]->(b) RETURN %s;", referencer, referencer);

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
            String query = String.format("MATCH (a)-[%s]->(b) WHERE %s.id = $id RETURN %s", referencer, referencer, referencer);

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
                    .append(" {id: $id, sourceNodeId: $sourceNodeId, destinationNodeId: $destinationNodeId");

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
    public Optional<RelationshipDTO> modifyLabelOf(UUID sourceNodeId, UUID destinationNodeId, String newLabel) {
        try (Session session = driver.session(sessionConfig)) {
            // Find the existing relationship between source and destination nodes
            String query = "MATCH (a)-[r]->(b) WHERE a.id = $sourceNodeId AND b.id = $destinationNodeId " +
                    "CREATE (a)-[newRel:" + newLabel + "]->(b) DELETE r " +
                    "RETURN newRel";

            // Prepare query parameters
            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("sourceNodeId", sourceNodeId.toString());
            queryParameters.put("destinationNodeId", destinationNodeId.toString());

            // Execute the query
            Result result = session.run(query, queryParameters);

            // Return the modified relationship, or throw an error if not found
            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, "newRel"))
                    .findFirst();
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

            String query = "MATCH ()-[" + referencer + "]->() " +
                    "WHERE " + referencer + ".id = $relationshipId " +
                    "DELETE " + referencer;

            Map<String, Object> queryParameters = new HashMap<>();
            queryParameters.put("relationshipId", relationshipId.toString());

            session.run(query, queryParameters);
            return true;
        }
    }
}