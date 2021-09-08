package com.appsmith.server.repositories;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.JSLib;
import reactor.core.publisher.Flux;

public interface CustomJSLibRepository extends AppsmithRepository<JSLib> {
    Flux<JSLib> findByApplicationId(String applicationId, AclPermission permission);
}
