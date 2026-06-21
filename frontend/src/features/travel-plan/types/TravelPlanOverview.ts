import type { TravelPlan } from './TravelPlan';

export interface ActivityItem {
    id: number;
    destinationId: number;
    name: string;
    date: string;
    time: string;
    location: string;
    description: string;
    estimatedCost: number;
    status: string;
}

export interface DestinationWithActivities {
    destination: {
        id: number;
        travelPlanId: number;
        name: string;
        location: string;
        arrivalDate: string;
        departureDate: string;
        notes: string;
    };
    activities: ActivityItem[];
}

export interface BudgetSummary {
    plannedBudget: number;
    totalSpent: number;
    remainingBudget: number;
    spentByCategory: Record<string, number>;
}

export interface ChecklistItem {
    id: number;
    travelPlanId: number;
    title: string;
    isCompleted: boolean;
}

export interface TravelPlanOverview {
    plan: TravelPlan;
    destinations: DestinationWithActivities[];
    expenses: {
        id: number;
        travelPlanId: number;
        name: string;
        category: string;
        amount: number;
        date: string;
        description: string;
    }[];
    budget: BudgetSummary;
    checklistItems: ChecklistItem[];
}