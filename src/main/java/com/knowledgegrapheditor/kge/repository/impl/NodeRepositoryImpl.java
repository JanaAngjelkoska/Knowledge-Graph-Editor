package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.repository.NodeRepository;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;

import java.util.List;

public class NodeRepositoryImpl {
    private Driver driver;

    public NodeRepositoryImpl(Driver driver) {
        this.driver = driver;
    }

}
