package com.knowledgegrapheditor.kge.web;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.repository.ArbitraryNodeRepository;
import com.knowledgegrapheditor.kge.repository.ArbitraryRelationshipRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/relationships")
public class RelationshipApiController {

    private final ArbitraryRelationshipRepository relationshipRepository;
    private final ArbitraryNodeRepository nodeRepository;

    public RelationshipApiController(ArbitraryRelationshipRepository relationshipRepository, ArbitraryNodeRepository nodeRepository) {
        this.relationshipRepository = relationshipRepository;
        this.nodeRepository = nodeRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<RelationshipDTO> createRelationship(@RequestBody RelationshipDTO request) {

        UUID sourceId = UUID.fromString(request.getStartNodeElementId());
        UUID destinationId = UUID.fromString(request.getStartNodeElementId());

        RelationshipDTO relationship = relationshipRepository.create(
                sourceId, // may me useless information
                destinationId, // may be useless information
                request.getRelationshipType(),
                request.getProperties()
        );

        return new ResponseEntity<>(relationship, HttpStatus.CREATED);
    }

    @GetMapping("/search/{relationshipId}")
    public ResponseEntity<RelationshipDTO> searchRelationshipById(@PathVariable UUID relationshipId) {

        Optional<RelationshipDTO> find = relationshipRepository.findById(relationshipId);

        return find.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/search")
    public ResponseEntity<RelationshipDTO> searchRelationshipSrcDest(@RequestParam UUID sourceNodeId,
                                                                     @RequestParam UUID destinationNodeId) {

        Optional<RelationshipDTO> find = relationshipRepository.findBySourceAndDestinationNodeId(sourceNodeId, destinationNodeId);

        return find.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/delete")
    public ResponseEntity<Boolean> removeRelationshipSrcDest(@RequestParam UUID sourceNodeId,
                                                             @RequestParam UUID destinationNodeId) {

        try {
            boolean relationship = relationshipRepository.deleteBySourceAndDestinationNodeId(
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
            boolean relationship = relationshipRepository.deleteById(
                    relationshipId
            );
            return ResponseEntity.ok(relationship);
        } catch (IllegalArgumentException exc) {
            System.err.println(exc.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }
}