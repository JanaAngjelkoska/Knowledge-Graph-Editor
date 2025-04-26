package com.knowledgegrapheditor.kge.service.impl;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.service.RelationshipService;

public class RelationshipServiceImpl implements RelationshipService {

    private final ArbitraryRelationshipRepository relationshipRepository;

    public RelationshipServiceImpl(ArbitraryRelationshipRepository relationshipRepository) {
        this.relationshipRepository = relationshipRepository;
    }

    @Override
    public Iterable<RelationshipDTO> findAll() {
        return relationshipRepository.findAll();
    }
}
