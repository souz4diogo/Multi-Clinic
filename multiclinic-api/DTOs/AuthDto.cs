namespace MultiClinicAPI.DTOs;

public class RegisterRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Tipo_Perfil { get; set; } = string.Empty;
    public int ID_Usuario { get; set; }
    public int? ID_Paciente { get; set; }
    public int? ID_Medico { get; set; }
}
