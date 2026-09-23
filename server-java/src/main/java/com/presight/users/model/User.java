package com.presight.users.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record User(
    long id,
    String avatar,
    @JsonProperty("first_name") String firstName,
    @JsonProperty("last_name") String lastName,
    int age,
    String nationality,
    List<String> hobbies) {}
