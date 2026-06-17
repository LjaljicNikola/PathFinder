using Microsoft.AspNetCore.Mvc;
using TripService.DTOs;
using TripService.Services;
using Microsoft.AspNetCore.Authorization;

namespace TripService.Controllers
{
    [ApiController]
    [Route("api/activities")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly ActivityService _activityService;

        public ActivitiesController(ActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int destinationId)
        {
            var activities = await _activityService.GetAllForDestinationAsync(destinationId);
            return Ok(activities);
        }

        [HttpGet("calendar")]
        public async Task<IActionResult> GetByDate([FromQuery] int travelPlanId, [FromQuery] DateTime date)
        {
            var activities = await _activityService.GetByDateAsync(travelPlanId, date);
            return Ok(activities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var activity = await _activityService.GetByIdAsync(id);
            if (activity == null) return NotFound(new { message = "Aktivnost nije pronađena." });
            return Ok(activity);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateActivityDto dto)
        {
            try
            {
                var created = await _activityService.CreateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateActivityDto dto)
        {
            try
            {
                var updated = await _activityService.UpdateAsync(id, dto);
                if (updated == null) return NotFound(new { message = "Aktivnost nije pronađena." });
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _activityService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Aktivnost nije pronađena." });
            return NoContent();
        }
    }
}
