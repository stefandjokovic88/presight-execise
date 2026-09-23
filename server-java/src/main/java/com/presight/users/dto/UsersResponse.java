package com.presight.users.dto;

import com.presight.users.model.User;
import java.util.List;

public record UsersResponse(List<User> data, PaginationMeta pagination) {}
