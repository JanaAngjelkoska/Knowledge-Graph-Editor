package com.knowledgegrapheditor.kge.model;

import java.util.Map;

public class RelationshipDTO {

    private String startNodeId;
    private String endNodeId;
    private Map<String, Object> properties;
    private String relationshipType;

    // exclude properties
    public RelationshipDTO(String startNodeId, String endNodeId, String relationshipType) {
        this.startNodeId = startNodeId;
        this.endNodeId = endNodeId;
        this.relationshipType = relationshipType;
    }

    // include properties
    public RelationshipDTO(String startNodeId, String endNodeId, Map<String, Object> properties, String relationshipType) {
        this.startNodeId = startNodeId;
        this.endNodeId = endNodeId;
        this.properties = properties;
        this.relationshipType = relationshipType;
    }

    public String getStartNodeId() {
        return startNodeId;
    }

    public String getEndNodeId() {
        return endNodeId;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public String getRelationshipType() {
        return relationshipType;
    }

    @Override
    public String toString() {
        return "RelationshipDTO{" +
                "startNodeId=" + startNodeId +
                ", endNodeId=" + endNodeId +
                ", relationshipType='" + relationshipType + '\'' +
                ", properties=" + properties +
                '}';
    }
}
