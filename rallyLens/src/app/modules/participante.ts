export interface Participante {
    id: number,
    nombre: string,
    apellidos: string,
    telefono: string,
    correo: string,
    password: string,
    foto_perfil: Blob | null
}
