namespace MultiClinicAPI.Models;

public class Medico : Usuario
{
    public int ID_Especialidade { get; set; }
    public string CRM { get; set; } = string.Empty;

    public Especialidade Especialidade { get; set; } = null!;
    public ICollection<Agendamento> Agendamentos { get; set; } = new List<Agendamento>();
}
