using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TripService.DTOs;

namespace TripService.Services
{
    public class PdfReportService
    {
        static PdfReportService()
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
        }

        public byte[] GenerateTravelPlanReport(TravelPlanOverviewDto overview)
        {
            var document = QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header().Column(col =>
                    {
                        col.Item().Text(overview.Plan.Title).FontSize(22).Bold();
                        col.Item().Text($"{overview.Plan.StartDate:dd.MM.yyyy} - {overview.Plan.EndDate:dd.MM.yyyy}")
                            .FontSize(11).FontColor(Colors.Grey.Darken1);
                    });

                    page.Content().PaddingTop(15).Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().Text("Destinacije").Bold().FontSize(14);
                        foreach (var d in overview.Destinations)
                        {
                            col.Item().Text($"{d.Destination.Name} ({d.Destination.Location}) — {d.Destination.ArrivalDate:dd.MM.yyyy} do {d.Destination.DepartureDate:dd.MM.yyyy}");
                            foreach (var a in d.Activities)
                            {
                                col.Item().PaddingLeft(15).Text($"- {a.Name}, {a.Date:dd.MM.yyyy} {a.Time}, status: {a.Status}");
                            }
                        }

                        col.Item().Text("Budžet").Bold().FontSize(14);
                        col.Item().Text($"Planirani budžet: {overview.Budget.PlannedBudget:N2}");
                        col.Item().Text($"Ukupno potrošeno: {overview.Budget.TotalSpent:N2}");
                        col.Item().Text($"Preostali budžet: {overview.Budget.RemainingBudget:N2}");

                        col.Item().Text("Checklist").Bold().FontSize(14);
                        foreach (var item in overview.ChecklistItems)
                        {
                            col.Item().Text($"[{(item.IsCompleted ? "x" : " ")}] {item.Title}");
                        }
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.CurrentPageNumber();
                        x.Span(" / ");
                        x.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}
