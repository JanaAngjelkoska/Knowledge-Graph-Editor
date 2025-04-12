package com.knowledgegrapheditor.kge.repository.impl;

import com.knowledgegrapheditor.kge.repository.RelationshipRepository;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Records;
import org.neo4j.driver.Session;

import java.util.List;

public class RelationshipRepositoryImpl {

    private Driver driver;

    public RelationshipRepositoryImpl(Driver driver) {
        this.driver = driver;
    }


}
