using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class LoreAndOrganizations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Gods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Tier = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PrimaryDomain = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Headquarters = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Leader = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Relationship = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Allegiance = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ShopItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BaseCostTin = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    WeightLbs = table.Column<decimal>(type: "numeric(8,3)", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    DefaultMaterial = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Trained = table.Column<bool>(type: "boolean", nullable: false),
                    XpCost = table.Column<int>(type: "integer", nullable: false),
                    CoreAttribute = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Gods",
                columns: new[] { "Id", "Description", "IsActive", "Name", "Notes", "PrimaryDomain", "Tier" },
                values: new object[,]
                {
                    { 1, "Primal of body, fire, and martial transformation. Patron of warriors. Followers are known as Ashborn or Tineiteoir. Primary colors blue and white; sacred wood cherry; symbol blue flame.", true, "Ambrik", null, "Body", "Primal" },
                    { 2, "The Sun Father. God of life, birth, and renewal. Those who die during El are said to walk with Aumma. Sacred wood maple; symbol sun and circles.", true, "Aumma", null, "Life", "Primal" },
                    { 3, "The two-faced god. Governs fate, luck, and reversals. His two aspects El (merciful) and Halbor (cruel) represent fortune's duality. Sacred wood beech; symbol paired faces or coins.", true, "Eaden", null, "Fate", "Primal" },
                    { 4, "The stone-faced god. Governs mind, stoicism, endurance, and emotional control. Followers prize the Eight Pillars of emotional mastery. Sacred wood pine; symbol rocks and dust.", true, "Foeduhn", null, "Mind", "Primal" },
                    { 5, "The trickster god of entropy, chaos, and confusion. Often invoked as ill fortune in death. Sacred wood sycamore; symbol chains and twisted door.", true, "Harmu", null, "Entropy", "Primal" },
                    { 6, "The Second Creator. Goddess of nature, healing, and creation. Created the mortal plane. Her tears created the seas; her breath created healing herbs. Sacred wood oak; symbol spiral, droplet, fern frond.", true, "Iianu", null, "Creation", "Primal" },
                    { 7, "The Blind Maiden, twin of Iianu. Patron of protection, wards, and spirit. Blinded herself to avoid sorrow. Gifted mortals with Iridium. Rinnians are the only source of Iridium items. Sacred wood rowan; symbol holes and tears.", true, "Rin", null, "Spirit", "Primal" },
                    { 8, "The Night Mother. Kind deity who takes the dead to the afterlife. Followers called Nightfallen perform funeral rites. Sacred wood birch; symbol black cloth and hollow orb.", true, "Sorra", null, "Death", "Primal" },
                    { 9, "Three-eyed patron of mercy, charity, and the desperate. Favored by the poor but no respecter of rank. Sacred wood chestnut; symbol three-eyed female humanoid.", true, "Xo", null, "Mercy", "Primal" },
                    { 10, "The Loyal. Sacrificed themselves to obliterate those who betrayed Malthana, creating the magical plane. Patron of magic. Rumored not to be truly dead. Sacred wood yew.", false, "Kith Miir", null, "Magic, Justice, Retribution", "Maru" },
                    { 11, "The First Creator and first Primal. Created existence and the divine plane. Murdered by the Unholy Tetrad. Still has followers who believe they will be reborn until Malthana returns. Symbol 4-pointed star with black eye.", false, "Malthana", null, "Law, Time, Existence", "Maru" },
                    { 12, null, true, "Daine", null, "Passionate love, romance", "Chadarim" },
                    { 13, null, true, "Khora", null, "Music, song, revelry", "Chadarim" },
                    { 14, null, true, "Beran", null, "Hearth, home, hospitality", "Chadarim" },
                    { 15, null, true, "Liora", null, "Beauty, adornment, grace", "Chadarim" },
                    { 16, null, true, "Toesin", null, "Planar travel, wayfinding, thresholds", "Chadarim" },
                    { 17, null, true, "Hadrik", null, "Trade, wealth, bargains", "Chadarim" },
                    { 18, null, true, "Talen", null, "Roads, travel", "Chadarim" },
                    { 19, null, true, "Rovan", null, "Games, wagers, risk", "Chadarim" },
                    { 20, null, true, "Meren", null, "Grief, mourning, lament", "Chadarim" },
                    { 21, null, true, "Orren", null, "Tombs, ancestors, grave-memory", "Chadarim" },
                    { 22, null, true, "Vael", null, "Endings, decline, the last hour", "Chadarim" },
                    { 23, "Takes form of a red deer; messenger of Aumma.", true, "Shaada", null, "Animals", "Chadarim" },
                    { 24, null, true, "Nydara", null, "Creatures of the water", "Chadarim" },
                    { 25, null, true, "Veyra", null, "Harvest, orchards, granaries", "Chadarim" },
                    { 26, null, true, "Corrik", null, "Craft, smithing, making", "Chadarim" },
                    { 27, null, true, "Maira", null, "Sea, sailors, storms", "Chadarim" },
                    { 28, null, true, "Halen", null, "Herbs, gardens, growing things", "Chadarim" },
                    { 29, null, true, "Selen", null, "Shelter, refuge, sanctuary for the ruined", "Chadarim" },
                    { 30, null, true, "Dovar", null, "Rest, sleep, reprieve", "Chadarim" },
                    { 31, null, true, "Pellan", null, "Alms, charity, humble giving", "Chadarim" },
                    { 32, null, true, "Ivera", null, "Confession, forgiveness, release from shame", "Chadarim" },
                    { 33, null, true, "Varren", null, "Vigor, appetite, strength, bodily drive", "Chadarim" },
                    { 34, "Followers called Ghozites, sell emotional \"glass\".", true, "Ghozen", null, "Emotion", "Chadarim" },
                    { 35, null, true, "Elar", null, "Sanctity, devotion, holy presence", "Chadarim" },
                    { 36, null, true, "Sovar", null, "Reason, judgment, clear thought", "Chadarim" },
                    { 37, null, true, "Orist", null, "Truth, witness, oaths", "Chadarim" },
                    { 38, null, true, "Keorin", null, "Knowledge, memory, records", "Chadarim" },
                    { 39, null, true, "Soren", null, "Confusion, false trails, broken meanings", "Chadarim" },
                    { 40, null, true, "Nethra", null, "Emptiness, absence, erasure", "Chadarim" },
                    { 41, null, true, "Velis", null, "Veils, secrecy, masks, hidden selves", "Chadarim" },
                    { 42, null, true, "Aesith", null, "Blood magic, treachery", "Amadí" },
                    { 43, "Four-horned demon god.", true, "Est", null, "Betrayal, power", "Amadí" },
                    { 44, "Nearly forgotten elder god.", true, "Jian'Tu", null, "Death, blood, nobility", "Amadí" },
                    { 45, "Followers sew curse patterns into skin.", true, "Makuur", null, "Disease, plague, curses", "Amadí" },
                    { 46, "Patron of assassins.", true, "Noeth", null, "Murder, shadow", "Amadí" },
                    { 47, "Worshipped by Krell tribes; horned bear god.", true, "Oenith", null, "Battle, war", "Amadí" },
                    { 48, null, true, "Draevor", null, "Tyranny, fear, cruel dominion", "Amadí" },
                    { 49, null, true, "Vesketh", null, "Fraud, avarice, false measures", "Amadí" },
                    { 50, "One of the Unholy Tetrad.", true, "Errost", null, "Ambition, power", "Amadí" },
                    { 51, "One of the Unholy Tetrad.", true, "Akamuur", null, "Heavenly light, mystery", "Amadí" },
                    { 52, "One of the Unholy Tetrad; god of fellowship who betrayed.", true, "Graydin", null, "Comradery", "Amadí" },
                    { 53, "One of the Unholy Tetrad; fragment rumored to have reformed through a godstone beneath the Black Lake.", true, "Sinde", null, "Light and glory", "Amadí" }
                });

            migrationBuilder.InsertData(
                table: "ShopItems",
                columns: new[] { "Id", "BaseCostTin", "Category", "DefaultMaterial", "Description", "Name", "Notes", "WeightLbs" },
                values: new object[,]
                {
                    { 1, 2500m, "Armor", null, null, "Breastplate", null, null },
                    { 2, 10000m, "Armor", null, null, "Full Plate", null, null },
                    { 3, 450m, "Armor", null, null, "Gambeson", null, null },
                    { 4, 13000m, "Armor", null, null, "Heavy Plate", null, null },
                    { 5, 150m, "Armor", null, null, "Leather Armor", null, null },
                    { 6, 5500m, "Armor", null, null, "Mail", null, null },
                    { 7, 1300m, "Armor", null, null, "Reinforced Leather", null, null },
                    { 8, 7200m, "Armor", null, null, "Reinforced Mail", null, null },
                    { 9, 1400m, "Armor", null, null, "Armet Helm", null, null },
                    { 10, 900m, "Armor", null, null, "Barbute", null, null },
                    { 11, 1000m, "Armor", null, null, "Bascinet", null, null },
                    { 12, 600m, "Armor", null, null, "Cervelliere", null, null },
                    { 13, 1500m, "Armor", null, null, "Close Helmet", null, null },
                    { 14, 1300m, "Armor", null, null, "Great Helm", null, null },
                    { 15, 400m, "Armor", null, null, "Leather Cap", null, null },
                    { 16, 900m, "Armor", null, null, "Mail Coif", null, null },
                    { 17, 800m, "Armor", null, null, "Nasal Helmet", null, null },
                    { 18, 1400m, "Armor", null, null, "Sallet", null, null },
                    { 19, 70m, "Armor", null, null, "Small Wooden Shield", null, null },
                    { 20, 120m, "Armor", null, null, "Small Leather Shield", null, null },
                    { 21, 480m, "Armor", null, null, "Small Reinforced Shield", null, null },
                    { 22, 1350m, "Armor", null, null, "Small Metal Shield", null, null },
                    { 23, 250m, "Armor", null, null, "Large Wooden Shield", null, null },
                    { 24, 375m, "Armor", null, null, "Large Leather Shield", null, null },
                    { 25, 850m, "Armor", null, null, "Large Reinforced Shield", null, null },
                    { 26, 2500m, "Armor", null, null, "Large Metal Shield", null, null },
                    { 27, 500m, "Weapons", null, null, "Bastard Sword", null, null },
                    { 28, 400m, "Weapons", null, null, "Battleaxe", null, null },
                    { 29, 100m, "Weapons", null, null, "Club", null, null },
                    { 30, 800m, "Weapons", null, null, "Crossbow Heavy", null, null },
                    { 31, 600m, "Weapons", null, null, "Crossbow Light", null, null },
                    { 32, 100m, "Weapons", null, null, "Dagger", null, null },
                    { 33, 550m, "Weapons", null, null, "Estoc", null, null },
                    { 34, 400m, "Weapons", null, null, "Glaive", null, null },
                    { 35, 550m, "Weapons", null, null, "Greataxe", null, null },
                    { 36, 900m, "Weapons", null, null, "Greatsword", null, null },
                    { 37, 475m, "Weapons", null, null, "Halberd", null, null },
                    { 38, 200m, "Weapons", null, null, "Handaxe", null, null },
                    { 39, 600m, "Weapons", null, null, "Heavy Lance", null, null },
                    { 40, 700m, "Weapons", null, null, "Longbow", null, null },
                    { 41, 550m, "Weapons", null, null, "Longsword", null, null },
                    { 42, 400m, "Weapons", null, null, "Mace", null, null },
                    { 43, 400m, "Weapons", null, null, "Morningstar", null, null },
                    { 44, 450m, "Weapons", null, null, "Pike", null, null },
                    { 45, 300m, "Weapons", null, null, "Quarterstaff", null, null },
                    { 46, 400m, "Weapons", null, null, "Rapier", null, null },
                    { 47, 350m, "Weapons", null, null, "Scimitar", null, null },
                    { 48, 300m, "Weapons", null, null, "Shortbow", null, null },
                    { 49, 400m, "Weapons", null, null, "Short Sword", null, null },
                    { 50, 100m, "Weapons", null, null, "Sling", null, null },
                    { 51, 350m, "Weapons", null, null, "Spear", null, null },
                    { 52, 400m, "Weapons", null, null, "War Hammer", null, null },
                    { 53, 25m, "Weapons", null, null, "Bolt Heavy Leaf", null, null },
                    { 54, 35m, "Weapons", null, null, "Bolt Heavy Quarrel", null, null },
                    { 55, 70m, "Weapons", null, null, "Bolt Heavy Plate-Cutter", null, null },
                    { 56, 20m, "Weapons", null, null, "Bolt Light Leaf", null, null },
                    { 57, 20m, "Weapons", null, null, "Bolt Light Quarrel", null, null },
                    { 58, 25m, "Weapons", null, null, "Arrow Long Leaf", null, null },
                    { 59, 35m, "Weapons", null, null, "Arrow Long Bodkin", null, null },
                    { 60, 20m, "Weapons", null, null, "Arrow Short Leaf", null, null },
                    { 61, 30m, "Weapons", null, null, "Arrow Short Bodkin", null, null },
                    { 62, 5m, "Weapons", null, null, "Sling Stone", null, null },
                    { 63, 5m, "Weapons", null, null, "Sling Heavy Stone", null, null },
                    { 64, 10m, "Weapons", null, null, "Sling Piercing Lead", null, null },
                    { 65, 1.5m, "Metals — per lb", null, null, "Lead", null, null },
                    { 66, 2m, "Metals — per lb", null, null, "Iron", null, null },
                    { 67, 5m, "Metals — per lb", null, null, "Steel", null, null },
                    { 68, 8m, "Metals — per lb", null, null, "Tin", null, null },
                    { 69, 9m, "Metals — per lb", null, null, "Brass", null, null },
                    { 70, 10m, "Metals — per lb", null, null, "Copper", null, null },
                    { 71, 10m, "Metals — per lb", null, null, "Bronze", null, null },
                    { 72, 7m, "Metals — per lb", null, null, "Pewter", null, null },
                    { 73, 12m, "Metals — per lb", null, null, "Mercury", null, null },
                    { 74, 220m, "Metals — per lb", null, null, "Silver", null, null },
                    { 75, 1500m, "Metals — per lb", null, null, "Electrum", null, null },
                    { 76, 2200m, "Metals — per lb", null, null, "Gold", null, null },
                    { 77, 7m, "Textiles — per sq. yard", null, null, "Hemp", null, null },
                    { 78, 8m, "Textiles — per sq. yard", null, null, "Canvas", null, null },
                    { 79, 10m, "Textiles — per sq. yard", null, null, "Felt", null, null },
                    { 80, 12m, "Textiles — per sq. yard", null, null, "Linen", null, null },
                    { 81, 14m, "Textiles — per sq. yard", null, null, "Cotton", null, null },
                    { 82, 15m, "Textiles — per sq. yard", null, null, "Fustian", null, null },
                    { 83, 18m, "Textiles — per sq. yard", null, null, "Wool", null, null },
                    { 84, 9m, "Textiles — per sq. yard", null, null, "Leather Soft", null, null },
                    { 85, 14m, "Textiles — per sq. yard", null, null, "Leather Hard", null, null },
                    { 86, 100m, "Textiles — per sq. yard", null, null, "Silk", null, null }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "Category", "CoreAttribute", "Description", "Name", "Notes", "Trained", "XpCost" },
                values: new object[,]
                {
                    { 1, "Arcane", "Composure", null, "Arcane Discipline", null, true, 20 },
                    { 2, "Arcane", "Intelligence", null, "Arcane Mastery", null, true, 20 },
                    { 3, "Arcane", "6th Sense", null, "Arcane Sight", null, true, 20 },
                    { 4, "Arcane", "Constitution", null, "Arcane Endurance", null, true, 20 },
                    { 5, "Communication", "Sagacity", null, "Cajole", null, false, 8 },
                    { 6, "Communication", "Charisma", null, "Charm", null, false, 10 },
                    { 7, "Communication", "Charisma", null, "Debate", null, false, 12 },
                    { 8, "Communication", "Composure", null, "Deceive", null, false, 6 },
                    { 9, "Communication", "Sagacity", null, "Etiquette", null, true, 6 },
                    { 10, "Communication", "Charisma", null, "Humor", null, false, 12 },
                    { 11, "Communication", "Charisma", null, "Impress", null, false, 8 },
                    { 12, "Communication", "Sagacity", null, "Interpret", null, false, 12 },
                    { 13, "Communication", "Stature", null, "Intimidate", null, false, 5 },
                    { 14, "Communication", "Intelligence", null, "Oration", null, true, 8 },
                    { 15, "Communication", "Sagacity", null, "Persuade", null, false, 6 },
                    { 16, "Communication", "Charisma", null, "Preaching", null, false, 6 },
                    { 17, "Communication", "Charisma", null, "Public Speaking", null, false, 8 },
                    { 18, "Communication", "Beauty", null, "Seduce", null, false, 4 },
                    { 19, "Communication", "Charisma", null, "Storytelling", null, false, 8 },
                    { 20, "Communication", "Sagacity", null, "Streetwise", null, true, 5 },
                    { 21, "Communication", "Sagacity", null, "Teaching", null, false, 12 },
                    { 22, "Communication", "Stature", null, "Threaten", null, false, 5 },
                    { 23, "Knowledge", "Intelligence", null, "Architecture", null, true, 12 },
                    { 24, "Knowledge", null, null, "Astronomy", null, true, 4 },
                    { 25, "Knowledge", "Intelligence", null, "Bureaucracy", null, true, 6 },
                    { 26, "Knowledge", "Intelligence", null, "Business and Economics", null, true, 3 },
                    { 27, "Knowledge", "Charisma", null, "Diplomacy", null, true, 8 },
                    { 28, "Knowledge", "Intelligence", null, "Engineering", null, true, 12 },
                    { 29, "Knowledge", "Intelligence", null, "Heraldry", null, true, 4 },
                    { 30, "Knowledge", "Intelligence", null, "Legal Knowledge", null, true, 10 },
                    { 31, "Knowledge", null, null, "Literature", null, true, 4 },
                    { 32, "Knowledge", "Intelligence", null, "Lore: Animal", null, false, 4 },
                    { 33, "Knowledge", "Intelligence", null, "Lore: Creature", null, false, 4 },
                    { 34, "Knowledge", "Intelligence", null, "Lore: Folklore", null, false, 2 },
                    { 35, "Knowledge", "Intelligence", null, "Lore: Locations", null, false, 8 },
                    { 36, "Knowledge", "Intelligence", null, "Lore: Magic", null, true, 8 },
                    { 37, "Knowledge", "Intelligence", null, "Lore: Organizations", null, false, 5 },
                    { 38, "Knowledge", "Intelligence", null, "Lore: People", null, false, 10 },
                    { 39, "Knowledge", "Intelligence", null, "Lore: Plants and Herbs", null, false, 4 },
                    { 40, "Knowledge", "Intelligence", null, "Lore: Religious", null, false, 4 },
                    { 41, "Knowledge", "Intelligence", null, "Mathematics", null, false, 5 },
                    { 42, "Knowledge", "Intelligence", null, "Mineralogy", null, true, 4 },
                    { 43, "Knowledge", null, null, "Poetry", null, false, 4 },
                    { 44, "Knowledge", "Intelligence", null, "Read/Write Coimhthíoch", null, true, 14 },
                    { 45, "Knowledge", "Intelligence", null, "Read/Write Críonna", null, true, 14 },
                    { 46, "Knowledge", "Intelligence", null, "Read/Write Gorett", null, true, 14 },
                    { 47, "Knowledge", "Intelligence", null, "Read/Write Issine Teanga", null, true, 14 },
                    { 48, "Knowledge", "Intelligence", null, "Read/Write Malthan", null, true, 14 },
                    { 49, "Knowledge", null, null, "Sign Language", null, true, 4 },
                    { 50, "Knowledge", "Intelligence", null, "Speak Aoten", null, true, 12 },
                    { 51, "Knowledge", "Intelligence", null, "Speak Coimhthíoch", null, true, 12 },
                    { 52, "Knowledge", "Intelligence", null, "Speak Críonna", null, false, 12 },
                    { 53, "Knowledge", "Intelligence", null, "Speak Frellic", null, true, 12 },
                    { 54, "Knowledge", "Intelligence", null, "Speak Issine Teanga", null, true, 12 },
                    { 55, "Knowledge", "Intelligence", null, "Speak Krell", null, true, 12 },
                    { 56, "Knowledge", "Intelligence", null, "World History", null, false, 3 },
                    { 57, "Military and Survival", "Hearing", null, "Blind Fighting", null, false, 12 },
                    { 58, "Military and Survival", "Intelligence", null, "Conceal", null, false, 4 },
                    { 59, "Military and Survival", "Intelligence", null, "Cryptography", null, true, 12 },
                    { 60, "Military and Survival", "Agility", null, "Disguise", null, false, 4 },
                    { 61, "Military and Survival", "Sagacity", null, "Espionage", null, false, 8 },
                    { 62, "Military and Survival", "Composure", null, "First Aid", null, false, 8 },
                    { 63, "Military and Survival", "Agility", null, "Forgery", null, true, 6 },
                    { 64, "Military and Survival", "Sagacity", null, "Gather Information", null, false, 4 },
                    { 65, "Military and Survival", "Intelligence", null, "Gather Intel", null, true, 4 },
                    { 66, "Military and Survival", "Agility", null, "Horsemanship", null, false, 6 },
                    { 67, "Military and Survival", "Stature", null, "Impersonation", null, false, 7 },
                    { 68, "Military and Survival", "Stature", null, "Interrogation", null, true, 4 },
                    { 69, "Military and Survival", "Sagacity", null, "Investigation", null, false, 6 },
                    { 70, "Military and Survival", "Sagacity", null, "Land Navigation", null, false, 4 },
                    { 71, "Military and Survival", "Intelligence", null, "Lip Reading", null, true, 4 },
                    { 72, "Military and Survival", "Agility", null, "Lock Picking", null, true, 4 },
                    { 73, "Military and Survival", "Intelligence", null, "Military Law", null, true, 6 },
                    { 74, "Military and Survival", "Intelligence", null, "Naval Navigation", null, true, 5 },
                    { 75, "Military and Survival", "Sight", null, "Observation", null, false, 4 },
                    { 76, "Military and Survival", "Agility", null, "Pick Pocket", null, true, 4 },
                    { 77, "Military and Survival", "Intelligence", null, "Poisons", null, true, 6 },
                    { 78, "Military and Survival", "Intelligence", null, "Siege Craft", null, true, 10 },
                    { 79, "Military and Survival", "Agility", null, "Stealth", null, false, 6 },
                    { 80, "Military and Survival", "Intelligence", null, "Survival", null, false, 6 },
                    { 81, "Military and Survival", "Sagacity", null, "Tracking", null, true, 6 },
                    { 82, "Military and Survival", "Sagacity", null, "Traps", null, true, 5 },
                    { 83, "Physical", "Agility", null, "Acrobatics", null, false, 8 },
                    { 84, "Physical", "Composure", null, "Acting", null, false, 6 },
                    { 85, "Physical", "Agility", null, "Calligraphy", null, false, 6 },
                    { 86, "Physical", "Strength", null, "Climbing", null, false, 3 },
                    { 87, "Physical", "Hearing", null, "Composing", null, true, 12 },
                    { 88, "Physical", "Agility", null, "Dance", null, false, 6 },
                    { 89, "Physical", "Agility", null, "Drawing", null, true, 12 },
                    { 90, "Physical", "Agility", null, "Mime", null, false, 4 },
                    { 91, "Physical", "Agility", null, "Painting", null, true, 12 },
                    { 92, "Physical", "Agility", null, "Play Instrument", null, true, 10 },
                    { 93, "Physical", "Stature", null, "Singing", null, true, 10 },
                    { 94, "Physical", "Strength", null, "Swimming", null, false, 4 },
                    { 95, "Trade", "Sagacity", null, "Animal Husbandry", null, true, 4 },
                    { 96, "Trade", "Intelligence", null, "Appraise Art", null, true, 8 },
                    { 97, "Trade", "Intelligence", null, "Appraise Gear", null, false, 3 },
                    { 98, "Trade", "Intelligence", null, "Appraise Valuables", null, false, 4 },
                    { 99, "Trade", "Strength", null, "Blacksmith", null, true, 12 },
                    { 100, "Trade", "Sagacity", null, "Brewing", null, true, 6 },
                    { 101, "Trade", "Agility", null, "Carpentry", null, true, 8 },
                    { 102, "Trade", "Intelligence", null, "Cartography", null, true, 8 },
                    { 103, "Trade", "Constitution", null, "Construction", null, true, 7 },
                    { 104, "Trade", "Taste", null, "Cooking", null, true, 5 },
                    { 105, "Trade", "Sixth Sense", null, "Dowsing", null, false, 2 },
                    { 106, "Trade", "Composure", null, "Falconry", null, true, 5 },
                    { 107, "Trade", "Constitution", null, "Farming", null, true, 3 },
                    { 108, "Trade", "Sagacity", null, "Fishing", null, true, 2 },
                    { 109, "Trade", "Luck", null, "Gambling", null, false, 4 },
                    { 110, "Trade", "Sagacity", null, "Healing", null, true, 8 },
                    { 111, "Trade", "Sixth Sense", null, "Holistic Medicine", null, true, 6 },
                    { 112, "Trade", "Agility", null, "Juggling", null, false, 3 },
                    { 113, "Trade", "Agility", null, "Leather Working", null, true, 6 },
                    { 114, "Trade", "Agility", null, "Masonry", null, true, 5 },
                    { 115, "Trade", "Strength", null, "Mining", null, true, 3 },
                    { 116, "Trade", "Agility", null, "Pottery/Sculpting", null, true, 6 },
                    { 117, "Trade", "Intelligence", null, "Research", null, false, 5 },
                    { 118, "Trade", "Sagacity", null, "Rope Works", null, false, 4 },
                    { 119, "Trade", "Sagacity", null, "Sailing", null, true, 8 },
                    { 120, "Trade", "Agility", null, "Sewing", null, true, 3 },
                    { 121, "Trade", "Intelligence", null, "Shipbuilding", null, true, 8 },
                    { 122, "Trade", "Agility", null, "Street Magic", null, true, 4 },
                    { 123, "Trade", "Composure", null, "Surgery", null, true, 15 },
                    { 124, "Trade", "Sagacity", null, "Trap and Skin", null, true, 6 },
                    { 125, "Trade", "Stature", null, "Ventriloquism", null, false, 6 },
                    { 126, "Trade", "Agility", null, "Wood Working", null, true, 7 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Gods");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropTable(
                name: "ShopItems");

            migrationBuilder.DropTable(
                name: "Skills");
        }
    }
}
