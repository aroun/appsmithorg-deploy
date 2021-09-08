package com.appsmith.server.repositories;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.JSLib;
import com.appsmith.server.domains.QCommentThread;
import com.appsmith.server.domains.QJSLib;
import com.appsmith.server.domains.QNewAction;
import com.appsmith.server.domains.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoOperations;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Component
@Slf4j
public class CustomJSLibRepositoryImpl extends BaseAppsmithRepositoryImpl<JSLib> implements CustomJSLibRepository {

    public CustomJSLibRepositoryImpl(ReactiveMongoOperations mongoOperations, MongoConverter mongoConverter) {
        super(mongoOperations, mongoConverter);
    }

    @Override
    public Flux<JSLib> findByApplicationId(String applicationId, AclPermission permission) {
        Criteria criteria = where(fieldName(QJSLib.jSLib.applicationId)).is(applicationId);
        return queryAll(List.of(criteria), permission);
    }
}
