package com.knowledgegrapheditor.kge.service;
import com.knowledgegrapheditor.kge.model.RelationshipDTO;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface RelationshipService {

    Iterable<RelationshipDTO> findAll();
    Optional<RelationshipDTO> findById(UUID id);
    Optional<RelationshipDTO> findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId);
    RelationshipDTO create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> parameters);
    Optional<RelationshipDTO> modifyLabelOf(UUID sourceNodeId, UUID destinationNodeId, String newLabel);
    boolean deleteBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId);
    boolean deleteById(UUID relationshipId);
    Optional<RelationshipDTO> updateProperty(UUID startId, UUID endId, String key, Object value);
    Optional<RelationshipDTO> removeProperty(UUID startId, UUID endId, String key);

}
