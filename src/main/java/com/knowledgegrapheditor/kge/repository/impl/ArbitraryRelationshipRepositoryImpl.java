package com.knowledgegrapheditor.kge.repository.impl;

import org.neo4j.driver.Driver;

public class ArbitraryRelationshipRepositoryImpl {

    private Driver driver;

    public ArbitraryRelationshipRepositoryImpl(Driver driver) {
        this.driver = driver;
    }


}
