package com.knowledgegrapheditor.kge.util;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import org.neo4j.driver.Record;

import java.util.UUID;

public class RelationshipSerializer {

    public static RelationshipDTO serialize(Record record, String referencer) {
        return new RelationshipDTO(
                record.get(referencer).get("sourceNodeId").toString().substring(1, 37),
                record.get(referencer).get("destinationNodeId").toString().substring(1, 37),
                record.get(referencer).asRelationship().asMap(),
                record.get(referencer).asRelationship().type()
        );
    }
}
