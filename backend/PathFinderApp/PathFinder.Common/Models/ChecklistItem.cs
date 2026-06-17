using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PathFinder.Common.Models
{
    public class ChecklistItem
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
    }
}
