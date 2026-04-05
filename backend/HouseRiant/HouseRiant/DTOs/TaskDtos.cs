using HouseRhiant.Api.Models;

namespace HouseRhiant.Api.DTOs;

public record TaskResponse(
    int Id,
    string Name,
    string? Description,
    string Status,
    string Priority,
    string Category,
    decimal? CostTin,
    string? PaymentMethod,
    string? PaymentNotes,
    string? TargetDate,
    string? CompletedDate,
    string? Requirements,
    string? Outcome,
    string? Notes,
    int? BuildingId,
    string? BuildingName,
    int? AssignedFamilyId,
    string? AssignedFamilyName,
    int? AssignedResidentId,
    string? AssignedResidentName
);

public record CreateTaskRequest(
    string Name,
    string? Description,
    EstateTaskStatus Status,
    TaskPriority Priority,
    TaskCategory Category,
    decimal? CostTin,
    string? PaymentMethod,
    string? PaymentNotes,
    string? TargetDate,
    string? CompletedDate,
    string? Requirements,
    string? Outcome,
    string? Notes,
    int? BuildingId,
    int? AssignedFamilyId,
    int? AssignedResidentId
);
