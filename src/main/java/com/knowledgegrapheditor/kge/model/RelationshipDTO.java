package com.knowledgegrapheditor.kge.model;

import java.util.Map;
import java.util.UUID;

public class RelationshipDTO {

    private String startNodeElementId;
    private String endNodeElementId;
    private Map<String, Object> properties;
    private String relationshipType;


    public RelationshipDTO(String startNodeElementId, String endNodeElementId, Map<String, Object> properties, String relationshipType) {
        this.startNodeElementId = startNodeElementId;
        this.endNodeElementId = endNodeElementId;
        this.properties = properties;
        this.relationshipType = relationshipType;
    }

    public String getStartNodeElementId() {
        return startNodeElementId;
    }

    public String getEndNodeElementId() {
        return endNodeElementId;
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
                "startNodeId=" + startNodeElementId +
                ", endNodeId=" + startNodeElementId +
                ", relationshipType='" + relationshipType + '\'' +
                ", properties=" + properties +
                '}';
    }
}
