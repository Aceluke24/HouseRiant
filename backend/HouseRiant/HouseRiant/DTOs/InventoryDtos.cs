using HouseRhiant.Api.Models;

namespace HouseRhiant.Api.DTOs;

public record CreateInventoryRequest(
    string Name,
    int Quantity,
    string? Unit,
    InventoryCategory Category,
    InventoryCondition? Condition,
    string? Description,
    decimal? EstimatedValue,
    string? Location,
    string? Notes
);
