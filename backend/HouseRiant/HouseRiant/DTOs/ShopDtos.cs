namespace HouseRhiant.Api.DTOs;

public record ShopItemDto(
    int Id,
    string Name,
    string Category,
    decimal BaseCostTin,
    decimal? WeightLbs,
    string? Description,
    string? Notes,
    string? DefaultMaterial
);

public record CreateShopItemDto(
    string Name,
    string Category,
    decimal BaseCostTin,
    decimal? WeightLbs,
    string? Description,
    string? Notes,
    string? DefaultMaterial
);
