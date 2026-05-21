namespace MultiClinicAPI.Models;

public class Paciente
{
    public int ID_Paciente { get; set; }

    public int ID_Usuario { get; set; }

    public string CPF { get; set; } = string.Empty;

    public DateTime Data_Nascimento { get; set; }

    public decimal Score_Assiduidade { get; set; }

    // Relacionamentos
    public Usuario Usuario { get; set; } = null!;

    public ICollection<Agendamento> Agendamentos { get; set; }
        = new List<Agendamento>();
}