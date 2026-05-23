using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;

namespace MultiClinicAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EspecialidadeController : ControllerBase
{
    private readonly AppDbContext _context;

    public EspecialidadeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var especialidades = await _context.Especialidades
            .Select(e => ToResponse(e))
            .ToListAsync();

        return Ok(especialidades);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var especialidade = await _context.Especialidades.FindAsync(id);

        if (especialidade == null)
            return NotFound("Especialidade não encontrada.");

        return Ok(ToResponse(especialidade));
    }

    [HttpPost]
    [Authorize(Roles = "MedicoAdmin")]
    public async Task<IActionResult> Criar([FromBody] EspecialidadeRequest request)
    {
        var especialidade = new Especialidade
        {
            Nome_Especialidade = request.Nome_Especialidade
        };

        _context.Especialidades.Add(especialidade);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(BuscarPorId), new { id = especialidade.ID_Especialidade }, ToResponse(especialidade));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "MedicoAdmin")]
    public async Task<IActionResult> Deletar(int id)
    {
        var especialidade = await _context.Especialidades.FindAsync(id);

        if (especialidade == null)
            return NotFound("Especialidade não encontrada.");

        _context.Especialidades.Remove(especialidade);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static EspecialidadeResponse ToResponse(Especialidade e) => new()
    {
        ID_Especialidade = e.ID_Especialidade,
        Nome_Especialidade = e.Nome_Especialidade
    };
}
