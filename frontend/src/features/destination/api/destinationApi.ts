import tripApi from '../../../api/tripApi';
import type { Destination } from '../types/Destination';
import type { CreateDestinationRequest } from '../types/CreateDestinationRequest';

export const destinationApi = {
    create: (data: CreateDestinationRequest) =>
        tripApi.post<Destination>('/destinations', data).then((r) => r.data),

    remove: (id: number) =>
        tripApi.delete(`/destinations/${id}`),
};