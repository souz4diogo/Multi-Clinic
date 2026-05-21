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
        var agendamentos = await QueryComIncludes()
            .ToListAsync();

        return Ok(agendamentos.Select(a => ToResponse(a)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var agendamento = await QueryComIncludes()
            .FirstOrDefaultAsync(a => a.ID_Agendamento == id);

        if (agendamento == null)
            return NotFound("Agendamento não encontrado.");

        return Ok(ToResponse(agendamento));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] AgendamentoRequest request)
    {
        var pacienteExiste = await _context.Pacientes.AnyAsync(p => p.ID_Paciente == request.ID_Paciente);

        if (!pacienteExiste)
            return BadRequest("Paciente não encontrado.");

        var medicoExiste = await _context.Medicos.AnyAsync(m => m.ID_Medico == request.ID_Medico);

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
    public async Task<IActionResult> AtualizarStatus(int id, [FromBody] AgendamentoAtualizarStatusRequest request)
    {
        var agendamento = await _context.Agendamentos.FindAsync(id);

        if (agendamento == null)
            return NotFound("Agendamento não encontrado.");

        agendamento.Status = request.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<Agendamento> QueryComIncludes() =>
        _context.Agendamentos
            .Include(a => a.Paciente).ThenInclude(p => p.Usuario)
            .Include(a => a.Medico).ThenInclude(m => m.Usuario);

    private static AgendamentoResponse ToResponse(Agendamento a) => new()
    {
        ID_Agendamento = a.ID_Agendamento,
        NomePaciente = a.Paciente.Usuario.Nome,
        NomeMedico = a.Medico.Usuario.Nome,
        Data_Hora = a.Data_Hora,
        Status = a.Status
    };
}
