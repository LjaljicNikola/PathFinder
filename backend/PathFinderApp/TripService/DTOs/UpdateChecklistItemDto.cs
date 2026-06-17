namespace TripService.DTOs
{
    public class UpdateChecklistItemDto
    {
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}
