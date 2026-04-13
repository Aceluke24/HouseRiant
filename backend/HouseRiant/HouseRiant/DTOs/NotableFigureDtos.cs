using HouseRhiant.Api.Models;

namespace HouseRhiant.Api.DTOs;

public record NotableFigureResponse(
    int Id,
    string Name,
    string? Title,
    string? Role,
    string? Type,
    string? Race,
    string? KrellTribe,
    string? Gender,
    int? Age,
    string? Location,
    string? Faction,
    string? Relationship,
    string? Appearance,
    string? Skills,
    bool IsAlive,
    string? FirstMet,
    string? LastSeen,
    string? Notes,
    string? ImageUrl,
    int? FamilyId,
    string? FamilyName,
    int SortOrder
);

public record CreateNotableFigureRequest(
    string Name,
    string? Title,
    string? Role,
    string? Type,
    string? Race,
    string? KrellTribe,
    Gender? Gender,
    int? Age,
    string? Location,
    string? Faction,
    string? Relationship,
    string? Appearance,
    string? Skills,
    bool IsAlive,
    string? FirstMet,
    string? LastSeen,
    string? Notes,
    string? ImageUrl,
    int? FamilyId
);
