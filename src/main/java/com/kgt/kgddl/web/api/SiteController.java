package com.kgt.kgddl.web.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SiteController {

    @GetMapping
    public ResponseEntity<Void> data() {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
