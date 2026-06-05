namespace HouseRhiant.Api.DTOs;

public record OrganizationDto(
    int Id,
    string Name,
    string Type,
    string? Description,
    string? Headquarters,
    string? Leader,
    string Relationship,
    string? Allegiance,
    bool IsActive,
    string? Notes
);

public record CreateOrganizationDto(
    string Name,
    string Type,
    string? Description,
    string? Headquarters,
    string? Leader,
    string Relationship,
    string? Allegiance,
    bool IsActive,
    string? Notes
);
