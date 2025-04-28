package com.knowledgegrapheditor.kge.repository;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface ArbitraryRelationshipRepository {

    Iterable<RelationshipDTO> findAll();
    Optional<RelationshipDTO> findById(UUID id);
    Optional<RelationshipDTO> findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId);
    RelationshipDTO create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> parameters);
    Optional<RelationshipDTO> modifyLabelOf(UUID sourceNodeId, UUID destinationNodeId, String newLabel);
    boolean deleteBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId);
    boolean deleteById(UUID relationshipId);
    Optional<RelationshipDTO> editProperty(UUID startId, UUID endId, String key, Object updatedValue);
    Optional<RelationshipDTO> deleteProperty(UUID startId, UUID endId, String key);


}
