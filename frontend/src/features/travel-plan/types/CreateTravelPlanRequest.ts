export interface CreateTravelPlanRequest {
    userId: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    plannedBudget: number;
    notes: string;
}