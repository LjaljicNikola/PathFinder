export interface CreateActivityRequest {
  destinationId: number;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  estimatedCost: number;
  status: string;
}