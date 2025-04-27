package com.knowledgegrapheditor.kge.repository;

import com.knowledgegrapheditor.kge.model.NodeDTO;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface ArbitraryNodeRepository {
    Iterable<NodeDTO> findAllByLabel(String label);
    Iterable<NodeDTO> findAll();
    Optional<NodeDTO> findById(UUID id);
    boolean deleteById(UUID id);
    NodeDTO create(Iterable<String> nodeLabel, Map<String, Object> parameters);
    Optional<NodeDTO> updateProperties(UUID id, String key, Object value);

    Optional<NodeDTO> deleteProperty(UUID _id, String key);
}
