namespace TripService.DTOs
{
    public class ChecklistItemDto
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}
