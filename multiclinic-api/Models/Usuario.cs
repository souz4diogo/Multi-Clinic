namespace MultiClinicAPI.Models;

public class Usuario
{
    public int ID_Usuario { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Senha_Hash { get; set; } = string.Empty;

    public string Tipo_Perfil { get; set; } = string.Empty;

    // Relacionamentos
    public Medico? Medico { get; set; }

    public Paciente? Paciente { get; set; }
}