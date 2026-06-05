namespace HouseRhiant.Api.DTOs;

public record SkillDto(
    int Id,
    string Name,
    string Category,
    bool Trained,
    int XpCost,
    string? CoreAttribute,
    string? Description,
    string? Notes
);

public record CreateSkillDto(
    string Name,
    string Category,
    bool Trained,
    int XpCost,
    string? CoreAttribute,
    string? Description,
    string? Notes
);
