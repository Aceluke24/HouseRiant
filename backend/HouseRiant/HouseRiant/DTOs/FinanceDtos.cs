namespace HouseRhiant.Api.DTOs;

// Updates the financial figures only
public record UpdateEstateFinancesRequest(
    decimal BankBalanceTin,
    decimal MoneyOnHandTin,
    decimal DorrinFundsTin,
    decimal LoanAmountTin,
    decimal TaxRateTin,
    string? TaxNotes
);

// ── Game State ────────────────────────────────────────────

public record GameStateDto(
    int Id,
    int CurrentYear,
    string? CurrentSeason,
    string? CurrentWeek,
    int CurrentDay
);

public record UpdateGameDateRequest(
    int CurrentYear,
    string CurrentSeason,
    string? CurrentWeek,
    int CurrentDay
);

public record CreateIncomeSourceRequest(
    string Name,
    decimal DailyYieldTin,
    bool IsActive,
    string? Notes
);
