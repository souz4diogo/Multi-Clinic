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
public class MedicoController : ControllerBase
{
    private readonly AppDbContext _context;

    public MedicoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var medicos = await QueryComIncludes()
            .ToListAsync();

        return Ok(medicos.Select(m => ToResponse(m)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var medico = await QueryComIncludes()
            .FirstOrDefaultAsync(m => m.ID_Medico == id);

        if (medico == null)
            return NotFound("Médico não encontrado.");

        return Ok(ToResponse(medico));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] MedicoRequest request)
    {
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.ID_Usuario == request.ID_Usuario);

        if (!usuarioExiste)
            return BadRequest("Usuário não encontrado.");

        var especialidadeExiste = await _context.Especialidades.AnyAsync(e => e.ID_Especialidade == request.ID_Especialidade);

        if (!especialidadeExiste)
            return BadRequest("Especialidade não encontrada.");

        var medico = new Medico
        {
            ID_Usuario = request.ID_Usuario,
            ID_Especialidade = request.ID_Especialidade,
            CRM = request.CRM
        };

        _context.Medicos.Add(medico);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(BuscarPorId), new { id = medico.ID_Medico }, medico.ID_Medico);
    }

    private IQueryable<Medico> QueryComIncludes() =>
        _context.Medicos
            .Include(m => m.Usuario)
            .Include(m => m.Especialidade);

    private static MedicoResponse ToResponse(Medico m) => new()
    {
        ID_Medico = m.ID_Medico,
        Nome = m.Usuario.Nome,
        CRM = m.CRM,
        Especialidade = m.Especialidade.Nome_Especialidade
    };
}
