namespace MultiClinicAPI.Models;

public class Prontuario
{
    public int ID_Prontuario { get; set; }

    public int ID_Agendamento { get; set; }

    public string? Evolucao_Clinica { get; set; }

    public string? Prescricao { get; set; }

    // Relacionamento
    public Agendamento Agendamento { get; set; } = null!;
}