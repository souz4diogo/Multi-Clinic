using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using MultiClinicAPI.Models;
using MultiClinicAPI.Services;
using Xunit;

namespace MultiClinicAPI.Tests.Services;

public class TokenServiceTests
{
    private readonly TokenService _sut = new();

    [Fact]
    public void Generate_ReturnsNonEmptyString()
    {
        var token = _sut.Generate(BuildUsuario());

        Assert.NotEmpty(token);
    }

    [Fact]
    public void Generate_ProducesValidSignedJwt()
    {
        var token = _sut.Generate(BuildUsuario());

        // Should not throw
        ValidateAndGetPrincipal(token);
    }

    [Fact]
    public void Generate_TokenContainsCorrectClaims()
    {
        var usuario = BuildUsuario(id: 42, nome: "Carlos", email: "carlos@test.com", role: "Medico");

        var principal = ValidateAndGetPrincipal(_sut.Generate(usuario));

        Assert.Equal("42", principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("Carlos", principal.FindFirstValue(ClaimTypes.Name));
        Assert.Equal("carlos@test.com", principal.FindFirstValue(ClaimTypes.Email));
        Assert.Equal("Medico", principal.FindFirstValue(ClaimTypes.Role));
    }

    [Theory]
    [InlineData("Paciente")]
    [InlineData("Medico")]
    [InlineData("MedicoAdmin")]
    public void Generate_AllRoles_IncludeRoleClaim(string role)
    {
        var token = _sut.Generate(BuildUsuario(role: role));

        var principal = ValidateAndGetPrincipal(token);
        Assert.Equal(role, principal.FindFirstValue(ClaimTypes.Role));
    }

    [Fact]
    public void Generate_TokenExpiresInApproximately8Hours()
    {
        var before = DateTime.UtcNow;
        var token = _sut.Generate(BuildUsuario());

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.True(jwt.ValidTo >= before.AddHours(7).AddMinutes(59));
        Assert.True(jwt.ValidTo <= before.AddHours(8).AddMinutes(1));
    }

    private static Usuario BuildUsuario(int id = 1, string nome = "Test", string email = "t@t.com", string role = "Paciente") =>
        new() { ID_Usuario = id, Nome = nome, Email = email, Tipo_Perfil = role };

    private static ClaimsPrincipal ValidateAndGetPrincipal(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(Configuration.PrivateKey);
        return handler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        }, out _);
    }
}
