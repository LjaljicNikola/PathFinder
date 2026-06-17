using Microsoft.AspNetCore.Mvc;
using TripService.DTOs;
using TripService.Services;

namespace TripService.Controllers
{
    [ApiController]
    [Route("api/destinations")]
    public class DestinationsController : ControllerBase
    {
        private readonly DestinationService _destinationService;

        public DestinationsController(DestinationService destinationService)
        {
            _destinationService = destinationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int travelPlanId)
        {
            var destinations = await _destinationService.GetAllForPlanAsync(travelPlanId);
            return Ok(destinations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var destination = await _destinationService.GetByIdAsync(id);
            if (destination == null) return NotFound(new { message = "Destinacija nije pronađena." });
            return Ok(destination);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDestinationDto dto)
        {
            try
            {
                var created = await _destinationService.CreateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDestinationDto dto)
        {
            var updated = await _destinationService.UpdateAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Destinacija nije pronađena." });
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _destinationService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Destinacija nije pronađena." });
            return NoContent();
        }
    }
}
