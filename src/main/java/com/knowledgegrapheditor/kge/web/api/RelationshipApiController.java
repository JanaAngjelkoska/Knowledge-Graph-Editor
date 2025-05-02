package com.knowledgegrapheditor.kge.web.api;

import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import com.knowledgegrapheditor.kge.service.RelationshipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Reader;
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

    @PatchMapping("/edit/{startId}/{endId}")
    public ResponseEntity<List<RelationshipDTO>> editProperties(@PathVariable("startId") UUID startNodeId,
                                                                @PathVariable("endId") UUID endNodeId,
                                                                @RequestBody Map<String, Object> request) {
        List<RelationshipDTO> list = new ArrayList<>();
        for (Map.Entry<String, Object> entry : request.entrySet()) {
            Optional<RelationshipDTO> relationship = relationshipService.updateProperty(startNodeId, endNodeId, entry.getKey(), entry.getValue());
            list.add(relationship.get());
        }

        return ResponseEntity.ok(list);
    }

    @PatchMapping("/edit/{relationshipId}")
    public ResponseEntity<RelationshipDTO> editProperties(@PathVariable UUID relationshipId,
                                                          @RequestBody Map<String, Object> request) {

        Optional<RelationshipDTO> relationship = Optional.empty();
        for (Map.Entry<String, Object> entry : request.entrySet()) {
            relationship = relationshipService.updateProperty(relationshipId, entry.getKey(), entry.getValue());
        }

        return relationship.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete-property/{startId}/{endId}/{propertyKey}")
    public ResponseEntity<Void> deleteProperty(@PathVariable UUID startId,
                                               @PathVariable UUID endId,
                                               @PathVariable String propertyKey) {
        Optional<RelationshipDTO> result = relationshipService.removeProperty(startId, endId, propertyKey);
        return result.isPresent() ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete-property/{relationshipId}/{propertyKey}")
    public ResponseEntity<Void> deleteProperty(@PathVariable UUID relationshipId,
                                         @PathVariable String propertyKey) {
        Optional<RelationshipDTO> result = relationshipService.removeProperty(relationshipId, propertyKey);

        return result.isPresent() ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

}

