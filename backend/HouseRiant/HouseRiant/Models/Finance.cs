namespace HouseRhiant.Api.Models;

public class EstateFinances
{
    public int Id { get; set; }
    public decimal BankBalanceTin { get; set; }
    public decimal MoneyOnHandTin { get; set; }
    public decimal DorrinFundsTin { get; set; }
    public decimal LoanAmountTin { get; set; }
    public decimal TaxRateTin { get; set; }
    public string? TaxNotes { get; set; }
    public string? CurrentGameDate { get; set; }
    public string? CurrentSeason { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public class IncomeSource
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DailyYieldTin { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
}
