package com.medicare.medicare.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // This tells Jackson to ignore unknown properties
public class User {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String address;
    private String password;
    private String role = "USER"; // Default role is USER

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Mark this as JsonProperty so it's properly handled in serialization/deserialization
    @JsonProperty("admin")
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }

    // This ensures the admin field is properly set during deserialization
    @JsonProperty("admin")
    private void setAdmin(boolean admin) {
        // This is just a setter for Jackson - we don't need to do anything here
        // since the role field controls the admin status
    }
}