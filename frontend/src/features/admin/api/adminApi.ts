import accountApi from '../../../api/accountApi';
import tripApi from '../../../api/tripApi';

export const adminApi = {
    getUsers: () => accountApi.get('/admin/users').then(r => r.data),
    deleteUser: (id: number) => accountApi.delete(`/admin/users/${id}`),
    changeRole: (id: number, role: string) => accountApi.put(`/admin/users/${id}/role`, { role }),
    getUserPlans: (userId: number) => tripApi.get(`/travel-plans/user/${userId}`).then(r => r.data),
};