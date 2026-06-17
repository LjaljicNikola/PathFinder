using Microsoft.IdentityModel.Tokens;
using PathFinder.Common.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AccountService.Services
{
    public class JwtTokenGenerator
    {
        private readonly IConfiguration _config;

        public JwtTokenGenerator(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(User user)
        {
            var secret = _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret nije konfigurisan.");
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];
            var expiryHours = int.Parse(_config["Jwt:ExpiryHours"] ?? "24");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("fullName", user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
