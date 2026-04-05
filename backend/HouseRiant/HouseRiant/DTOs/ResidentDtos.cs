using HouseRhiant.Api.Models;

namespace HouseRhiant.Api.DTOs;

public record ResidentResponse(
    int Id,
    string Name,
    string Status,
    string? StatusOther,
    string? Title,
    string? Role,
    string? Type,
    string? Race,
    string? KrellTribe,
    string? Gender,
    int? Age,
    decimal? DailyPayRate,
    string? LandOwned,
    string? Appearance,
    string? Skills,
    string? TroopType,
    string? LevelOfRole,
    string? Notes,
    string? ImageUrl,
    int? FamilyId,
    string? FamilyName
);

public record CreateResidentRequest(
    string Name,
    PersonStatus Status,
    string? StatusOther,
    string? Title,
    string? Role,
    string? Type,
    string? Race,
    string? KrellTribe,
    Gender? Gender,
    int? Age,
    decimal? DailyPayRate,
    string? LandOwned,
    string? Appearance,
    string? Skills,
    string? TroopType,
    string? LevelOfRole,
    string? Notes,
    string? ImageUrl,
    int? FamilyId
);
