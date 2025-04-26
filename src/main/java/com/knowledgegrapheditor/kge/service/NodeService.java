package com.knowledgegrapheditor.kge.service;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import org.w3c.dom.Node;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface NodeService {
    Iterable<NodeDTO> findAllByLabel(String label);

    Iterable<NodeDTO> findAll();

    Optional<NodeDTO> findById(UUID id);

    boolean deleteById(UUID id);

    NodeDTO create(Iterable<String> nodeLabel, Map<String, Object> parameters);

    Optional<NodeDTO> editProperty(UUID id, String propertyKey, Object propertyValue);
}
