package com.knowledgegrapheditor.kge.util;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import org.neo4j.driver.Record;

public class NodeSerializer {

    /**
     * A serializer for a Neo4j node record, for JSON compatibility.
     * @param record The record object from Neo4j, gotten from the result.
     * @param referencer The variable used to reference the node through a label (-referencer-: Label). This is just
     *                   for consistency purposes
     * @return A data transfer object containing a node's labels and it's properties.
     */
    public static NodeDTO serialize(Record record, String referencer) {
        return new NodeDTO (
                record.get(referencer).asNode().labels(),
                record.get(referencer).asNode().asMap()
        );
    }

}
