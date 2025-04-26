package com.knowledgegrapheditor.kge.service.impl;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.service.NodeService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class NodeServiceImpl implements NodeService {

    private final ArbitraryNodeRepository nodeRepository;

    public NodeServiceImpl(ArbitraryNodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    @Override
    public Iterable<NodeDTO> findAllByLabel(String label) {
        return nodeRepository.findAllByLabel(label);
    }

    @Override
    public Iterable<NodeDTO> findAll() {
        return nodeRepository.findAll();
    }

    @Override
    public Optional<NodeDTO> findById(UUID id) {
        return nodeRepository.findById(id);
    }

    @Override
    public boolean deleteById(UUID id) {
        return nodeRepository.deleteById(id);
    }

    @Override
    public NodeDTO create(Iterable<String> nodeLabels, Map<String, Object> parameters) {
        return nodeRepository.create(nodeLabels, parameters);
    }

    @Override
    public Optional<NodeDTO> editProperty(UUID id, String propertyKey, Object propertyValue) {
        return nodeRepository.updateProperties(id, propertyKey, propertyValue);
    }



}
