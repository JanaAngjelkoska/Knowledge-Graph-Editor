package com.knowledgegrapheditor.kge.web;

import com.knowledgegrapheditor.kge.util.DbConnectionStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SiteController {
    
    private final DbConnectionStatus connectionData;

    public SiteController(DbConnectionStatus connectionStatus) {
        this.connectionData = connectionStatus;
    }

    @GetMapping({"/home", "/", ""})
    public String landing() {
        return "main";
    }

    @GetMapping({"/editor", "/graph"})
    public String editor(Model model) {
        model.addAttribute("connectionData", connectionData);
        return "editor";
    }

}
