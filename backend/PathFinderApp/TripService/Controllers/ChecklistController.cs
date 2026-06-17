using Microsoft.AspNetCore.Mvc;
using TripService.DTOs;
using TripService.Services;
using Microsoft.AspNetCore.Authorization;


namespace TripService.Controllers
{
    [ApiController]
    [Route("api/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        private readonly ChecklistService _checklistService;

        public ChecklistController(ChecklistService checklistService)
        {
            _checklistService = checklistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int travelPlanId)
        {
            var items = await _checklistService.GetAllForPlanAsync(travelPlanId);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _checklistService.GetByIdAsync(id);
            if (item == null) return NotFound(new { message = "Stavka checkliste nije pronađena." });
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateChecklistItemDto dto)
        {
            try
            {
                var created = await _checklistService.CreateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateChecklistItemDto dto)
        {
            var updated = await _checklistService.UpdateAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Stavka checkliste nije pronađena." });
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _checklistService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Stavka checkliste nije pronađena." });
            return NoContent();
        }
    }
}
