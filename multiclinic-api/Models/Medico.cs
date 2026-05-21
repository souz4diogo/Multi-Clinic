namespace MultiClinicAPI.Models;

public class Medico
{
    public int ID_Medico { get; set; }

    public int ID_Usuario { get; set; }

    public int ID_Especialidade { get; set; }

    public string CRM { get; set; } = string.Empty;

    // Relacionamentos
    public Usuario Usuario { get; set; } = null!;

    public Especialidade Especialidade { get; set; } = null!;

    public ICollection<Agendamento> Agendamentos { get; set; }
        = new List<Agendamento>();
}