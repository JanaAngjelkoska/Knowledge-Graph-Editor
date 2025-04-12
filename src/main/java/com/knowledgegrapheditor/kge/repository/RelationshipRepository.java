package com.knowledgegrapheditor.kge.repository;

import org.neo4j.driver.Record;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface RelationshipRepository {

    List<Record> findAll();
    Record findById(UUID id);
    Record findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId);
    Record create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> parameters);
    Record modifyParameterOf(UUID nodeId, String property, Object updatedValue);
}
