package com.knowledgegrapheditor.kge.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SiteController {

    @GetMapping({"/home", "/", ""})
    public String landing() {
        return "main";
    }

    @GetMapping({"/editor", "/graph"})
    public String editor() {
        return "editor";
    }

}
