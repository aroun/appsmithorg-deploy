package com.appsmith.server.repositories;

import com.appsmith.server.domains.Comment;
import reactor.core.publisher.Flux;

import java.util.List;

public interface CommentRepositoryCE extends BaseRepository<Comment, String>, CustomCommentRepository {

    Flux<Comment> findByThreadIdInOrderByCreatedAt(List<String> threadIds);

}
