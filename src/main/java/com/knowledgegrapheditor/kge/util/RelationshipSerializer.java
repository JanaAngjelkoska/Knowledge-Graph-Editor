package com.knowledgegrapheditor.kge.util;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.model.RelationshipDTO;
import org.neo4j.driver.Record;

public class RelationshipSerializer {

    public static RelationshipDTO serialize(Record record, String referencer) {
        return new RelationshipDTO(
                record.get(referencer).asRelationship().startNodeElementId(),
                record.get(referencer).asRelationship().endNodeElementId(),
                record.get(referencer).asRelationship().asMap(),
                record.get(referencer).asRelationship().type()
        );
    }
}
