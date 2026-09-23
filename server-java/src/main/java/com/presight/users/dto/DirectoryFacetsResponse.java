package com.presight.users.dto;

import com.presight.users.model.FacetValue;
import java.util.List;

public record DirectoryFacetsResponse(List<FacetValue> hobbies, List<FacetValue> nationalities) {}
