package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.util.NodeSerializer;
import com.knowledgegrapheditor.kge.util.RelationshipSerializer;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ArbitraryRelationshipRepositoryImpl implements ArbitraryRelationshipRepository {

    private Driver driver;

    public ArbitraryRelationshipRepositoryImpl(Driver driver) {
        this.driver = driver;
    }


    @Override
    public Iterable<RelationshipDTO> findAll() {
        try(Session session = driver.session()) {
            String referencer = "n";

            String query = String.format("MATCH (%s:Person) RETURN %s", referencer, referencer);

            Result result = session.run(query);

            return result
                    .stream()
                    .map(record -> RelationshipSerializer.serialize(record, referencer))
                    .toList();
        }
    }

    @Override
    public RelationshipDTO findById(UUID id) {
        return null;
    }

    @Override
    public RelationshipDTO findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId) {
        return null;
    }

    @Override
    public RelationshipDTO create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> parameters) {
        return null;
    }

    @Override
    public RelationshipDTO modifyParameterOf(UUID nodeId, String property, Object updatedValue) {
        return null;
    }


}
