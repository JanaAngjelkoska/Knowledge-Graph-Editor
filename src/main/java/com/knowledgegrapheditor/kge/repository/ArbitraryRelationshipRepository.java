package com.knowledgegrapheditor.kge.repository;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import org.neo4j.driver.Record;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ArbitraryRelationshipRepository {

    Iterable<RelationshipDTO> findAll();
    RelationshipDTO findById(UUID id);
    RelationshipDTO findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId);
    RelationshipDTO create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> parameters);
    RelationshipDTO modifyLabelOf(UUID sourceNodeId, UUID destinationNodeId, String newLabel);
    boolean deleteBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId);
}
