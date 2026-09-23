package com.presight.users.service;

import com.presight.users.dto.DirectoryFacetsResponse;
import com.presight.users.dto.ListQuery;
import com.presight.users.dto.PaginationMeta;
import com.presight.users.dto.UserFilters;
import com.presight.users.dto.UsersResponse;
import com.presight.users.model.User;
import com.presight.users.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public UsersResponse listUsers(ListQuery query) {
    long total = userRepository.countUsers(query.toFilters());
    List<User> data = userRepository.listUsers(query);
    int offset = (query.page() - 1) * query.pageSize();
    boolean hasMore = offset + data.size() < total;
    return new UsersResponse(
        data, new PaginationMeta(query.page(), query.pageSize(), total, hasMore));
  }

  public DirectoryFacetsResponse getFacets(UserFilters filters) {
    return new DirectoryFacetsResponse(
        userRepository.getTopHobbies(filters, 20),
        userRepository.getTopNationalities(filters, 20));
  }
}
