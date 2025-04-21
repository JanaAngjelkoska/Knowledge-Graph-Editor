package com.knowledgegrapheditor.kge.model;
import java.util.Map;
import java.util.UUID;

public class NodeDTO {

    private Iterable<String> labels;
    private Map<String, Object> properties;

    public NodeDTO(Iterable<String> labels, Map<String, Object> properties) {
        this.labels = labels;
        this.properties = properties;
    }

    public Iterable<String> getLabels() {
        return labels;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    @Override
    public String toString() {
        return "NodeDTO{" +
                "labels=" + labels.toString() +
                ", properties=" + properties.toString() +
                '}';
    }
}
