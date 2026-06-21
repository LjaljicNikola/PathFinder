export interface CreateDestinationRequest {
    travelPlanId: number;
    name: string;
    location: string;
    arrivalDate: string;
    departureDate: string;
    notes: string;
}