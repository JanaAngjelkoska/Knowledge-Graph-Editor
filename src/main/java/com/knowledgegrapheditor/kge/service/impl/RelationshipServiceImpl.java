package com.knowledgegrapheditor.kge.service.impl;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.service.RelationshipService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class RelationshipServiceImpl implements RelationshipService {

    private final ArbitraryRelationshipRepository relationshipRepository;

    public RelationshipServiceImpl(ArbitraryRelationshipRepository relationshipRepository) {
        this.relationshipRepository = relationshipRepository;
    }

    @Override
    public Iterable<RelationshipDTO> findAll() {
        return relationshipRepository.findAll();
    }

    @Override
    public Optional<RelationshipDTO> findById(UUID id) {
        return relationshipRepository.findById(id);
    }

    @Override
    public Optional<RelationshipDTO> findBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId) {
        return relationshipRepository.findBySourceAndDestinationNodeId(sourceId, destinationId);
    }

    @Override
    public RelationshipDTO create(UUID sourceNodeId, UUID destinationNodeId, String relationshipLabel, Map<String, Object> parameters) {
        return relationshipRepository.create(sourceNodeId, destinationNodeId, relationshipLabel, parameters);
    }

    @Override
    public Optional<RelationshipDTO> modifyLabelOf(UUID sourceNodeId, UUID destinationNodeId, String newLabel) {
        return relationshipRepository.modifyLabelOf(sourceNodeId, destinationNodeId, newLabel);
    }

    @Override
    public boolean deleteBySourceAndDestinationNodeId(UUID sourceId, UUID destinationId) {
        return relationshipRepository.deleteBySourceAndDestinationNodeId(sourceId, destinationId);
    }

    @Override
    public boolean deleteById(UUID relationshipId) {
        return relationshipRepository.deleteById(relationshipId);
    }

    @Override
    public Optional<RelationshipDTO> updateProperty(UUID startId, UUID endId, String key, Object value) {
        return relationshipRepository.editProperty(startId, endId, key, value);
    }

    @Override
    public Optional<RelationshipDTO> removeProperty(UUID startId, UUID endId, String key) {
        return relationshipRepository.deleteProperty(startId, endId, key);
    }


}
