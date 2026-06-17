using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PathFinder.Common.Models
{
    public class TravelPlan
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public List<Destination> Destinations { get; set; } = new();
        public List<Expense> Expenses { get; set; } = new();
        public List<ChecklistItem> ChecklistItems { get; set; } = new();
    }
}
