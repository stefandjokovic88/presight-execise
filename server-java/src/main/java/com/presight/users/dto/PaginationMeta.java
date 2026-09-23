package com.presight.users.dto;

public record PaginationMeta(int page, int pageSize, long total, boolean hasMore) {}
