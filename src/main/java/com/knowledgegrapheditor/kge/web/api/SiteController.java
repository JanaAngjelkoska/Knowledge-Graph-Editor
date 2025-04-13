package com.knowledgegrapheditor.kge.web.api;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SiteController {

    // todo Test code (to be changed)
    private final ArbitraryNodeRepository nodeRepository;

    public SiteController(ArbitraryNodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    @GetMapping("/list")
    public ResponseEntity<Iterable<NodeDTO>> list() {
        return ResponseEntity.ok(nodeRepository.findAll());
    }
}
