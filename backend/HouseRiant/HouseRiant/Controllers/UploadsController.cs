using Microsoft.AspNetCore.Mvc;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("portrait")]
    public async Task<ActionResult<object>> UploadPortrait(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest(new { message = "Only JPG, PNG, GIF, and WebP files are allowed." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File must be under 5MB." });

        // Save to wwwroot/images/portraits/
        if (string.IsNullOrEmpty(_env.WebRootPath))
            return StatusCode(500, new { message = "Server file storage is not configured." });

        var portraitsDir = Path.Combine(_env.WebRootPath, "images", "portraits");
        Directory.CreateDirectory(portraitsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(portraitsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var url = $"/images/portraits/{fileName}";
        return Ok(new { url });
    }
}
