import api from '../../../services';
import type{ Bombero } from '../../../types';


//Trae todos los bomberos
export const getBomberos = async (): Promise<Bombero[]> => {
    const response = await api.get('/api/bomberos');
    return response.data;
}

//Trae los bombero por id
export const getbomberosById = async (id: number): Promise<Bombero> => {
    const response = await api.get('/api/bomberos/${id}');
    return response.data;
} 

//Crea un nuevo bombero
export const createBombero = async (bombero: Bombero): Promise<Bombero> =>{
    const response = await api.post('/api/bomberos', bombero);
    return response.data;
}

//Actualizar un bombero 
export const updateBombero = async (id: number, bombero:Bombero): Promise<Bombero> =>{
    const response = await api.put ('/api/bomberos/${id}', bombero);
    return response.data;
}

//Eliminar un bombero
export const deleteBombero = async (id:number): Promise<void> =>{
    await api.delete('/api/bomberos/${id}');
}

