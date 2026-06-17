using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TripService.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var idClaim = user.FindFirst(JwtRegisteredClaimNames.Sub)
                ?? throw new UnauthorizedAccessException("Token ne sadrži korisnički ID.");

            return int.Parse(idClaim.Value);
        }

        public static string GetRole(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value ?? "Korisnik";
        }
    }
}
