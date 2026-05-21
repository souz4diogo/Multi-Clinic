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
public class ProntuarioController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProntuarioController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var prontuario = await _context.Prontuarios.FindAsync(id);

        if (prontuario == null)
            return NotFound("Prontuário não encontrado.");

        return Ok(ToResponse(prontuario));
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] ProntuarioRequest request)
    {
        var agendamentoExiste = await _context.Agendamentos.AnyAsync(a => a.ID_Agendamento == request.ID_Agendamento);

        if (!agendamentoExiste)
            return BadRequest("Agendamento não encontrado.");

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

        return CreatedAtAction(nameof(BuscarPorId), new { id = prontuario.ID_Prontuario }, ToResponse(prontuario));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ProntuarioRequest request)
    {
        var prontuario = await _context.Prontuarios.FindAsync(id);

        if (prontuario == null)
            return NotFound("Prontuário não encontrado.");

        prontuario.Evolucao_Clinica = request.Evolucao_Clinica;
        prontuario.Prescricao = request.Prescricao;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ProntuarioResponse ToResponse(Prontuario p) => new()
    {
        ID_Prontuario = p.ID_Prontuario,
        ID_Agendamento = p.ID_Agendamento,
        Evolucao_Clinica = p.Evolucao_Clinica,
        Prescricao = p.Prescricao
    };
}
