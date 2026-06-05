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
    public DbSet<God> Gods { get; set; }
    public DbSet<Skill> Skills { get; set; }
    public DbSet<ShopItem> ShopItems { get; set; }
    public DbSet<Organization> Organizations { get; set; }

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

        // ── God ──────────────────────────────────────────────────
        modelBuilder.Entity<God>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Name).IsRequired().HasMaxLength(200);
            e.Property(g => g.Tier).IsRequired().HasMaxLength(50);
            e.Property(g => g.PrimaryDomain).IsRequired(false);
            e.Property(g => g.Description).IsRequired(false);
            e.Property(g => g.Notes).IsRequired(false);
        });

        // ── Skill ─────────────────────────────────────────────────
        modelBuilder.Entity<Skill>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).IsRequired().HasMaxLength(200);
            e.Property(s => s.Category).IsRequired().HasMaxLength(100);
            e.Property(s => s.CoreAttribute).IsRequired(false).HasMaxLength(100);
            e.Property(s => s.Description).IsRequired(false);
            e.Property(s => s.Notes).IsRequired(false);
        });

        // ── ShopItem ──────────────────────────────────────────────
        modelBuilder.Entity<ShopItem>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).IsRequired().HasMaxLength(200);
            e.Property(s => s.Category).IsRequired().HasMaxLength(100);
            e.Property(s => s.BaseCostTin).HasColumnType("decimal(10,2)");
            e.Property(s => s.WeightLbs).HasColumnType("decimal(8,3)").IsRequired(false);
            e.Property(s => s.Description).IsRequired(false);
            e.Property(s => s.Notes).IsRequired(false);
            e.Property(s => s.DefaultMaterial).IsRequired(false).HasMaxLength(100);
        });

        // ── Organization ──────────────────────────────────────────
        modelBuilder.Entity<Organization>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.Name).IsRequired().HasMaxLength(200);
            e.Property(o => o.Type).IsRequired().HasMaxLength(100);
            e.Property(o => o.Relationship).IsRequired().HasMaxLength(100);
            e.Property(o => o.Description).IsRequired(false);
            e.Property(o => o.Headquarters).IsRequired(false).HasMaxLength(200);
            e.Property(o => o.Leader).IsRequired(false).HasMaxLength(200);
            e.Property(o => o.Allegiance).IsRequired(false).HasMaxLength(200);
            e.Property(o => o.Notes).IsRequired(false);
        });

        // ── Seed Gods ─────────────────────────────────────────────
        // Primal tier (9)
        modelBuilder.Entity<God>().HasData(
            new God { Id = 1,  Name = "Ambrik",  Tier = "Primal", PrimaryDomain = "Body",   IsActive = true,  Description = "Primal of body, fire, and martial transformation. Patron of warriors. Followers are known as Ashborn or Tineiteoir. Primary colors blue and white; sacred wood cherry; symbol blue flame." },
            new God { Id = 2,  Name = "Aumma",   Tier = "Primal", PrimaryDomain = "Life",   IsActive = true,  Description = "The Sun Father. God of life, birth, and renewal. Those who die during El are said to walk with Aumma. Sacred wood maple; symbol sun and circles." },
            new God { Id = 3,  Name = "Eaden",   Tier = "Primal", PrimaryDomain = "Fate",   IsActive = true,  Description = "The two-faced god. Governs fate, luck, and reversals. His two aspects El (merciful) and Halbor (cruel) represent fortune's duality. Sacred wood beech; symbol paired faces or coins." },
            new God { Id = 4,  Name = "Foeduhn", Tier = "Primal", PrimaryDomain = "Mind",   IsActive = true,  Description = "The stone-faced god. Governs mind, stoicism, endurance, and emotional control. Followers prize the Eight Pillars of emotional mastery. Sacred wood pine; symbol rocks and dust." },
            new God { Id = 5,  Name = "Harmu",   Tier = "Primal", PrimaryDomain = "Entropy",IsActive = true,  Description = "The trickster god of entropy, chaos, and confusion. Often invoked as ill fortune in death. Sacred wood sycamore; symbol chains and twisted door." },
            new God { Id = 6,  Name = "Iianu",   Tier = "Primal", PrimaryDomain = "Creation",IsActive = true, Description = "The Second Creator. Goddess of nature, healing, and creation. Created the mortal plane. Her tears created the seas; her breath created healing herbs. Sacred wood oak; symbol spiral, droplet, fern frond." },
            new God { Id = 7,  Name = "Rin",     Tier = "Primal", PrimaryDomain = "Spirit", IsActive = true,  Description = "The Blind Maiden, twin of Iianu. Patron of protection, wards, and spirit. Blinded herself to avoid sorrow. Gifted mortals with Iridium. Rinnians are the only source of Iridium items. Sacred wood rowan; symbol holes and tears." },
            new God { Id = 8,  Name = "Sorra",   Tier = "Primal", PrimaryDomain = "Death",  IsActive = true,  Description = "The Night Mother. Kind deity who takes the dead to the afterlife. Followers called Nightfallen perform funeral rites. Sacred wood birch; symbol black cloth and hollow orb." },
            new God { Id = 9,  Name = "Xo",      Tier = "Primal", PrimaryDomain = "Mercy",  IsActive = true,  Description = "Three-eyed patron of mercy, charity, and the desperate. Favored by the poor but no respecter of rank. Sacred wood chestnut; symbol three-eyed female humanoid." }
        );
        // Maru tier (2) — dead/lost primordials
        modelBuilder.Entity<God>().HasData(
            new God { Id = 10, Name = "Kith Miir", Tier = "Maru", PrimaryDomain = "Magic, Justice, Retribution", IsActive = false, Description = "The Loyal. Sacrificed themselves to obliterate those who betrayed Malthana, creating the magical plane. Patron of magic. Rumored not to be truly dead. Sacred wood yew." },
            new God { Id = 11, Name = "Malthana",  Tier = "Maru", PrimaryDomain = "Law, Time, Existence",        IsActive = false, Description = "The First Creator and first Primal. Created existence and the divine plane. Murdered by the Unholy Tetrad. Still has followers who believe they will be reborn until Malthana returns. Symbol 4-pointed star with black eye." }
        );
        // Chadarim tier (30)
        modelBuilder.Entity<God>().HasData(
            new God { Id = 12, Name = "Daine",  Tier = "Chadarim", PrimaryDomain = "Passionate love, romance",             IsActive = true },
            new God { Id = 13, Name = "Khora",  Tier = "Chadarim", PrimaryDomain = "Music, song, revelry",                 IsActive = true },
            new God { Id = 14, Name = "Beran",  Tier = "Chadarim", PrimaryDomain = "Hearth, home, hospitality",            IsActive = true },
            new God { Id = 15, Name = "Liora",  Tier = "Chadarim", PrimaryDomain = "Beauty, adornment, grace",             IsActive = true },
            new God { Id = 16, Name = "Toesin", Tier = "Chadarim", PrimaryDomain = "Planar travel, wayfinding, thresholds",IsActive = true },
            new God { Id = 17, Name = "Hadrik", Tier = "Chadarim", PrimaryDomain = "Trade, wealth, bargains",              IsActive = true },
            new God { Id = 18, Name = "Talen",  Tier = "Chadarim", PrimaryDomain = "Roads, travel",                        IsActive = true },
            new God { Id = 19, Name = "Rovan",  Tier = "Chadarim", PrimaryDomain = "Games, wagers, risk",                  IsActive = true },
            new God { Id = 20, Name = "Meren",  Tier = "Chadarim", PrimaryDomain = "Grief, mourning, lament",              IsActive = true },
            new God { Id = 21, Name = "Orren",  Tier = "Chadarim", PrimaryDomain = "Tombs, ancestors, grave-memory",       IsActive = true },
            new God { Id = 22, Name = "Vael",   Tier = "Chadarim", PrimaryDomain = "Endings, decline, the last hour",      IsActive = true },
            new God { Id = 23, Name = "Shaada", Tier = "Chadarim", PrimaryDomain = "Animals",                              IsActive = true, Description = "Takes form of a red deer; messenger of Aumma." },
            new God { Id = 24, Name = "Nydara", Tier = "Chadarim", PrimaryDomain = "Creatures of the water",               IsActive = true },
            new God { Id = 25, Name = "Veyra",  Tier = "Chadarim", PrimaryDomain = "Harvest, orchards, granaries",         IsActive = true },
            new God { Id = 26, Name = "Corrik", Tier = "Chadarim", PrimaryDomain = "Craft, smithing, making",              IsActive = true },
            new God { Id = 27, Name = "Maira",  Tier = "Chadarim", PrimaryDomain = "Sea, sailors, storms",                 IsActive = true },
            new God { Id = 28, Name = "Halen",  Tier = "Chadarim", PrimaryDomain = "Herbs, gardens, growing things",       IsActive = true },
            new God { Id = 29, Name = "Selen",  Tier = "Chadarim", PrimaryDomain = "Shelter, refuge, sanctuary for the ruined", IsActive = true },
            new God { Id = 30, Name = "Dovar",  Tier = "Chadarim", PrimaryDomain = "Rest, sleep, reprieve",                IsActive = true },
            new God { Id = 31, Name = "Pellan", Tier = "Chadarim", PrimaryDomain = "Alms, charity, humble giving",         IsActive = true },
            new God { Id = 32, Name = "Ivera",  Tier = "Chadarim", PrimaryDomain = "Confession, forgiveness, release from shame", IsActive = true },
            new God { Id = 33, Name = "Varren", Tier = "Chadarim", PrimaryDomain = "Vigor, appetite, strength, bodily drive", IsActive = true },
            new God { Id = 34, Name = "Ghozen", Tier = "Chadarim", PrimaryDomain = "Emotion",                              IsActive = true, Description = "Followers called Ghozites, sell emotional \"glass\"." },
            new God { Id = 35, Name = "Elar",   Tier = "Chadarim", PrimaryDomain = "Sanctity, devotion, holy presence",    IsActive = true },
            new God { Id = 36, Name = "Sovar",  Tier = "Chadarim", PrimaryDomain = "Reason, judgment, clear thought",      IsActive = true },
            new God { Id = 37, Name = "Orist",  Tier = "Chadarim", PrimaryDomain = "Truth, witness, oaths",                IsActive = true },
            new God { Id = 38, Name = "Keorin", Tier = "Chadarim", PrimaryDomain = "Knowledge, memory, records",           IsActive = true },
            new God { Id = 39, Name = "Soren",  Tier = "Chadarim", PrimaryDomain = "Confusion, false trails, broken meanings", IsActive = true },
            new God { Id = 40, Name = "Nethra", Tier = "Chadarim", PrimaryDomain = "Emptiness, absence, erasure",          IsActive = true },
            new God { Id = 41, Name = "Velis",  Tier = "Chadarim", PrimaryDomain = "Veils, secrecy, masks, hidden selves", IsActive = true }
        );
        // Amadí tier (12) — exist but worship is heretical
        modelBuilder.Entity<God>().HasData(
            new God { Id = 42, Name = "Aesith",  Tier = "Amadí", PrimaryDomain = "Blood magic, treachery",                             IsActive = true },
            new God { Id = 43, Name = "Est",     Tier = "Amadí", PrimaryDomain = "Betrayal, power",                                    IsActive = true, Description = "Four-horned demon god." },
            new God { Id = 44, Name = "Jian'Tu", Tier = "Amadí", PrimaryDomain = "Death, blood, nobility",                             IsActive = true, Description = "Nearly forgotten elder god." },
            new God { Id = 45, Name = "Makuur",  Tier = "Amadí", PrimaryDomain = "Disease, plague, curses",                            IsActive = true, Description = "Followers sew curse patterns into skin." },
            new God { Id = 46, Name = "Noeth",   Tier = "Amadí", PrimaryDomain = "Murder, shadow",                                     IsActive = true, Description = "Patron of assassins." },
            new God { Id = 47, Name = "Oenith",  Tier = "Amadí", PrimaryDomain = "Battle, war",                                        IsActive = true, Description = "Worshipped by Krell tribes; horned bear god." },
            new God { Id = 48, Name = "Draevor", Tier = "Amadí", PrimaryDomain = "Tyranny, fear, cruel dominion",                      IsActive = true },
            new God { Id = 49, Name = "Vesketh", Tier = "Amadí", PrimaryDomain = "Fraud, avarice, false measures",                     IsActive = true },
            new God { Id = 50, Name = "Errost",  Tier = "Amadí", PrimaryDomain = "Ambition, power",                                    IsActive = true, Description = "One of the Unholy Tetrad." },
            new God { Id = 51, Name = "Akamuur", Tier = "Amadí", PrimaryDomain = "Heavenly light, mystery",                            IsActive = true, Description = "One of the Unholy Tetrad." },
            new God { Id = 52, Name = "Graydin", Tier = "Amadí", PrimaryDomain = "Comradery",                                          IsActive = true, Description = "One of the Unholy Tetrad; god of fellowship who betrayed." },
            new God { Id = 53, Name = "Sinde",   Tier = "Amadí", PrimaryDomain = "Light and glory",                                    IsActive = true, Description = "One of the Unholy Tetrad; fragment rumored to have reformed through a godstone beneath the Black Lake." }
        );

        // ── Seed Skills ───────────────────────────────────────────
        // Arcane (IDs 1–4)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 1,  Name = "Arcane Discipline", Category = "Arcane", Trained = true,  XpCost = 20, CoreAttribute = "Composure" },
            new Skill { Id = 2,  Name = "Arcane Mastery",    Category = "Arcane", Trained = true,  XpCost = 20, CoreAttribute = "Intelligence" },
            new Skill { Id = 3,  Name = "Arcane Sight",      Category = "Arcane", Trained = true,  XpCost = 20, CoreAttribute = "6th Sense" },
            new Skill { Id = 4,  Name = "Arcane Endurance",  Category = "Arcane", Trained = true,  XpCost = 20, CoreAttribute = "Constitution" }
        );
        // Communication (IDs 5–22)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 5,  Name = "Cajole",          Category = "Communication", Trained = false, XpCost = 8,  CoreAttribute = "Sagacity" },
            new Skill { Id = 6,  Name = "Charm",           Category = "Communication", Trained = false, XpCost = 10, CoreAttribute = "Charisma" },
            new Skill { Id = 7,  Name = "Debate",          Category = "Communication", Trained = false, XpCost = 12, CoreAttribute = "Charisma" },
            new Skill { Id = 8,  Name = "Deceive",         Category = "Communication", Trained = false, XpCost = 6,  CoreAttribute = "Composure" },
            new Skill { Id = 9,  Name = "Etiquette",       Category = "Communication", Trained = true,  XpCost = 6,  CoreAttribute = "Sagacity" },
            new Skill { Id = 10, Name = "Humor",           Category = "Communication", Trained = false, XpCost = 12, CoreAttribute = "Charisma" },
            new Skill { Id = 11, Name = "Impress",         Category = "Communication", Trained = false, XpCost = 8,  CoreAttribute = "Charisma" },
            new Skill { Id = 12, Name = "Interpret",       Category = "Communication", Trained = false, XpCost = 12, CoreAttribute = "Sagacity" },
            new Skill { Id = 13, Name = "Intimidate",      Category = "Communication", Trained = false, XpCost = 5,  CoreAttribute = "Stature" },
            new Skill { Id = 14, Name = "Oration",         Category = "Communication", Trained = true,  XpCost = 8,  CoreAttribute = "Intelligence" },
            new Skill { Id = 15, Name = "Persuade",        Category = "Communication", Trained = false, XpCost = 6,  CoreAttribute = "Sagacity" },
            new Skill { Id = 16, Name = "Preaching",       Category = "Communication", Trained = false, XpCost = 6,  CoreAttribute = "Charisma" },
            new Skill { Id = 17, Name = "Public Speaking", Category = "Communication", Trained = false, XpCost = 8,  CoreAttribute = "Charisma" },
            new Skill { Id = 18, Name = "Seduce",          Category = "Communication", Trained = false, XpCost = 4,  CoreAttribute = "Beauty" },
            new Skill { Id = 19, Name = "Storytelling",    Category = "Communication", Trained = false, XpCost = 8,  CoreAttribute = "Charisma" },
            new Skill { Id = 20, Name = "Streetwise",      Category = "Communication", Trained = true,  XpCost = 5,  CoreAttribute = "Sagacity" },
            new Skill { Id = 21, Name = "Teaching",        Category = "Communication", Trained = false, XpCost = 12, CoreAttribute = "Sagacity" },
            new Skill { Id = 22, Name = "Threaten",        Category = "Communication", Trained = false, XpCost = 5,  CoreAttribute = "Stature" }
        );
        // Knowledge (IDs 23–56)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 23, Name = "Architecture",            Category = "Knowledge", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 24, Name = "Astronomy",               Category = "Knowledge", Trained = true,  XpCost = 4,  CoreAttribute = null },
            new Skill { Id = 25, Name = "Bureaucracy",             Category = "Knowledge", Trained = true,  XpCost = 6,  CoreAttribute = "Intelligence" },
            new Skill { Id = 26, Name = "Business and Economics",  Category = "Knowledge", Trained = true,  XpCost = 3,  CoreAttribute = "Intelligence" },
            new Skill { Id = 27, Name = "Diplomacy",               Category = "Knowledge", Trained = true,  XpCost = 8,  CoreAttribute = "Charisma" },
            new Skill { Id = 28, Name = "Engineering",             Category = "Knowledge", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 29, Name = "Heraldry",                Category = "Knowledge", Trained = true,  XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 30, Name = "Legal Knowledge",         Category = "Knowledge", Trained = true,  XpCost = 10, CoreAttribute = "Intelligence" },
            new Skill { Id = 31, Name = "Literature",              Category = "Knowledge", Trained = true,  XpCost = 4,  CoreAttribute = null },
            new Skill { Id = 32, Name = "Lore: Animal",            Category = "Knowledge", Trained = false, XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 33, Name = "Lore: Creature",          Category = "Knowledge", Trained = false, XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 34, Name = "Lore: Folklore",          Category = "Knowledge", Trained = false, XpCost = 2,  CoreAttribute = "Intelligence" },
            new Skill { Id = 35, Name = "Lore: Locations",         Category = "Knowledge", Trained = false, XpCost = 8,  CoreAttribute = "Intelligence" },
            new Skill { Id = 36, Name = "Lore: Magic",             Category = "Knowledge", Trained = true,  XpCost = 8,  CoreAttribute = "Intelligence" },
            new Skill { Id = 37, Name = "Lore: Organizations",     Category = "Knowledge", Trained = false, XpCost = 5,  CoreAttribute = "Intelligence" },
            new Skill { Id = 38, Name = "Lore: People",            Category = "Knowledge", Trained = false, XpCost = 10, CoreAttribute = "Intelligence" },
            new Skill { Id = 39, Name = "Lore: Plants and Herbs",  Category = "Knowledge", Trained = false, XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 40, Name = "Lore: Religious",         Category = "Knowledge", Trained = false, XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 41, Name = "Mathematics",             Category = "Knowledge", Trained = false, XpCost = 5,  CoreAttribute = "Intelligence" },
            new Skill { Id = 42, Name = "Mineralogy",              Category = "Knowledge", Trained = true,  XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 43, Name = "Poetry",                  Category = "Knowledge", Trained = false, XpCost = 4,  CoreAttribute = null },
            new Skill { Id = 44, Name = "Read/Write Coimhthíoch",  Category = "Knowledge", Trained = true,  XpCost = 14, CoreAttribute = "Intelligence" },
            new Skill { Id = 45, Name = "Read/Write Críonna",      Category = "Knowledge", Trained = true,  XpCost = 14, CoreAttribute = "Intelligence" },
            new Skill { Id = 46, Name = "Read/Write Gorett",       Category = "Knowledge", Trained = true,  XpCost = 14, CoreAttribute = "Intelligence" },
            new Skill { Id = 47, Name = "Read/Write Issine Teanga",Category = "Knowledge", Trained = true,  XpCost = 14, CoreAttribute = "Intelligence" },
            new Skill { Id = 48, Name = "Read/Write Malthan",      Category = "Knowledge", Trained = true,  XpCost = 14, CoreAttribute = "Intelligence" },
            new Skill { Id = 49, Name = "Sign Language",           Category = "Knowledge", Trained = true,  XpCost = 4,  CoreAttribute = null },
            new Skill { Id = 50, Name = "Speak Aoten",             Category = "Knowledge", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 51, Name = "Speak Coimhthíoch",       Category = "Knowledge", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 52, Name = "Speak Críonna",           Category = "Knowledge", Trained = false, XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 53, Name = "Speak Frellic",           Category = "Knowledge", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 54, Name = "Speak Issine Teanga",     Category = "Knowledge", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 55, Name = "Speak Krell",             Category = "Knowledge", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 56, Name = "World History",           Category = "Knowledge", Trained = false, XpCost = 3,  CoreAttribute = "Intelligence" }
        );
        // Military and Survival (IDs 57–82)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 57, Name = "Blind Fighting",   Category = "Military and Survival", Trained = false, XpCost = 12, CoreAttribute = "Hearing" },
            new Skill { Id = 58, Name = "Conceal",          Category = "Military and Survival", Trained = false, XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 59, Name = "Cryptography",     Category = "Military and Survival", Trained = true,  XpCost = 12, CoreAttribute = "Intelligence" },
            new Skill { Id = 60, Name = "Disguise",         Category = "Military and Survival", Trained = false, XpCost = 4,  CoreAttribute = "Agility" },
            new Skill { Id = 61, Name = "Espionage",        Category = "Military and Survival", Trained = false, XpCost = 8,  CoreAttribute = "Sagacity" },
            new Skill { Id = 62, Name = "First Aid",        Category = "Military and Survival", Trained = false, XpCost = 8,  CoreAttribute = "Composure" },
            new Skill { Id = 63, Name = "Forgery",          Category = "Military and Survival", Trained = true,  XpCost = 6,  CoreAttribute = "Agility" },
            new Skill { Id = 64, Name = "Gather Information",Category = "Military and Survival", Trained = false, XpCost = 4,  CoreAttribute = "Sagacity" },
            new Skill { Id = 65, Name = "Gather Intel",     Category = "Military and Survival", Trained = true,  XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 66, Name = "Horsemanship",     Category = "Military and Survival", Trained = false, XpCost = 6,  CoreAttribute = "Agility" },
            new Skill { Id = 67, Name = "Impersonation",    Category = "Military and Survival", Trained = false, XpCost = 7,  CoreAttribute = "Stature" },
            new Skill { Id = 68, Name = "Interrogation",    Category = "Military and Survival", Trained = true,  XpCost = 4,  CoreAttribute = "Stature" },
            new Skill { Id = 69, Name = "Investigation",    Category = "Military and Survival", Trained = false, XpCost = 6,  CoreAttribute = "Sagacity" },
            new Skill { Id = 70, Name = "Land Navigation",  Category = "Military and Survival", Trained = false, XpCost = 4,  CoreAttribute = "Sagacity" },
            new Skill { Id = 71, Name = "Lip Reading",      Category = "Military and Survival", Trained = true,  XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 72, Name = "Lock Picking",     Category = "Military and Survival", Trained = true,  XpCost = 4,  CoreAttribute = "Agility" },
            new Skill { Id = 73, Name = "Military Law",     Category = "Military and Survival", Trained = true,  XpCost = 6,  CoreAttribute = "Intelligence" },
            new Skill { Id = 74, Name = "Naval Navigation", Category = "Military and Survival", Trained = true,  XpCost = 5,  CoreAttribute = "Intelligence" },
            new Skill { Id = 75, Name = "Observation",      Category = "Military and Survival", Trained = false, XpCost = 4,  CoreAttribute = "Sight" },
            new Skill { Id = 76, Name = "Pick Pocket",      Category = "Military and Survival", Trained = true,  XpCost = 4,  CoreAttribute = "Agility" },
            new Skill { Id = 77, Name = "Poisons",          Category = "Military and Survival", Trained = true,  XpCost = 6,  CoreAttribute = "Intelligence" },
            new Skill { Id = 78, Name = "Siege Craft",      Category = "Military and Survival", Trained = true,  XpCost = 10, CoreAttribute = "Intelligence" },
            new Skill { Id = 79, Name = "Stealth",          Category = "Military and Survival", Trained = false, XpCost = 6,  CoreAttribute = "Agility" },
            new Skill { Id = 80, Name = "Survival",         Category = "Military and Survival", Trained = false, XpCost = 6,  CoreAttribute = "Intelligence" },
            new Skill { Id = 81, Name = "Tracking",         Category = "Military and Survival", Trained = true,  XpCost = 6,  CoreAttribute = "Sagacity" },
            new Skill { Id = 82, Name = "Traps",            Category = "Military and Survival", Trained = true,  XpCost = 5,  CoreAttribute = "Sagacity" }
        );
        // Physical (IDs 83–94)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 83, Name = "Acrobatics",      Category = "Physical", Trained = false, XpCost = 8,  CoreAttribute = "Agility" },
            new Skill { Id = 84, Name = "Acting",          Category = "Physical", Trained = false, XpCost = 6,  CoreAttribute = "Composure" },
            new Skill { Id = 85, Name = "Calligraphy",     Category = "Physical", Trained = false, XpCost = 6,  CoreAttribute = "Agility" },
            new Skill { Id = 86, Name = "Climbing",        Category = "Physical", Trained = false, XpCost = 3,  CoreAttribute = "Strength" },
            new Skill { Id = 87, Name = "Composing",       Category = "Physical", Trained = true,  XpCost = 12, CoreAttribute = "Hearing" },
            new Skill { Id = 88, Name = "Dance",           Category = "Physical", Trained = false, XpCost = 6,  CoreAttribute = "Agility" },
            new Skill { Id = 89, Name = "Drawing",         Category = "Physical", Trained = true,  XpCost = 12, CoreAttribute = "Agility" },
            new Skill { Id = 90, Name = "Mime",            Category = "Physical", Trained = false, XpCost = 4,  CoreAttribute = "Agility" },
            new Skill { Id = 91, Name = "Painting",        Category = "Physical", Trained = true,  XpCost = 12, CoreAttribute = "Agility" },
            new Skill { Id = 92, Name = "Play Instrument", Category = "Physical", Trained = true,  XpCost = 10, CoreAttribute = "Agility" },
            new Skill { Id = 93, Name = "Singing",         Category = "Physical", Trained = true,  XpCost = 10, CoreAttribute = "Stature" },
            new Skill { Id = 94, Name = "Swimming",        Category = "Physical", Trained = false, XpCost = 4,  CoreAttribute = "Strength" }
        );
        // Trade (IDs 95–126)
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 95,  Name = "Animal Husbandry",  Category = "Trade", Trained = true,  XpCost = 4,  CoreAttribute = "Sagacity" },
            new Skill { Id = 96,  Name = "Appraise Art",      Category = "Trade", Trained = true,  XpCost = 8,  CoreAttribute = "Intelligence" },
            new Skill { Id = 97,  Name = "Appraise Gear",     Category = "Trade", Trained = false, XpCost = 3,  CoreAttribute = "Intelligence" },
            new Skill { Id = 98,  Name = "Appraise Valuables",Category = "Trade", Trained = false, XpCost = 4,  CoreAttribute = "Intelligence" },
            new Skill { Id = 99,  Name = "Blacksmith",        Category = "Trade", Trained = true,  XpCost = 12, CoreAttribute = "Strength" },
            new Skill { Id = 100, Name = "Brewing",           Category = "Trade", Trained = true,  XpCost = 6,  CoreAttribute = "Sagacity" },
            new Skill { Id = 101, Name = "Carpentry",         Category = "Trade", Trained = true,  XpCost = 8,  CoreAttribute = "Agility" },
            new Skill { Id = 102, Name = "Cartography",       Category = "Trade", Trained = true,  XpCost = 8,  CoreAttribute = "Intelligence" },
            new Skill { Id = 103, Name = "Construction",      Category = "Trade", Trained = true,  XpCost = 7,  CoreAttribute = "Constitution" },
            new Skill { Id = 104, Name = "Cooking",           Category = "Trade", Trained = true,  XpCost = 5,  CoreAttribute = "Taste" },
            new Skill { Id = 105, Name = "Dowsing",           Category = "Trade", Trained = false, XpCost = 2,  CoreAttribute = "Sixth Sense" },
            new Skill { Id = 106, Name = "Falconry",          Category = "Trade", Trained = true,  XpCost = 5,  CoreAttribute = "Composure" },
            new Skill { Id = 107, Name = "Farming",           Category = "Trade", Trained = true,  XpCost = 3,  CoreAttribute = "Constitution" },
            new Skill { Id = 108, Name = "Fishing",           Category = "Trade", Trained = true,  XpCost = 2,  CoreAttribute = "Sagacity" },
            new Skill { Id = 109, Name = "Gambling",          Category = "Trade", Trained = false, XpCost = 4,  CoreAttribute = "Luck" },
            new Skill { Id = 110, Name = "Healing",           Category = "Trade", Trained = true,  XpCost = 8,  CoreAttribute = "Sagacity" },
            new Skill { Id = 111, Name = "Holistic Medicine", Category = "Trade", Trained = true,  XpCost = 6,  CoreAttribute = "Sixth Sense" },
            new Skill { Id = 112, Name = "Juggling",          Category = "Trade", Trained = false, XpCost = 3,  CoreAttribute = "Agility" },
            new Skill { Id = 113, Name = "Leather Working",   Category = "Trade", Trained = true,  XpCost = 6,  CoreAttribute = "Agility" },
            new Skill { Id = 114, Name = "Masonry",           Category = "Trade", Trained = true,  XpCost = 5,  CoreAttribute = "Agility" },
            new Skill { Id = 115, Name = "Mining",            Category = "Trade", Trained = true,  XpCost = 3,  CoreAttribute = "Strength" },
            new Skill { Id = 116, Name = "Pottery/Sculpting", Category = "Trade", Trained = true,  XpCost = 6,  CoreAttribute = "Agility" },
            new Skill { Id = 117, Name = "Research",          Category = "Trade", Trained = false, XpCost = 5,  CoreAttribute = "Intelligence" },
            new Skill { Id = 118, Name = "Rope Works",        Category = "Trade", Trained = false, XpCost = 4,  CoreAttribute = "Sagacity" },
            new Skill { Id = 119, Name = "Sailing",           Category = "Trade", Trained = true,  XpCost = 8,  CoreAttribute = "Sagacity" },
            new Skill { Id = 120, Name = "Sewing",            Category = "Trade", Trained = true,  XpCost = 3,  CoreAttribute = "Agility" },
            new Skill { Id = 121, Name = "Shipbuilding",      Category = "Trade", Trained = true,  XpCost = 8,  CoreAttribute = "Intelligence" },
            new Skill { Id = 122, Name = "Street Magic",      Category = "Trade", Trained = true,  XpCost = 4,  CoreAttribute = "Agility" },
            new Skill { Id = 123, Name = "Surgery",           Category = "Trade", Trained = true,  XpCost = 15, CoreAttribute = "Composure" },
            new Skill { Id = 124, Name = "Trap and Skin",     Category = "Trade", Trained = true,  XpCost = 6,  CoreAttribute = "Sagacity" },
            new Skill { Id = 125, Name = "Ventriloquism",     Category = "Trade", Trained = false, XpCost = 6,  CoreAttribute = "Stature" },
            new Skill { Id = 126, Name = "Wood Working",      Category = "Trade", Trained = true,  XpCost = 7,  CoreAttribute = "Agility" }
        );

        // ── Seed ShopItems ────────────────────────────────────────
        // Armor (IDs 1–26)
        modelBuilder.Entity<ShopItem>().HasData(
            new ShopItem { Id = 1,  Name = "Breastplate",           Category = "Armor", BaseCostTin = 2500 },
            new ShopItem { Id = 2,  Name = "Full Plate",            Category = "Armor", BaseCostTin = 10000 },
            new ShopItem { Id = 3,  Name = "Gambeson",              Category = "Armor", BaseCostTin = 450 },
            new ShopItem { Id = 4,  Name = "Heavy Plate",           Category = "Armor", BaseCostTin = 13000 },
            new ShopItem { Id = 5,  Name = "Leather Armor",         Category = "Armor", BaseCostTin = 150 },
            new ShopItem { Id = 6,  Name = "Mail",                  Category = "Armor", BaseCostTin = 5500 },
            new ShopItem { Id = 7,  Name = "Reinforced Leather",    Category = "Armor", BaseCostTin = 1300 },
            new ShopItem { Id = 8,  Name = "Reinforced Mail",       Category = "Armor", BaseCostTin = 7200 },
            new ShopItem { Id = 9,  Name = "Armet Helm",            Category = "Armor", BaseCostTin = 1400 },
            new ShopItem { Id = 10, Name = "Barbute",               Category = "Armor", BaseCostTin = 900 },
            new ShopItem { Id = 11, Name = "Bascinet",              Category = "Armor", BaseCostTin = 1000 },
            new ShopItem { Id = 12, Name = "Cervelliere",           Category = "Armor", BaseCostTin = 600 },
            new ShopItem { Id = 13, Name = "Close Helmet",          Category = "Armor", BaseCostTin = 1500 },
            new ShopItem { Id = 14, Name = "Great Helm",            Category = "Armor", BaseCostTin = 1300 },
            new ShopItem { Id = 15, Name = "Leather Cap",           Category = "Armor", BaseCostTin = 400 },
            new ShopItem { Id = 16, Name = "Mail Coif",             Category = "Armor", BaseCostTin = 900 },
            new ShopItem { Id = 17, Name = "Nasal Helmet",          Category = "Armor", BaseCostTin = 800 },
            new ShopItem { Id = 18, Name = "Sallet",                Category = "Armor", BaseCostTin = 1400 },
            new ShopItem { Id = 19, Name = "Small Wooden Shield",   Category = "Armor", BaseCostTin = 70 },
            new ShopItem { Id = 20, Name = "Small Leather Shield",  Category = "Armor", BaseCostTin = 120 },
            new ShopItem { Id = 21, Name = "Small Reinforced Shield",Category = "Armor", BaseCostTin = 480 },
            new ShopItem { Id = 22, Name = "Small Metal Shield",    Category = "Armor", BaseCostTin = 1350 },
            new ShopItem { Id = 23, Name = "Large Wooden Shield",   Category = "Armor", BaseCostTin = 250 },
            new ShopItem { Id = 24, Name = "Large Leather Shield",  Category = "Armor", BaseCostTin = 375 },
            new ShopItem { Id = 25, Name = "Large Reinforced Shield",Category = "Armor", BaseCostTin = 850 },
            new ShopItem { Id = 26, Name = "Large Metal Shield",    Category = "Armor", BaseCostTin = 2500 }
        );
        // Weapons (IDs 27–64)
        modelBuilder.Entity<ShopItem>().HasData(
            new ShopItem { Id = 27, Name = "Bastard Sword",          Category = "Weapons", BaseCostTin = 500 },
            new ShopItem { Id = 28, Name = "Battleaxe",              Category = "Weapons", BaseCostTin = 400 },
            new ShopItem { Id = 29, Name = "Club",                   Category = "Weapons", BaseCostTin = 100 },
            new ShopItem { Id = 30, Name = "Crossbow Heavy",         Category = "Weapons", BaseCostTin = 800 },
            new ShopItem { Id = 31, Name = "Crossbow Light",         Category = "Weapons", BaseCostTin = 600 },
            new ShopItem { Id = 32, Name = "Dagger",                 Category = "Weapons", BaseCostTin = 100 },
            new ShopItem { Id = 33, Name = "Estoc",                  Category = "Weapons", BaseCostTin = 550 },
            new ShopItem { Id = 34, Name = "Glaive",                 Category = "Weapons", BaseCostTin = 400 },
            new ShopItem { Id = 35, Name = "Greataxe",               Category = "Weapons", BaseCostTin = 550 },
            new ShopItem { Id = 36, Name = "Greatsword",             Category = "Weapons", BaseCostTin = 900 },
            new ShopItem { Id = 37, Name = "Halberd",                Category = "Weapons", BaseCostTin = 475 },
            new ShopItem { Id = 38, Name = "Handaxe",                Category = "Weapons", BaseCostTin = 200 },
            new ShopItem { Id = 39, Name = "Heavy Lance",            Category = "Weapons", BaseCostTin = 600 },
            new ShopItem { Id = 40, Name = "Longbow",                Category = "Weapons", BaseCostTin = 700 },
            new ShopItem { Id = 41, Name = "Longsword",              Category = "Weapons", BaseCostTin = 550 },
            new ShopItem { Id = 42, Name = "Mace",                   Category = "Weapons", BaseCostTin = 400 },
            new ShopItem { Id = 43, Name = "Morningstar",            Category = "Weapons", BaseCostTin = 400 },
            new ShopItem { Id = 44, Name = "Pike",                   Category = "Weapons", BaseCostTin = 450 },
            new ShopItem { Id = 45, Name = "Quarterstaff",           Category = "Weapons", BaseCostTin = 300 },
            new ShopItem { Id = 46, Name = "Rapier",                 Category = "Weapons", BaseCostTin = 400 },
            new ShopItem { Id = 47, Name = "Scimitar",               Category = "Weapons", BaseCostTin = 350 },
            new ShopItem { Id = 48, Name = "Shortbow",               Category = "Weapons", BaseCostTin = 300 },
            new ShopItem { Id = 49, Name = "Short Sword",            Category = "Weapons", BaseCostTin = 400 },
            new ShopItem { Id = 50, Name = "Sling",                  Category = "Weapons", BaseCostTin = 100 },
            new ShopItem { Id = 51, Name = "Spear",                  Category = "Weapons", BaseCostTin = 350 },
            new ShopItem { Id = 52, Name = "War Hammer",             Category = "Weapons", BaseCostTin = 400 },
            new ShopItem { Id = 53, Name = "Bolt Heavy Leaf",        Category = "Weapons", BaseCostTin = 25 },
            new ShopItem { Id = 54, Name = "Bolt Heavy Quarrel",     Category = "Weapons", BaseCostTin = 35 },
            new ShopItem { Id = 55, Name = "Bolt Heavy Plate-Cutter",Category = "Weapons", BaseCostTin = 70 },
            new ShopItem { Id = 56, Name = "Bolt Light Leaf",        Category = "Weapons", BaseCostTin = 20 },
            new ShopItem { Id = 57, Name = "Bolt Light Quarrel",     Category = "Weapons", BaseCostTin = 20 },
            new ShopItem { Id = 58, Name = "Arrow Long Leaf",        Category = "Weapons", BaseCostTin = 25 },
            new ShopItem { Id = 59, Name = "Arrow Long Bodkin",      Category = "Weapons", BaseCostTin = 35 },
            new ShopItem { Id = 60, Name = "Arrow Short Leaf",       Category = "Weapons", BaseCostTin = 20 },
            new ShopItem { Id = 61, Name = "Arrow Short Bodkin",     Category = "Weapons", BaseCostTin = 30 },
            new ShopItem { Id = 62, Name = "Sling Stone",            Category = "Weapons", BaseCostTin = 5 },
            new ShopItem { Id = 63, Name = "Sling Heavy Stone",      Category = "Weapons", BaseCostTin = 5 },
            new ShopItem { Id = 64, Name = "Sling Piercing Lead",    Category = "Weapons", BaseCostTin = 10 }
        );
        // Metals — per lb (IDs 65–76)
        modelBuilder.Entity<ShopItem>().HasData(
            new ShopItem { Id = 65, Name = "Lead",      Category = "Metals — per lb", BaseCostTin = 1.5m },
            new ShopItem { Id = 66, Name = "Iron",      Category = "Metals — per lb", BaseCostTin = 2m },
            new ShopItem { Id = 67, Name = "Steel",     Category = "Metals — per lb", BaseCostTin = 5m },
            new ShopItem { Id = 68, Name = "Tin",       Category = "Metals — per lb", BaseCostTin = 8m },
            new ShopItem { Id = 69, Name = "Brass",     Category = "Metals — per lb", BaseCostTin = 9m },
            new ShopItem { Id = 70, Name = "Copper",    Category = "Metals — per lb", BaseCostTin = 10m },
            new ShopItem { Id = 71, Name = "Bronze",    Category = "Metals — per lb", BaseCostTin = 10m },
            new ShopItem { Id = 72, Name = "Pewter",    Category = "Metals — per lb", BaseCostTin = 7m },
            new ShopItem { Id = 73, Name = "Mercury",   Category = "Metals — per lb", BaseCostTin = 12m },
            new ShopItem { Id = 74, Name = "Silver",    Category = "Metals — per lb", BaseCostTin = 220m },
            new ShopItem { Id = 75, Name = "Electrum",  Category = "Metals — per lb", BaseCostTin = 1500m },
            new ShopItem { Id = 76, Name = "Gold",      Category = "Metals — per lb", BaseCostTin = 2200m }
        );
        // Textiles — per sq. yard (IDs 77–86)
        modelBuilder.Entity<ShopItem>().HasData(
            new ShopItem { Id = 77, Name = "Hemp",         Category = "Textiles — per sq. yard", BaseCostTin = 7m },
            new ShopItem { Id = 78, Name = "Canvas",       Category = "Textiles — per sq. yard", BaseCostTin = 8m },
            new ShopItem { Id = 79, Name = "Felt",         Category = "Textiles — per sq. yard", BaseCostTin = 10m },
            new ShopItem { Id = 80, Name = "Linen",        Category = "Textiles — per sq. yard", BaseCostTin = 12m },
            new ShopItem { Id = 81, Name = "Cotton",       Category = "Textiles — per sq. yard", BaseCostTin = 14m },
            new ShopItem { Id = 82, Name = "Fustian",      Category = "Textiles — per sq. yard", BaseCostTin = 15m },
            new ShopItem { Id = 83, Name = "Wool",         Category = "Textiles — per sq. yard", BaseCostTin = 18m },
            new ShopItem { Id = 84, Name = "Leather Soft", Category = "Textiles — per sq. yard", BaseCostTin = 9m },
            new ShopItem { Id = 85, Name = "Leather Hard", Category = "Textiles — per sq. yard", BaseCostTin = 14m },
            new ShopItem { Id = 86, Name = "Silk",         Category = "Textiles — per sq. yard", BaseCostTin = 100m }
        );
    }
}
