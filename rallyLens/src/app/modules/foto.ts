export interface Foto {
    id: number,
    id_participante: number,
    imagen: string | Blob,
    estado: string,
    votos: number,
    fec_mod: Date | null
}
