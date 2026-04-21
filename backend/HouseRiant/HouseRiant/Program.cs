using HouseRhiant.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
 
var builder = WebApplication.CreateBuilder(args);
 
// ── Services ──────────────────────────────────────────────
 
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
 
// PostgreSQL via EF Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);
 
// CORS — allow dev servers and production domain
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
 
var app = builder.Build();
 
// ── Middleware pipeline ───────────────────────────────────
 
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
 
app.UseStaticFiles();
app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();
 
// Auto-apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
 
app.Run();

