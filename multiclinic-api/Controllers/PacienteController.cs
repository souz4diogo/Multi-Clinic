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
public class PacienteController : ControllerBase
{
    private readonly AppDbContext _context;

    public PacienteController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var pacientes = await QueryComIncludes()
            .ToListAsync();

        return Ok(pacientes.Select(p => ToResponse(p)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var paciente = await QueryComIncludes()
            .FirstOrDefaultAsync(p => p.ID_Paciente == id);

        if (paciente == null)
            return NotFound("Paciente não encontrado.");

        return Ok(ToResponse(paciente));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] PacienteRequest request)
    {
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.ID_Usuario == request.ID_Usuario);

        if (!usuarioExiste)
            return BadRequest("Usuário não encontrado.");

        var paciente = new Paciente
        {
            ID_Usuario = request.ID_Usuario,
            CPF = request.CPF,
            Data_Nascimento = request.Data_Nascimento,
            Score_Assiduidade = 0
        };

        _context.Pacientes.Add(paciente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(BuscarPorId), new { id = paciente.ID_Paciente }, paciente.ID_Paciente);
    }

    private IQueryable<Paciente> QueryComIncludes() =>
        _context.Pacientes.Include(p => p.Usuario);

    private static PacienteResponse ToResponse(Paciente p) => new()
    {
        ID_Paciente = p.ID_Paciente,
        Nome = p.Usuario.Nome,
        CPF = p.CPF,
        Data_Nascimento = p.Data_Nascimento,
        Score_Assiduidade = p.Score_Assiduidade
    };
}
