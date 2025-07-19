using Microsoft.AspNetCore.Mvc;
using hse1backend.Data;
using hse1backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;
using Microsoft.AspNetCore.Authorization;

namespace hse1backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EpiController : ControllerBase
    {
        private readonly AppDbContext _context;
        public EpiController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Epi>>> GetAll()
        {
            return await _context.Epis.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Epi>> Get(int id)
        {
            var epi = await _context.Epis.FindAsync(id);
            if (epi == null) return NotFound();
            return epi;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Epi>> Create([FromBody] Epi epi)
        {
            _context.Epis.Add(epi);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = epi.Id }, epi);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Epi epi)
        {
            if (id != epi.Id) return BadRequest();
            _context.Entry(epi).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EpiExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var epi = await _context.Epis.FindAsync(id);
            if (epi == null) return NotFound();
            _context.Epis.Remove(epi);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class EpiImageUploadRequest
        {
            public IFormFile File { get; set; }
        }

        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage([FromForm] EpiImageUploadRequest request)
        {
            var file = request.File;
            if (file == null || file.Length == 0)
                return BadRequest("Aucun fichier envoyé.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "media", "epis");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = Path.Combine("media", "epis", fileName).Replace("\\", "/");
            return Content(relativePath, "text/plain");
        }

        private bool EpiExists(int id) => _context.Epis.Any(e => e.Id == id);
    }
} 