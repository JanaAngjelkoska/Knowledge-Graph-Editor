package com.knowledgegrapheditor.kge.web.api;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.service.RelationshipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/relationships")
public class RelationshipApiController {

    private final RelationshipService relationshipService;

    public RelationshipApiController(RelationshipService relationshipService) {
        this.relationshipService = relationshipService;
    }


    @PostMapping("/create/{startNodeId}/{endNodeId}")
    public ResponseEntity<RelationshipDTO> createRelationship(
            @PathVariable UUID startNodeId,
            @PathVariable UUID endNodeId,
            @RequestBody RelationshipDTO request) {

        RelationshipDTO relationship = relationshipService.create(
                startNodeId,
                endNodeId,
                request.getRelationshipType(),  // use the request's relationship type
                request.getProperties()
        );

        return new ResponseEntity<>(relationship, HttpStatus.CREATED);
    }


    @GetMapping("/search/{relationshipId}")
    public ResponseEntity<RelationshipDTO> searchRelationshipById(@PathVariable UUID relationshipId) {

        Optional<RelationshipDTO> find = relationshipService.findById(relationshipId);

        return find.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/search")
    public ResponseEntity<RelationshipDTO> searchRelationshipSrcDest(@RequestParam UUID sourceNodeId,
                                                                     @RequestParam UUID destinationNodeId) {

        Optional<RelationshipDTO> find = relationshipService.findBySourceAndDestinationNodeId(sourceNodeId, destinationNodeId);

        return find.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/delete")
    public ResponseEntity<Boolean> removeRelationshipSrcDest(@RequestParam UUID sourceNodeId,
                                                             @RequestParam UUID destinationNodeId) {

        try {
            boolean relationship = relationshipService.deleteBySourceAndDestinationNodeId(
                    sourceNodeId,
                    destinationNodeId
            );
            return ResponseEntity.ok(relationship);
        } catch (IllegalArgumentException exc) {
            System.err.println(exc.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    @PostMapping("/delete/{relationshipId}")
    public ResponseEntity<Boolean> removeRelationshipById(@PathVariable UUID relationshipId) {

        try {
            boolean relationship = relationshipService.deleteById(
                    relationshipId
            );
            return ResponseEntity.ok(relationship);
        } catch (IllegalArgumentException exc) {
            System.err.println(exc.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    @GetMapping
    public ResponseEntity<Iterable<RelationshipDTO>> findAll() {
        return ResponseEntity.ok(relationshipService.findAll());
    }

//    @PatchMapping("/edit/{id}")
//    public ResponseEntity<List<NodeDTO>> editNode(@PathVariable("id") UUID id, @RequestBody Map<String, Object> request) {
//        List<NodeDTO> list = new ArrayList<>();
//
//        System.out.println(request.toString()); // debug
//
//        for (Map.Entry<String, Object> entry : request.entrySet()) {
//            Optional<NodeDTO> node = relationshipService.modifyLabelOf(id, entry.getKey(), entry.getValue());
//            list.add(node.get());
//        }
//
//        return ResponseEntity.ok(list);
//    }
}

