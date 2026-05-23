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
public class AgendamentoController : ControllerBase
{
    private readonly AppDbContext _context;

    public AgendamentoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        IQueryable<Agendamento> query = QueryComIncludes();

        // Paciente e Medico enxergam apenas os próprios agendamentos
        if (role == "Paciente")
            query = query.Where(a => a.ID_Paciente == userId);
        else if (role == "Medico")
            query = query.Where(a => a.ID_Medico == userId);

        var agendamentos = await query.ToListAsync();
        return Ok(agendamentos.Select(ToResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var agendamento = await QueryComIncludes().FirstOrDefaultAsync(a => a.ID_Agendamento == id);
        if (agendamento == null)
            return NotFound("Agendamento não encontrado.");

        return Ok(ToResponse(agendamento));
    }

    [HttpPost]
    [Authorize(Roles = "MedicoAdmin,Paciente")]
    public async Task<IActionResult> Criar([FromBody] AgendamentoRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (role == "Paciente")
        {
            var paciente = await _context.Pacientes.FindAsync(userId);
            if (paciente == null)
                return BadRequest("Perfil de paciente não encontrado.");
            if (string.IsNullOrEmpty(paciente.CPF))
                return BadRequest("Complete seu perfil antes de agendar.");
            request.ID_Paciente = userId;
        }

        var pacienteExiste = await _context.Pacientes.AnyAsync(p => p.ID_Usuario == request.ID_Paciente);
        if (!pacienteExiste)
            return BadRequest("Paciente não encontrado.");

        var medicoExiste = await _context.Medicos.AnyAsync(m => m.ID_Usuario == request.ID_Medico);
        if (!medicoExiste)
            return BadRequest("Médico não encontrado.");

        var agendamento = new Agendamento
        {
            ID_Paciente = request.ID_Paciente,
            ID_Medico = request.ID_Medico,
            Data_Hora = request.Data_Hora,
            Status = "Agendado"
        };

        _context.Agendamentos.Add(agendamento);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(BuscarPorId), new { id = agendamento.ID_Agendamento }, agendamento.ID_Agendamento);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "MedicoAdmin,Medico")]
    public async Task<IActionResult> AtualizarStatus(int id, [FromBody] AgendamentoAtualizarStatusRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var agendamento = await _context.Agendamentos.FindAsync(id);
        if (agendamento == null)
            return NotFound("Agendamento não encontrado.");

        if (role == "Medico" && agendamento.ID_Medico != userId)
            return Forbid();

        agendamento.Status = request.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<Agendamento> QueryComIncludes() =>
        _context.Agendamentos
            .Include(a => a.Paciente)
            .Include(a => a.Medico)
            .Include(a => a.Avaliacao);

    private static AgendamentoResponse ToResponse(Agendamento a) => new()
    {
        ID_Agendamento = a.ID_Agendamento,
        ID_Paciente = a.ID_Paciente,
        ID_Medico = a.ID_Medico,
        NomePaciente = a.Paciente.Nome,
        NomeMedico = a.Medico.Nome,
        Data_Hora = a.Data_Hora,
        Status = a.Status,
        TemAvaliacao = a.Avaliacao != null
    };
}
