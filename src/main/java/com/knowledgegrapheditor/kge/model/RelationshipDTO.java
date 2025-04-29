package com.knowledgegrapheditor.kge.model;

import java.util.Map;

public class RelationshipDTO {

    private String startNodeId;
    private String destinationNodeId;
    private Map<String, Object> properties;
    private String relationshipType;


    public RelationshipDTO() {

    }

    public RelationshipDTO(String startNodeId, String destinationNodeId, Map<String, Object> properties, String relationshipType) {
        this.startNodeId = startNodeId;
        this.destinationNodeId = destinationNodeId;
        this.properties = properties;
        this.relationshipType = relationshipType;
    }

    public String getStartNodeId() {
        return startNodeId;
    }

    public String getDestinationNodeId() {
        return destinationNodeId;
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
                ", endNodeId=" + startNodeId +
                ", relationshipType='" + relationshipType + '\'' +
                ", properties=" + properties +
                '}';
    }
}
