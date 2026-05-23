using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;
using System.Security.Claims;

namespace MultiClinicAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProntuarioController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProntuarioController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        IQueryable<Prontuario> query = QueryComIncludes();

        if (role == "Paciente")
            query = query.Where(p => p.Agendamento.ID_Paciente == userId);
        else if (role == "Medico")
            query = query.Where(p => p.Agendamento.ID_Medico == userId);

        var prontuarios = await query.ToListAsync();
        return Ok(prontuarios.Select(ToResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var prontuario = await QueryComIncludes().FirstOrDefaultAsync(p => p.ID_Prontuario == id);
        if (prontuario == null)
            return NotFound("Prontuário não encontrado.");

        if (role == "Paciente" && prontuario.Agendamento.ID_Paciente != userId)
            return Forbid();
        if (role == "Medico" && prontuario.Agendamento.ID_Medico != userId)
            return Forbid();

        return Ok(ToResponse(prontuario));
    }

    [HttpPost]
    [Authorize(Roles = "MedicoAdmin,Medico")]
    public async Task<IActionResult> Criar([FromBody] ProntuarioRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var agendamento = await _context.Agendamentos.FindAsync(request.ID_Agendamento);
        if (agendamento == null)
            return BadRequest("Agendamento não encontrado.");

        if (role == "Medico" && agendamento.ID_Medico != userId)
            return Forbid();

        var jaTemProntuario = await _context.Prontuarios.AnyAsync(p => p.ID_Agendamento == request.ID_Agendamento);
        if (jaTemProntuario)
            return BadRequest("Já existe um prontuário para este agendamento.");

        var prontuario = new Prontuario
        {
            ID_Agendamento = request.ID_Agendamento,
            Evolucao_Clinica = request.Evolucao_Clinica,
            Prescricao = request.Prescricao
        };

        _context.Prontuarios.Add(prontuario);
        await _context.SaveChangesAsync();

        var criado = await QueryComIncludes().FirstAsync(p => p.ID_Prontuario == prontuario.ID_Prontuario);
        return CreatedAtAction(nameof(BuscarPorId), new { id = prontuario.ID_Prontuario }, ToResponse(criado));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "MedicoAdmin,Medico")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ProntuarioRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var prontuario = await QueryComIncludes().FirstOrDefaultAsync(p => p.ID_Prontuario == id);
        if (prontuario == null)
            return NotFound("Prontuário não encontrado.");

        if (role == "Medico" && prontuario.Agendamento.ID_Medico != userId)
            return Forbid();

        prontuario.Evolucao_Clinica = request.Evolucao_Clinica;
        prontuario.Prescricao = request.Prescricao;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<Prontuario> QueryComIncludes() =>
        _context.Prontuarios
            .Include(p => p.Agendamento)
                .ThenInclude(a => a.Paciente)
            .Include(p => p.Agendamento)
                .ThenInclude(a => a.Medico);

    private static ProntuarioResponse ToResponse(Prontuario p) => new()
    {
        ID_Prontuario = p.ID_Prontuario,
        ID_Agendamento = p.ID_Agendamento,
        Evolucao_Clinica = p.Evolucao_Clinica,
        Prescricao = p.Prescricao,
        NomePaciente = p.Agendamento.Paciente.Nome,
        NomeMedico = p.Agendamento.Medico.Nome,
        Data_Hora = p.Agendamento.Data_Hora
    };
}
