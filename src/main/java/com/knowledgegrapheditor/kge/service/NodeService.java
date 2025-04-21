package com.knowledgegrapheditor.kge.service;

import com.knowledgegrapheditor.kge.model.NodeDTO;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface NodeService {
    Iterable<NodeDTO> findAllByLabel(String label);

    Optional<NodeDTO> findById(UUID id);

    boolean deleteById(UUID id);

    NodeDTO create(Iterable<String> nodeLabel, Map<String, Object> parameters);
}
