using HouseRhiant.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Family> Families { get; set; }
    public DbSet<Resident> Residents { get; set; }
    public DbSet<NotableFigure> NotableFigures { get; set; }
    public DbSet<Building> Buildings { get; set; }
    public DbSet<EstateTask> Tasks { get; set; }
    public DbSet<EstateFinances> EstateFinances { get; set; }
    public DbSet<GameState> GameStates { get; set; }
    public DbSet<IncomeSource> IncomeSources { get; set; }
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<CalendarEvent> CalendarEvents { get; set; }
    public DbSet<PersonGroup> PersonGroups { get; set; }
    public DbSet<PersonGroupMember> PersonGroupMembers { get; set; }
    public DbSet<BuildingAssignment> BuildingAssignments { get; set; }
    public DbSet<ChronicleEntry> ChronicleEntries { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<ChronicleEntryTag> ChronicleEntryTags { get; set; }
    public DbSet<ChronicleEntryResident> ChronicleEntryResidents { get; set; }
    public DbSet<ChronicleEntryNotableFigure> ChronicleEntryNotableFigures { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Family
        modelBuilder.Entity<Family>(e =>
        {
            e.HasKey(f => f.Id);
            e.Property(f => f.Name).IsRequired().HasMaxLength(200);
            e.Property(f => f.Allegiance).IsRequired(false);
            e.Property(f => f.Notes).IsRequired(false);
        });

        // Resident — only Name required
        modelBuilder.Entity<Resident>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Name).IsRequired().HasMaxLength(200);
            e.Property(r => r.Role).IsRequired(false).HasMaxLength(200);
            e.Property(r => r.Title).IsRequired(false).HasMaxLength(200);
            e.Property(r => r.StatusOther).IsRequired(false);
            e.Property(r => r.Type).IsRequired(false);
            e.Property(r => r.Race).IsRequired(false);
            e.Property(r => r.KrellTribe).IsRequired(false);
            e.Property(r => r.LandOwned).IsRequired(false);
            e.Property(r => r.Appearance).IsRequired(false);
            e.Property(r => r.Skills).IsRequired(false);
            e.Property(r => r.TroopType).IsRequired(false);
            e.Property(r => r.LevelOfRole).IsRequired(false);
            e.Property(r => r.Notes).IsRequired(false);
            e.Property(r => r.ImageUrl).IsRequired(false);
            e.Property(r => r.DailyPayRate).HasColumnType("decimal(10,2)");
            e.Property(r => r.Status).HasConversion<string>();
            e.Property(r => r.Gender).HasConversion<string>();
            e.HasOne(r => r.Family)
             .WithMany(f => f.Residents)
             .HasForeignKey(r => r.FamilyId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(r => r.Building)
             .WithMany(b => b.Residents)
             .HasForeignKey(r => r.BuildingId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // NotableFigure — only Name required
        modelBuilder.Entity<NotableFigure>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.Name).IsRequired().HasMaxLength(200);
            e.Property(n => n.Title).IsRequired(false).HasMaxLength(200);
            e.Property(n => n.Role).IsRequired(false);
            e.Property(n => n.Type).IsRequired(false);
            e.Property(n => n.Race).IsRequired(false);
            e.Property(n => n.KrellTribe).IsRequired(false);
            e.Property(n => n.Location).IsRequired(false);
            e.Property(n => n.Faction).IsRequired(false);
            e.Property(n => n.Relationship).IsRequired(false);
            e.Property(n => n.Appearance).IsRequired(false);
            e.Property(n => n.Skills).IsRequired(false);
            e.Property(n => n.FirstMet).IsRequired(false);
            e.Property(n => n.LastSeen).IsRequired(false);
            e.Property(n => n.Notes).IsRequired(false);
            e.Property(n => n.ImageUrl).IsRequired(false);
            e.Property(n => n.Gender).HasConversion<string>();
            e.HasOne(n => n.Family)
             .WithMany(f => f.NotableFigures)
             .HasForeignKey(n => n.FamilyId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Building — only Name required
        modelBuilder.Entity<Building>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.Name).IsRequired().HasMaxLength(200);
            e.Property(b => b.Description).IsRequired(false);
            e.Property(b => b.ImageUrl).IsRequired(false);
            e.Property(b => b.ImagePosition).IsRequired(false).HasMaxLength(50);
            e.Property(b => b.Notes).IsRequired(false);
            e.Property(b => b.Type).HasConversion<string>();
            e.Property(b => b.Condition).HasConversion<string>();
        });

        // EstateTask — only Name required
        modelBuilder.Entity<EstateTask>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Name).IsRequired().HasMaxLength(200);
            e.Property(t => t.Description).IsRequired(false);
            e.Property(t => t.PaymentMethod).IsRequired(false);
            e.Property(t => t.PaymentNotes).IsRequired(false);
            e.Property(t => t.TargetDate).IsRequired(false);
            e.Property(t => t.CompletedDate).IsRequired(false);
            e.Property(t => t.Requirements).IsRequired(false);
            e.Property(t => t.Outcome).IsRequired(false);
            e.Property(t => t.Notes).IsRequired(false);
            e.Property(t => t.Status).HasConversion<string>();
            e.Property(t => t.Priority).HasConversion<string>();
            e.Property(t => t.Category).HasConversion<string>();
            e.Property(t => t.CostTin).HasColumnType("decimal(12,2)");
            e.HasOne(t => t.Building)
             .WithMany(b => b.Tasks)
             .HasForeignKey(t => t.BuildingId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(t => t.AssignedFamily)
             .WithMany(f => f.Tasks)
             .HasForeignKey(t => t.AssignedFamilyId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(t => t.AssignedResident)
             .WithMany(r => r.Tasks)
             .HasForeignKey(t => t.AssignedResidentId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // EstateFinances
        modelBuilder.Entity<EstateFinances>(e =>
        {
            e.HasKey(f => f.Id);
            e.Property(f => f.BankBalanceTin).HasColumnType("decimal(12,2)");
            e.Property(f => f.MoneyOnHandTin).HasColumnType("decimal(12,2)");
            e.Property(f => f.DorrinFundsTin).HasColumnType("decimal(12,2)");
            e.Property(f => f.LoanAmountTin).HasColumnType("decimal(12,2)");
            e.Property(f => f.TaxRateTin).HasColumnType("decimal(10,2)");
            e.Property(f => f.TaxNotes).IsRequired(false);
        });

        // GameState — single row holding the current in-world date
        modelBuilder.Entity<GameState>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.CurrentSeason).IsRequired(false);
            e.Property(g => g.CurrentWeek).IsRequired(false);
        });

        // IncomeSource
        modelBuilder.Entity<IncomeSource>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Name).IsRequired().HasMaxLength(200);
            e.Property(i => i.Notes).IsRequired(false);
            e.Property(i => i.DailyYieldTin).HasColumnType("decimal(10,2)");
        });

        // Inventory — only Name required
        modelBuilder.Entity<Inventory>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Name).IsRequired().HasMaxLength(200);
            e.Property(i => i.Unit).IsRequired(false);
            e.Property(i => i.Description).IsRequired(false);
            e.Property(i => i.Location).IsRequired(false);
            e.Property(i => i.Notes).IsRequired(false);
            e.Property(i => i.Category).HasConversion<string>();
            e.Property(i => i.Condition).HasConversion<string>();
            e.Property(i => i.EstimatedValue).HasColumnType("decimal(12,2)");
        });

        // CalendarEvent — only Name and Season required
        modelBuilder.Entity<CalendarEvent>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).IsRequired().HasMaxLength(200);
            e.Property(c => c.Season).IsRequired().HasMaxLength(100);
            e.Property(c => c.Description).IsRequired(false);
            e.Property(c => c.Week).IsRequired(false);
            e.Property(c => c.DisplayDate).IsRequired(false);
            e.Property(c => c.Notes).IsRequired(false);
            e.Property(c => c.Type).HasConversion<string>();
            e.HasOne(c => c.LinkedTask)
             .WithMany(t => t.CalendarEvents)
             .HasForeignKey(c => c.LinkedTaskId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // PersonGroup
        modelBuilder.Entity<PersonGroup>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Name).IsRequired().HasMaxLength(200);
            e.Property(g => g.Description).IsRequired(false);
            e.Property(g => g.Color).IsRequired(false).HasMaxLength(50);
        });

        // PersonGroupMember
        modelBuilder.Entity<PersonGroupMember>(e =>
        {
            e.HasKey(m => m.Id);
            e.HasOne(m => m.Group)
             .WithMany(g => g.Members)
             .HasForeignKey(m => m.GroupId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Resident)
             .WithMany(r => r.GroupMemberships)
             .HasForeignKey(m => m.ResidentId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.NotableFigure)
             .WithMany(n => n.GroupMemberships)
             .HasForeignKey(m => m.NotableFigureId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // BuildingAssignment (secondary many-to-many assignments)
        modelBuilder.Entity<BuildingAssignment>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.AssignmentType).IsRequired(false).HasMaxLength(100);
            e.HasOne(a => a.Building)
             .WithMany(b => b.Assignments)
             .HasForeignKey(a => a.BuildingId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.Resident)
             .WithMany(r => r.BuildingAssignments)
             .HasForeignKey(a => a.ResidentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ChronicleEntry
        modelBuilder.Entity<ChronicleEntry>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Title).IsRequired().HasMaxLength(300);
            e.Property(c => c.Body).IsRequired();
            e.Property(c => c.EntryDate).IsRequired(false);
        });

        // Tag
        modelBuilder.Entity<Tag>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Name).IsRequired().HasMaxLength(100);
            e.HasIndex(t => t.Name).IsUnique();
            e.Property(t => t.Color).IsRequired(false).HasMaxLength(20);
        });

        // ChronicleEntryTag — cascade when entry or tag is deleted
        modelBuilder.Entity<ChronicleEntryTag>(e =>
        {
            e.HasKey(et => et.Id);
            e.HasOne(et => et.ChronicleEntry)
             .WithMany(c => c.EntryTags)
             .HasForeignKey(et => et.ChronicleEntryId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(et => et.Tag)
             .WithMany(t => t.EntryTags)
             .HasForeignKey(et => et.TagId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ChronicleEntryResident — cascade when entry is deleted, cascade when resident is deleted
        modelBuilder.Entity<ChronicleEntryResident>(e =>
        {
            e.HasKey(er => er.Id);
            e.HasOne(er => er.ChronicleEntry)
             .WithMany(c => c.EntryResidents)
             .HasForeignKey(er => er.ChronicleEntryId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(er => er.Resident)
             .WithMany()
             .HasForeignKey(er => er.ResidentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ChronicleEntryNotableFigure — cascade when entry or figure is deleted
        modelBuilder.Entity<ChronicleEntryNotableFigure>(e =>
        {
            e.HasKey(ef => ef.Id);
            e.HasOne(ef => ef.ChronicleEntry)
             .WithMany(c => c.EntryNotableFigures)
             .HasForeignKey(ef => ef.ChronicleEntryId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ef => ef.NotableFigure)
             .WithMany()
             .HasForeignKey(ef => ef.NotableFigureId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed estate finances
        modelBuilder.Entity<EstateFinances>().HasData(new EstateFinances
        {
            Id             = 1,
            BankBalanceTin = 61,
            MoneyOnHandTin = 0,
            DorrinFundsTin = 0,
            LoanAmountTin  = 57022,
            TaxRateTin     = 0,
            LastUpdated    = new DateTime(2026, 3, 22, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed game state
        modelBuilder.Entity<GameState>().HasData(new GameState
        {
            Id            = 1,
            CurrentYear   = 58,
            CurrentSeason = "Brón: Bás",
            CurrentWeek   = null,
            CurrentDay    = 3,
        });

        // Seed income sources
        modelBuilder.Entity<IncomeSource>().HasData(new IncomeSource
        {
            Id = 1,
            Name = "Rhiant Mine",
            DailyYieldTin = 216,
            IsActive = true,
            Notes = "Silver mine, 200 acres"
        });
    }
}
