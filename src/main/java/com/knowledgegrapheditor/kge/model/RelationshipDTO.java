package com.knowledgegrapheditor.kge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
