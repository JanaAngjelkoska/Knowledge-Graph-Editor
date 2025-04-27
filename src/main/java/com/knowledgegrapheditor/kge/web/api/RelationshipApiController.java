package com.knowledgegrapheditor.kge.web.api;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import com.knowledgegrapheditor.kge.service.RelationshipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/relationships")
public class RelationshipApiController {

    private final RelationshipService relationshipService;

    public RelationshipApiController(RelationshipService relationshipService) {
        this.relationshipService = relationshipService;
    }


    @PostMapping("/create")
    public ResponseEntity<RelationshipDTO> createRelationship(@RequestBody RelationshipDTO request) {

        UUID sourceId = UUID.fromString(request.getStartNodeId());
        UUID destinationId = UUID.fromString(request.getDestinationNodeId());

        RelationshipDTO relationship = relationshipService.create(
                sourceId, // may me useless information
                destinationId, // may be useless information
                request.getRelationshipType(),
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
}