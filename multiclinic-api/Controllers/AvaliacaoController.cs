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
public class AvaliacaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public AvaliacaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = "Paciente")]
    public async Task<IActionResult> Avaliar([FromBody] AvaliacaoRequest request)
    {
        if (request.Nota < 1 || request.Nota > 5)
            return BadRequest("A nota deve ser entre 1 e 5.");

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var agendamento = await _context.Agendamentos
            .Include(a => a.Paciente)
            .FirstOrDefaultAsync(a => a.ID_Agendamento == request.ID_Agendamento);

        if (agendamento == null)
            return NotFound("Agendamento não encontrado.");

        if (agendamento.Status != "Concluido")
            return BadRequest("Só é possível avaliar consultas concluídas.");

        if (agendamento.Paciente.ID_Usuario != userId)
            return Forbid();

        var jaAvaliou = await _context.Avaliacoes
            .AnyAsync(a => a.ID_Agendamento == request.ID_Agendamento);

        if (jaAvaliou)
            return BadRequest("Esta consulta já foi avaliada.");

        var avaliacao = new Avaliacao
        {
            ID_Agendamento = request.ID_Agendamento,
            Nota = request.Nota
        };

        _context.Avaliacoes.Add(avaliacao);
        await _context.SaveChangesAsync();

        return Created(string.Empty, new AvaliacaoResponse
        {
            ID_Avaliacao = avaliacao.ID_Avaliacao,
            ID_Agendamento = avaliacao.ID_Agendamento,
            Nota = avaliacao.Nota
        });
    }
}
