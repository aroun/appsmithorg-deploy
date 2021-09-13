package com.appsmith.server.controllers;

import com.appsmith.server.constants.Url;
import com.appsmith.server.domains.JSLib;
import com.appsmith.server.dtos.ResponseDTO;
import com.appsmith.server.services.CustomJSLibService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(Url.CUSTOM_JS_LIB_URL)
public class CustomJSLibController extends BaseController<CustomJSLibService, JSLib, String> {

    @Autowired
    public CustomJSLibController(CustomJSLibService service) {
        super(service);
    }

    @GetMapping(value = "/{applicationId}", params = {"type=applicationId"})
    public Mono<ResponseDTO<List<JSLib>>> getJSLibsByApplicationId(@PathVariable String applicationId) {
        log.debug("Going to get JS libs with application id: '{}'.", applicationId);
        return service.getJSLibsByApplicationId(applicationId)
                .map(structure -> new ResponseDTO<>(HttpStatus.OK.value(), structure, null));
    }
}
