using Microsoft.AspNetCore.Mvc;
using TripService.DTOs;
using TripService.Services;
using Microsoft.AspNetCore.Authorization;

namespace TripService.Controllers
{
    [ApiController]
    [Route("api/expenses")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseService _expenseService;

        public ExpensesController(ExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int travelPlanId)
        {
            var expenses = await _expenseService.GetAllForPlanAsync(travelPlanId);
            return Ok(expenses);
        }

        [HttpGet("budget-summary")]
        public async Task<IActionResult> GetBudgetSummary([FromQuery] int travelPlanId)
        {
            var summary = await _expenseService.GetBudgetSummaryAsync(travelPlanId);
            if (summary == null) return NotFound(new { message = "Plan putovanja nije pronađen." });
            return Ok(summary);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var expense = await _expenseService.GetByIdAsync(id);
            if (expense == null) return NotFound(new { message = "Trošak nije pronađen." });
            return Ok(expense);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto)
        {
            try
            {
                var created = await _expenseService.CreateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateExpenseDto dto)
        {
            try
            {
                var updated = await _expenseService.UpdateAsync(id, dto);
                if (updated == null) return NotFound(new { message = "Trošak nije pronađen." });
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
            var deleted = await _expenseService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Trošak nije pronađen." });
            return NoContent();
        }
    }
}
