package com.appsmith.server.repositories;

import com.appsmith.server.domains.Collection;
import reactor.core.publisher.Mono;

public interface CollectionRepositoryCE extends BaseRepository<Collection, String>, CustomCollectionRepository {
    Mono<Collection> findById(String id);
}
