namespace MultiClinicAPI.Models;

public class Agendamento
{
    public int ID_Agendamento { get; set; }

    public int ID_Paciente { get; set; }

    public int ID_Medico { get; set; }

    public DateTime Data_Hora { get; set; }

    public string Status { get; set; } = string.Empty;

    // Relacionamentos
    public Paciente Paciente { get; set; } = null!;

    public Medico Medico { get; set; } = null!;

    public Prontuario? Prontuario { get; set; }

    public Avaliacao? Avaliacao { get; set; }
}