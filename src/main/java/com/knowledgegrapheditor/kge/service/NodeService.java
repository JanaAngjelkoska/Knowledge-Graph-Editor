package com.knowledgegrapheditor.kge.service;

import com.knowledgegrapheditor.kge.model.NodeDTO;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface NodeService {
    Iterable<NodeDTO> findAll();

    Optional<NodeDTO> findById(UUID id);

    boolean deleteById(UUID id);

    NodeDTO create(Iterable<String> nodeLabel, Map<String, Object> parameters);

    Optional<NodeDTO> editProperty(UUID id, String propertyKey, Object propertyValue);

    Optional<NodeDTO> deleteProperty(UUID id, String propertyKey);
}
