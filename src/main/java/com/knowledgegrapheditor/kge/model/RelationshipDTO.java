package com.knowledgegrapheditor.kge.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

public class RelationshipDTO {

    String startNodeId;
    String endNodeId;
    Map<String, Object> properties;
    String relationshipType;

    // constructor without the properties (optional)
    public RelationshipDTO(String startNodeId, String endNodeId, String relationshipType) {
        this.startNodeId = startNodeId;
        this.endNodeId = endNodeId;
        this.relationshipType = relationshipType;
    }

    public RelationshipDTO(){}


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
