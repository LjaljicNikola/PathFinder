using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripService.DTOs;
using TripService.Extensions;
using TripService.Services;

namespace TripService.Controllers
{
    [ApiController]
    [Route("api/travel-plans")]
    [Authorize]
    public class TravelPlansController : ControllerBase
    {
        private readonly TravelPlanService _planService;

        public TravelPlansController(TravelPlanService planService)
        {
            _planService = planService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = User.GetUserId();
            var plans = await _planService.GetAllForUserAsync(userId);
            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _planService.GetByIdAsync(id);
            if (plan == null) return NotFound(new { message = "Plan putovanja nije pronađen." });
            return Ok(plan);
        }

        [HttpGet("{id}/overview")]
        public async Task<IActionResult> GetOverview(int id)
        {
            var overview = await _planService.GetOverviewAsync(id);
            if (overview == null) return NotFound(new { message = "Plan putovanja nije pronađen." });
            return Ok(overview);
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadPdf(int id, [FromServices] PdfReportService pdfService)
        {
            var overview = await _planService.GetOverviewAsync(id);
            if (overview == null) return NotFound(new { message = "Plan putovanja nije pronađen." });

            var pdfBytes = pdfService.GenerateTravelPlanReport(overview);
            return File(pdfBytes, "application/pdf", $"PutniPlan_{overview.Plan.Title}.pdf");
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTravelPlanDto dto)
        {
            try
            {
                dto.UserId = User.GetUserId();
                var created = await _planService.CreateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTravelPlanDto dto)
        {
            try
            {
                var updated = await _planService.UpdateAsync(id, dto);
                if (updated == null) return NotFound(new { message = "Plan putovanja nije pronađen." });
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
            var deleted = await _planService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Plan putovanja nije pronađen." });
            return NoContent();
        }
    }
}
