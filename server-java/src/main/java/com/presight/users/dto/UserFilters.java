package com.presight.users.dto;

import java.util.List;

public record UserFilters(String q, List<String> nationalities, List<String> hobbies) {}
