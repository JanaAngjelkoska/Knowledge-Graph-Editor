package com.knowledgegrapheditor.kge.service;

import com.knowledgegrapheditor.kge.model.NodeDTO;
import com.knowledgegrapheditor.kge.model.RelationshipDTO;

public interface RelationshipService {

    Iterable<RelationshipDTO> findAll();
}
