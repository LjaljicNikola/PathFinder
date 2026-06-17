using AccountService.Data;
using AccountService.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountService.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    RegisteredOn = u.RegisteredOn
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Korisnik nije pronađen." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Korisnik nije pronađen." });

            user.Role = dto.Role;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Uloga je promijenjena." });
        }
    }   
}
