using AccountService.Data;
using AccountService.DTOs;
using Microsoft.EntityFrameworkCore;
using PathFinder.Common.Models;


namespace AccountService.Services
{
    public class AccountAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtTokenGenerator _tokenGenerator;

        public AccountAuthService(AppDbContext context, JwtTokenGenerator tokenGenerator)
        {
            _context = context;
            _tokenGenerator = tokenGenerator;
        }

        public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
        {
            var emailTaken = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailTaken)
                throw new InvalidOperationException("Korisnik sa ovim email-om već postoji.");

            var newUser = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Korisnik",
                RegisteredOn = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return BuildAuthResult(newUser);
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Pogrešan email ili lozinka.");

            return BuildAuthResult(user);
        }

        private AuthResultDto BuildAuthResult(User user)
        {
            return new AuthResultDto
            {
                Token = _tokenGenerator.CreateToken(user),
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
