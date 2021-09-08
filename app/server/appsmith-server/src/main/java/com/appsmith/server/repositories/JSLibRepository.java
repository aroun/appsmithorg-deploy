package com.appsmith.server.repositories;

import com.appsmith.server.domains.JSLib;
import org.springframework.stereotype.Repository;

@Repository
public interface JSLibRepository extends BaseRepository<JSLib, String>, CustomJSLibRepository {
}
