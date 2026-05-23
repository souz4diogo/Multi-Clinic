using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;
using System.Security.Claims;

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
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        IQueryable<Models.Paciente> query = _context.Pacientes;

        if (role == "Paciente")
            query = query.Where(p => p.ID_Usuario == userId);

        var pacientes = await query.ToListAsync();
        return Ok(pacientes.Select(ToResponse));
    }

    [HttpPut("perfil")]
    [Authorize(Roles = "Paciente")]
    public async Task<IActionResult> AtualizarPerfil([FromBody] PacienteRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var paciente = await _context.Pacientes.FindAsync(userId);
        if (paciente == null)
            return NotFound("Paciente não encontrado.");

        paciente.CPF = request.CPF;
        paciente.Data_Nascimento = request.Data_Nascimento;
        await _context.SaveChangesAsync();

        return Ok(ToResponse(paciente));
    }

    private static PacienteResponse ToResponse(Models.Paciente p) => new()
    {
        ID_Paciente = p.ID_Usuario,
        Nome = p.Nome,
        CPF = p.CPF,
        Data_Nascimento = p.Data_Nascimento,
        Score_Assiduidade = p.Score_Assiduidade
    };
}
