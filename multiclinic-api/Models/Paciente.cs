namespace MultiClinicAPI.Models;

public class Paciente : Usuario
{
    public string CPF { get; set; } = string.Empty;
    public DateTime Data_Nascimento { get; set; }
    public decimal Score_Assiduidade { get; set; } = 100;

    public ICollection<Agendamento> Agendamentos { get; set; } = new List<Agendamento>();
}
