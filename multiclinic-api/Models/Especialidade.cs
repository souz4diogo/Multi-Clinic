namespace MultiClinicAPI.Models;

public class Especialidade
{
    public int ID_Especialidade { get; set; }

    public string Nome_Especialidade { get; set; } = string.Empty;

    // Relacionamento
    public ICollection<Medico> Medicos { get; set; }
        = new List<Medico>();
}