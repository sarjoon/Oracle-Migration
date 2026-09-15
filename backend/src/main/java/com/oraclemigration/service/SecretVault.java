package com.oraclemigration.service;

import java.util.concurrent.*;
import org.springframework.stereotype.Service;

@Service
public class SecretVault {
  private final ConcurrentMap<Long, Secret> values = new ConcurrentHashMap<>();

  public record Secret(String databaseSecret, String keyStoreSecret) {}

  public void put(Long profileId, String databaseSecret, String keyStoreSecret) {
    values.put(profileId, new Secret(databaseSecret, keyStoreSecret));
  }

  public Secret require(Long profileId) {
    var value = values.get(profileId);
    if (value == null)
      throw new IllegalStateException("Credentials must be entered for profile " + profileId);
    return value;
  }

  public boolean contains(Long profileId) {
    return values.containsKey(profileId);
  }

  public void clear(Long profileId) {
    values.remove(profileId);
  }
}
