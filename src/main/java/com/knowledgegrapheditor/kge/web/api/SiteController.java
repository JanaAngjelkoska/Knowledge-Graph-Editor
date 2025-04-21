package com.knowledgegrapheditor.kge.web.api;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpServerErrorException;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SiteController {

    // todo Test code (to be changed)
    private final ArbitraryNodeRepository nodeRepository;

    public SiteController(ArbitraryNodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }
//
//    @PostMapping("/create")
//    public ResponseEntity<NodeDTO> createNode(@RequestBody NodeDTO nodeDTO) {
//
//    }
//
//    @GetMapping("/findById")
//    public ResponseEntity<NodeDTO> searchNode(UUID id) {
//
//    }
}
