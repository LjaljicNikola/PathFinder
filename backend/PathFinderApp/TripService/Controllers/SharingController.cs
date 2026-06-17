using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripService.Services;

namespace TripService.Controllers
{
    [ApiController]
    [Route("api/sharing")]
    [Authorize]
    public class SharingController : ControllerBase
    {
        private readonly SharingProxyService _sharingProxy;

        public SharingController(SharingProxyService sharingProxy)
        {
            _sharingProxy = sharingProxy;
        }

        [HttpPost]
        public async Task<IActionResult> CreateToken([FromBody] CreateShareTokenRequest request)
        {
            var token = await _sharingProxy.GenerateTokenAsync(request.TravelPlanId, request.AccessLevel);
            return StatusCode(StatusCodes.Status201Created, new { token });
        }

        [HttpGet("{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckToken(string token)
        {
            try
            {
                var result = await _sharingProxy.CheckTokenAsync(token);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Token nije pronađen." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{token}")]
        public async Task<IActionResult> RevokeToken(string token)
        {
            await _sharingProxy.RevokeTokenAsync(token);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> GetTokensForPlan([FromQuery] int travelPlanId)
        {
            var tokens = await _sharingProxy.GetTokensByPlanAsync(travelPlanId);
            return Ok(tokens);
        }
    }

    public class CreateShareTokenRequest
    {
        public int TravelPlanId { get; set; }
        public string AccessLevel { get; set; } = string.Empty;
    }
}
