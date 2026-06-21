export interface CreateExpenseRequest {
    travelPlanId: number;
    name: string;
    category: string;
    amount: number;
    date: string;
    description: string;
}