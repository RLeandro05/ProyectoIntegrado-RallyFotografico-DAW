export interface Foto {
    id: number,
    id_administrador: number,
    id_participante: number,
    imagen: Blob,
    estado: string,
    votos: number,
    fec_mod: Date
}
