namespace TripService.DTOs
{
    public class CreateChecklistItemDto
    {
        public int TravelPlanId { get; set; }
        public string Title { get; set; } = string.Empty;
    }
}
