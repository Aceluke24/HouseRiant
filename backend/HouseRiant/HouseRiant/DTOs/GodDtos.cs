namespace HouseRhiant.Api.DTOs;

public record GodDto(
    int Id,
    string Name,
    string Tier,
    string? PrimaryDomain,
    string? Description,
    string? Notes,
    bool IsActive
);

public record CreateGodDto(
    string Name,
    string Tier,
    string? PrimaryDomain,
    string? Description,
    string? Notes,
    bool IsActive
);
