package com.knowledgegrapheditor.kge.web.api;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.service.NodeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/nodes")
public class NodeApiController {

    private final NodeService nodeService;

    public NodeApiController(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @PostMapping("/create")
    public ResponseEntity<NodeDTO> createNode(@RequestBody NodeDTO nodeDTO) {
        NodeDTO retVal = nodeService.create(nodeDTO.getLabels(), nodeDTO.getProperties());

        return new ResponseEntity<>(retVal, HttpStatus.CREATED);
    }

    @PostMapping("/delete/{id}")
    public ResponseEntity<Boolean> deleteNode(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(nodeService.deleteById(id));
        } catch (IllegalArgumentException exception) {
            System.err.println(exception.getMessage());
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search/{id}")
    public ResponseEntity<NodeDTO> searchNode(@PathVariable UUID id) {
        Optional<NodeDTO> node = nodeService.findById(id);

        return node.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/edit/{id}")
    public ResponseEntity<List<NodeDTO>> editNode(@PathVariable("id") UUID id, @RequestBody Map<String, Object> request) {
        List<NodeDTO> list = new ArrayList<>();

        System.out.println(request.toString()); // debug

        for (Map.Entry<String, Object> entry : request.entrySet()) {
            Optional<NodeDTO> node = nodeService.editProperty(id, entry.getKey(), entry.getValue());
            list.add(node.get());
        }

        return ResponseEntity.ok(list);
    }

    @GetMapping
    public ResponseEntity<Iterable<NodeDTO>> getAllNodes() {
        return ResponseEntity.ok(nodeService.findAll());
    }

    @GetMapping("/filtering/{name}")
    public ResponseEntity<Iterable<NodeDTO>> getAllNodesMatchingName(@PathVariable String name) {
        return ResponseEntity.ok(nodeService.findAllMatchingName(name));
    }

    @GetMapping("/filteringByRel/{name}")
    public ResponseEntity<Iterable<NodeDTO>> getAllNodesParticipatingInRelWithName(@PathVariable String name) {
        return ResponseEntity.ok(nodeService.findAllParticipatingInRelWithName(name));
    }

    @RequestMapping(value = "/delete-property/{id}/{propertyKey}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteProperty(@PathVariable UUID id, @PathVariable String propertyKey) {
        Optional<NodeDTO> result = nodeService.deleteProperty(id, propertyKey);
        return result.isPresent() ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }


    @GetMapping("/dropdown")
    public List<Map<String, String>> getAllNodeDropdownOptions() {
        Iterable<NodeDTO> nodes = nodeService.findAll();
        System.out.println("Called");
        System.out.println(nodes);
        return StreamSupport.stream(nodes.spliterator(), false)
                .sorted(Comparator.comparing(node -> {
                    Iterator<String> it = node.getLabels().iterator();
                    return it.hasNext() ? it.next() : "";
                }))
                .map(node -> {
                    String labelPart = String.join("/", node.getLabels());
                    String propertyPart = node.getProperties().entrySet().stream()
                            .filter(entry -> !"id".equalsIgnoreCase(entry.getKey()))
                            .map(entry -> entry.getValue().toString())
                            .collect(Collectors.joining(", "));

                    String display = propertyPart.isEmpty() ? labelPart : labelPart + ", " + propertyPart;

                    Map<String, String> option = new HashMap<>();
                    option.put("label", labelPart);
                    option.put("display", display);
                    option.put("value", node.getProperties().get("id").toString());
                    return option;
                })
                .collect(Collectors.toList());
    }



}




