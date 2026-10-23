package com.sankalp.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // CIVIC, RESIDENTIAL_SOCIETY

    @Column(nullable = false, unique = true)
    private String code;

    @Column
    private String address;

    @Column
    private String city;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Organization() {}

    public Organization(String name, String type, String code, String address, String city) {
        this.name = name;
        this.type = type;
        this.code = code;
        this.address = address;
        this.city = city;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
