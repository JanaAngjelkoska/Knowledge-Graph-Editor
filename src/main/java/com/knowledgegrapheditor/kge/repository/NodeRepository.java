package com.knowledgegrapheditor.kge.repository;

import org.neo4j.driver.Record;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NodeRepository {
    List<Record> findAll();
    Record findById(UUID id);
    List<Record> findAllByLabel(String label);

    Record deleteById(UUID id);
    Record create(String nodeLabel, Map<String, Object> parameters);
}
