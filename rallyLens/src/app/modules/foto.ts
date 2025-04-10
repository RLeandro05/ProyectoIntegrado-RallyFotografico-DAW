export interface Foto {
    id: number,
    id_participante: number,
    imagen: Blob | null,
    estado: string,
    votos: number,
    fec_mod: Date | null
}
