namespace HouseRhiant.Api.DTOs;

public record UpdateEstateFinancesRequest(
    decimal BankBalanceTin,
    decimal MoneyOnHandTin,
    decimal DorrinFundsTin,
    decimal LoanAmountTin,
    decimal TaxRateTin,
    string? TaxNotes,
    string? CurrentGameDate,
    string? CurrentSeason
);

public record CreateIncomeSourceRequest(
    string Name,
    decimal DailyYieldTin,
    bool IsActive,
    string? Notes
);
