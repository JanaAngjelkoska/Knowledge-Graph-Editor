package com.knowledgegrapheditor.kge.repository;

import com.knowledgegrapheditor.kge.model.NodeDTO;

import java.util.Map;
import java.util.UUID;

public interface ArbitraryNodeRepository {
    Iterable<NodeDTO> findAllByLabel(String label);

    NodeDTO findById(UUID id);
    boolean deleteById(UUID id);
    NodeDTO create(String nodeLabel, Map<String, Object> parameters);
}
