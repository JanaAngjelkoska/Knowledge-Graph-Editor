package com.knowledgegrapheditor.kge.repository;

import com.knowledgegrapheditor.kge.model.NodeDTO;

import java.util.Map;
import java.util.UUID;

public interface ArbitraryNodeRepository {
    Iterable<NodeDTO> findAll();
    Iterable<NodeDTO> findAllByLabel(String label);

    NodeDTO findById(UUID id);
    NodeDTO deleteById(UUID id);
    NodeDTO create(String nodeLabel, Map<String, Object> parameters);
}
