<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = conectar2("qamu724", "qamu724.backendrallylens.com", "qamu724", "XL3andr0_x");

$datos = file_get_contents('php://input');
$objeto = json_decode($datos);

// Verificar si hay datos y si el servicio está especificado
if ($objeto !== null && isset($objeto->servicio)) {
    switch ($objeto->servicio) {
        case "listarAdmins":
            echo json_encode(listadoAdmins());
            break;
        case "listarFotos":
            echo json_encode(listadoFotos());
            break;
        case "listarParticipantes":
            echo json_encode(listadoParticipantes());
            break;
        case "registrarParticipante":
            echo json_encode(registrarParticipante($objeto));
            break;
        case "loginParticipante":
            echo json_encode(loginParticipante($objeto));
            break;
        case "modificarParticipante":
            echo json_encode(modificarParticipante($objeto));
            break;
        case "obtenerIDParticipante":
            echo json_encode(obtenerIDParticipante($objeto->correo));
            break;
        case "obtenerParticipanteID":
            echo json_encode(obtenerParticipanteID($objeto->id));
            break;
        case "obtenerFotografiaID":
            echo json_encode(obtenerFotografiaID($objeto->idFoto));
            break;
        case "subirFoto":
            echo json_encode(subirFoto($objeto));
            break;
        case "listarFotosParticipante":
            echo json_encode(listarFotosParticipante($objeto->id));
            break;
        case "borrarFotoParticipante":
            echo json_encode(borrarFotoParticipante($objeto->idFoto));
            break;
        case "editarFotoParticipante":
            echo json_encode(editarFotoParticipante($objeto->foto));
            break;
        case "loginAdmin":
            echo json_encode(loginAdmin($objeto->admin));
            break;
        case "eliminarParticipante":
            $resultadoFotos = eliminarFotosParticipante($objeto->idParticipante);

            if ($resultadoFotos["success"]) {
                $resultadoParticipante = eliminarParticipante($objeto->idParticipante);
                echo json_encode($resultadoParticipante);
            } else {
                echo json_encode($resultadoFotos);
            }
            break;
        case "cambiarEstadoFotografia":
            echo json_encode(cambiarEstadoFotografia($objeto->foto));
            break;
        case "alternarVoto":
            echo json_encode(alternarVoto($objeto->idFoto, $objeto->idParticipante, $objeto->idParticipanteVotado));
            break;
        case "obtenerVotosParticipante":
            echo json_encode(obtenerVotosParticipante($objeto->idParticipante));
            break;
        case "borrarVotosIDs":
            echo json_encode(borrarVotosIDs($objeto->idFoto, $objeto->idParticipante));
            break;
    }
}

// Función para listar administradores
function listadoAdmins()
{
    global $conn;
    try {
        $sc = "SELECT id, nombre, apellidos, telefono, correo FROM administrador ORDER BY id";
        $stm = $conn->prepare($sc);
        $stm->execute();
        return ["success" => true, "data" => $stm->fetchAll(PDO::FETCH_ASSOC)];
    } catch (Exception $e) {
        return ["error" => $e->getMessage(), "codigo" => $e->getCode()];
    }
}

// Función para listar fotografías
function listadoFotos()
{
    global $conn;
    try {
        $sc = "SELECT id, id_participante, imagen, estado, votos, fec_mod FROM fotografia ORDER BY id";
        $stm = $conn->prepare($sc);
        $stm->execute();
        return $stm->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return ["error" => $e->getMessage(), "codigo" => $e->getCode()];
    }
}

// Función para listar participantes
function listadoParticipantes()
{
    global $conn;
    try {
        $sc = "SELECT id, nombre, apellidos, telefono, correo, foto_perfil, password FROM participante ORDER BY id";
        $stm = $conn->prepare($sc);
        $stm->execute();
        return $stm->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return ["error" => $e->getMessage(), "codigo" => $e->getCode()];
    }
}

//Función para registrar un nuevo participante
function registrarParticipante($objeto)
{
    global $conn;

    //Validar que el participante exista
    if (!isset($objeto->participante)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'participante'"];
    }

    $p = $objeto->participante;

    //Validar campos obligatorios
    $camposRequeridos = ['nombre', 'apellidos', 'correo', 'password'];
    $faltantes = [];

    foreach ($camposRequeridos as $campo) {
        if (!isset($p->$campo) || empty(trim($p->$campo))) {
            $faltantes[] = $campo;
        }
    }

    //Si falta algún campo, mostrar cuáles faltan
    if (!empty($faltantes)) {
        return ["error" => "Campos requeridos faltantes", "campos_faltantes" => $faltantes];
    }

    try {
        //Verificar si el correo ya existe en el registro de participantes
        $stmt = $conn->prepare("SELECT id FROM participante WHERE correo = ?");
        $stmt->execute([$p->correo]);

        //Si ya existe, dar error
        if ($stmt->fetch()) {
            return false;
        }

        //Insertar nuevo participante
        $sql = "INSERT INTO participante (nombre, apellidos, telefono, correo, password, foto_perfil) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);

        $telefono = isset($p->telefono) ? $p->telefono : null;
        $foto_perfil = isset($p->foto_perfil) ? $p->foto_perfil : null;

        $stmt->execute([
            htmlspecialchars(strip_tags($p->nombre)),
            htmlspecialchars(strip_tags($p->apellidos)),
            htmlspecialchars(strip_tags($telefono)),
            $p->correo,
            password_hash($p->password, PASSWORD_BCRYPT),
            $foto_perfil
        ]);

        return true;
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para loguear un participante ya registrado
function loginParticipante($objeto)
{
    global $conn;

    //Validar que el participante exista
    if (!isset($objeto->participante)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'participante'"];
    }

    $p = $objeto->participante;

    //Validar campos obligatorios
    $camposRequeridos = ['correo', 'password'];
    $faltantes = [];

    foreach ($camposRequeridos as $campo) {
        if (!isset($p->$campo) || empty(trim($p->$campo))) {
            $faltantes[] = $campo;
        }
    }

    //Si falta algún campo, mostrar cuáles faltan
    if (!empty($faltantes)) {
        return ["error" => "Campos requeridos faltantes", "campos_faltantes" => $faltantes];
    }

    try {
        //Buscar el participante por correo y obtener la contraseña
        $stmt = $conn->prepare("SELECT id, nombre, apellidos, telefono, correo, password, foto_perfil FROM participante WHERE correo = ?");

        $stmt->execute([$p->correo]);

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        //Si no se encuentra el usuario, retornar error
        if (!$usuario) {
            return false;
        }

        //Verificar la contraseña
        if (password_verify($p->password, $usuario['password'])) {
            return $usuario;
        } else {
            return false;
        }
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para modificar el participante
function modificarParticipante($objeto)
{
    global $conn;

    if (!isset($objeto->participante)) {
        return ["faltaParticipante" => "Estructura incorrecta", "detalle" => "Falta el objeto 'participante'"];
    }

    $p = $objeto->participante;

    try {
        //Obtener datos actuales incluyendo la foto actual
        $stmt = $conn->prepare("SELECT nombre, apellidos, telefono, correo, foto_perfil FROM participante WHERE id = ?");
        $stmt->execute([$p->id]);
        $actual = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$actual) {
            return ["noEncuentra" => "Participante no encontrado"];
        }

        $updates = [];
        $params = [];
        $changed = false;

        if (isset($p->nombre) && $p->nombre !== $actual['nombre']) {
            $updates[] = "nombre = ?";
            $params[] = htmlspecialchars(strip_tags($p->nombre));
            $changed = true;
        }

        if (isset($p->apellidos) && $p->apellidos !== $actual['apellidos']) {
            $updates[] = "apellidos = ?";
            $params[] = htmlspecialchars(strip_tags($p->apellidos));
            $changed = true;
        }

        if (isset($p->telefono) && $p->telefono !== $actual['telefono']) {
            $updates[] = "telefono = ?";
            $params[] = htmlspecialchars(strip_tags($p->telefono));
            $changed = true;
        }

        //Verificar que la propiedad correo existe
        if (property_exists($p, 'correo')) {
            //Asegurarse de que el correo nuevo es distinto al actual
            if ($p->correo !== $actual['correo']) {
                //Verificar si el nuevo correo ya existe (excluyendo al usuario actual)
                $stmt = $conn->prepare("SELECT COUNT(*) as count FROM participante WHERE correo = ? AND id != ?");
                $stmt->execute([$p->correo, $p->id]);
                $result = $stmt->fetch();

                //Si hay al menos 1, mandar mensaje de error de correoExiste
                if ($result['count'] > 0) {
                    return ["correoExiste" => "El correo electrónico ya está en uso por otro participante. Ingrese otro."];
                }

                $updates[] = "correo = ?";
                $params[] = $p->correo;
                $changed = true;
            }
        }

        //Manejo especial para la foto de perfil
        if (property_exists($p, 'foto_perfil')) {
            //Solo actualizamos si realmente hay una nueva foto (no es null y es diferente)
            if ($p->foto_perfil !== null && $p->foto_perfil !== $actual['foto_perfil']) {
                $updates[] = "foto_perfil = ?";
                $params[] = $p->foto_perfil;
                $changed = true;
            }
            //Si foto_perfil es null en el objeto, no hacemos nada (mantenemos la actual)
        }

        if (!$changed) {
            return ["noCambia" => "No se detectaron cambios"];
        }

        $params[] = $p->id;
        $sql = "UPDATE participante SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        return ["success" => true, "message" => "Datos actualizados correctamente"];
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para obtener el id del participante
function obtenerIDParticipante($correo)
{
    global $conn;

    //Validar que el participante exista
    if (!isset($correo)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el valor 'correo'"];
    }

    try {
        //Buscar el id del participante
        $stmt = $conn->prepare("SELECT id FROM participante WHERE correo = ?");

        $stmt->execute([$correo]);

        $p = $stmt->fetch(PDO::FETCH_ASSOC);

        //Si no se encuentra el participante retornar error
        if (!$p) {
            return false;
        }

        return $p["id"];
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para obtener el participante a través de su ID
function obtenerParticipanteID($id)
{
    global $conn;

    //Validar que el participante exista
    if (!isset($id)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el valor 'id'"];
    }

    try {
        //Buscar el participante
        $stmt = $conn->prepare("SELECT id, nombre, apellidos, telefono, correo, password, foto_perfil FROM participante WHERE id = ?");

        $stmt->execute([$id]);

        $p = $stmt->fetch(PDO::FETCH_ASSOC);

        //Si no se encuentra el participante retornar error
        if (!$p) {
            return false;
        }

        return $p;
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para subir una nueva fotografía
function subirFoto($objeto)
{
    global $conn;

    //Validar que la foto subida exista
    if (!isset($objeto)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'foto'"];
    }

    $foto = $objeto->foto;
    $fecha_subida = date("Y-m-d");

    try {
        //Buscar el participante
        $stmt = $conn->prepare("INSERT INTO fotografia (id_participante, imagen, estado, votos, fec_mod) VALUES (?, ?, ?, ?, ?)");

        $stmt->execute([$foto->id_participante, $foto->imagen, $foto->estado, $foto->votos, $fecha_subida]);

        return true;
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para listar las fotos del participante
function listarFotosParticipante($idParticipante)
{
    global $conn;
    try {
        $sc = "SELECT id, id_participante, imagen, estado, votos, fec_mod FROM fotografia WHERE id_participante = ? ORDER BY id";

        $stm = $conn->prepare($sc);

        $stm->execute([$idParticipante]);

        $fotos = $stm->fetchAll(PDO::FETCH_ASSOC);

        return $fotos;
    } catch (Exception $e) {
        return ["error" => $e->getMessage(), "codigo" => $e->getCode()];
    }
}

//Función para eliminar una foto subida por el participante
function borrarFotoParticipante($idFoto)
{
    global $conn;

    try {
        //Validar que el id de la foto exista
        if (!isset($idFoto)) {
            return ["error" => "Estructura incorrecta", "detalle" => "Falta el id de la foto"];
        }

        $sc = "DELETE FROM fotografia WHERE id = ?";

        $stm = $conn->prepare($sc);

        $stm->execute([$idFoto]);

        return ["fotoBorrada" => "La foto ha sido borrada exitosamente."];
    } catch (Exception $e) {
        return ["error" => $e->getMessage(), "codigo" => $e->getCode()];
    }
}

//Función para editar una foto ya existente en la galería del participante
function editarFotoParticipante($foto)
{
    global $conn;

    try {
        //Validar que la foto exista
        if (!isset($foto)) {
            return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'foto'"];
        }

        $sc = "UPDATE fotografia SET imagen = ? WHERE id = ?";

        $stm = $conn->prepare($sc);

        $stm->execute([$foto->imagen, $foto->id]);

        return ["fotoEditada" => "La foto ha sido editada exitosamente."];
    } catch (Exception $e) {
        return ["error" => $e->getMessage(), "codigo" => $e->getCode()];
    }
}

//Función para loguear al Admin
function loginAdmin($admin)
{
    global $conn;

    //Validar que el admin exista
    if (!isset($admin)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'admin'"];
    }

    //Validar campos obligatorios
    $camposRequeridos = ['correo', 'password'];
    $faltantes = [];

    foreach ($camposRequeridos as $campo) {
        if (!isset($admin->$campo) || empty(trim($admin->$campo))) {
            $faltantes[] = $campo;
        }
    }

    //Si falta algún campo, mostrar cuáles faltan
    if (!empty($faltantes)) {
        return ["error" => "Campos requeridos faltantes", "campos_faltantes" => $faltantes];
    }

    try {
        //Buscar el admin por correo y obtener la contraseña
        $stmt = $conn->prepare("SELECT id, nombre, apellidos, telefono, correo, password FROM administrador WHERE correo = ?");

        $stmt->execute([$admin->correo]);

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        //Si no se encuentra el usuario, retornar error
        if (!$usuario) {
            return false;
        }

        //Verificar la contraseña
        if (password_verify($admin->password, $usuario['password'])) {
            return $usuario;
        } else {
            return false;
        }
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para eliminar todas las fotos de un participante si se quiere eliminar al participante
function eliminarFotosParticipante($idParticipante)
{
    global $conn;

    //Validar que el id exista
    if (!isset($idParticipante)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'idParticipante'"];
    }

    try {
        //Eliminar todas las fotos a partir del id del participante
        $stmt = $conn->prepare("DELETE FROM fotografia WHERE id_participante = ?;");

        $stmt->execute([$idParticipante]);

        return ["success" => "Fotos eliminadas del aprticipante correctamente"];
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para eliminar al participante una vez se vacíen sus fotografías
function eliminarParticipante($idParticipante)
{
    global $conn;

    //Validar que el id exista
    if (!isset($idParticipante)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'idParticipante'"];
    }

    try {
        //Eliminar al participante vacío
        $stmt = $conn->prepare("DELETE FROM participante WHERE id = ?;");

        $stmt->execute([$idParticipante]);

        return ["success" => "Eliminado tanto participante como fotos"];
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para cambiar el estado de una fotografía
function cambiarEstadoFotografia($foto)
{
    global $conn;

    //Validar que la foto exista
    if (!isset($foto)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'foto'"];
    }

    try {
        //Eliminar al participante vacío
        $stmt = $conn->prepare("UPDATE fotografia SET estado = ? WHERE id = ?");

        $stmt->execute([$foto->estado, $foto->id]);

        return ["success" => "Estado de la fotografía cambiada correctamente"];
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para sumar un voto de una fotografía específica
function alternarVoto($idFoto, $idParticipante, $idParticipanteVotado)
{
    global $conn;

    //Validar que el id exista
    if (!isset($idFoto)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'idFoto'"];
    }
    if (!isset($idParticipante)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'idParticipante'"];
    }
    if (!isset($idParticipanteVotado)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'idParticipanteVotado'"];
    }

    try {

        $stmt = $conn->prepare("SELECT * FROM votos WHERE id_fotografia = ? AND id_participante = ? AND id_participanteVotado = ?");
        $stmt->execute([$idFoto, $idParticipante, $idParticipanteVotado]);

        $existeVoto = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existeVoto) {
            $stmt = $conn->prepare("UPDATE fotografia SET votos = votos - 1 WHERE id = ?");
            $stmt->execute([$idFoto]);

            $stmt = $conn->prepare("DELETE FROM votos WHERE id_fotografia = ? AND id_participante = ? AND id_participanteVotado = ?");
            $stmt->execute([$idFoto, $idParticipante, $idParticipanteVotado]);

            return ["votoRetirado" => "Voto retirado correctamente"];
        }

        $stmt = $conn->prepare("UPDATE fotografia SET votos = votos + 1 WHERE id = ?");
        $stmt->execute([$idFoto]);

        $stmt = $conn->prepare("INSERT INTO votos (id_participante, id_participanteVotado, id_fotografia) VALUES (?, ?, ?)");
        $stmt->execute([$idParticipante, $idParticipanteVotado, $idFoto]);

        return ["votoRealizado" => "Voto realizado correctamente"];
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para obtener una fotografía a partir de su id
function obtenerFotografiaID($idFoto)
{
    global $conn;

    //Validar que el id exista
    if (!isset($idFoto)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'idFoto'"];
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM fotografia WHERE id = ?");

        $stmt->execute([$idFoto]);

        $foto = $stmt->fetch(PDO::FETCH_ASSOC);

        return $foto;
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para obtener los votos de un participante específico
function obtenerVotosParticipante($idParticipante)
{
    global $conn;

    //Validar que el id exista
    if (!isset($idParticipante)) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta el objeto 'idParticipante'"];
    }

    try {
        $stmt = $conn->prepare("SELECT * FROM votos WHERE id_participante = ?");

        $stmt->execute([$idParticipante]);

        $votos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $votos;
    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

function borrarVotosIDs($idFoto = 0, $idParticipante = 0)
{
    global $conn;

    if ($idFoto === 0 && $idParticipante === 0) {
        return ["error" => "Estructura incorrecta", "detalle" => "Falta idFoto o idParticipante"];
    }

    try {
        $mensajes = [];

        if ($idFoto != 0) {
            $stmt = $conn->prepare("DELETE FROM votos WHERE id_fotografia = ?");
            $stmt->execute([$idFoto]);
            $mensajes[] = "Votos asociados a la foto borrados";
        }

        if ($idParticipante != 0) {
            // Borrar votos emitidos por el participante
            $stmt1 = $conn->prepare("DELETE FROM votos WHERE id_participante = ?");
            $stmt1->execute([$idParticipante]);

            // Borrar votos recibidos por el participante
            $stmt2 = $conn->prepare("DELETE FROM votos WHERE id_participanteVotado = ?");
            $stmt2->execute([$idParticipante]);

            $mensajes[] = "Votos del participante borrados (emitidos y recibidos)";
        }

        return ["votosBorrados" => $mensajes];

    } catch (PDOException $e) {
        return ["error" => "Error en la base de datos", "detalle" => $e->getMessage()];
    }
}

//Función para conectar a la base de datos
function conectar2($bd, $hostname, $usuario, $clave)
{
    try {
        $opciones = [
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ];

        $dsn = 'mysql:host=' . $hostname . ';dbname=' . $bd . ';charset=utf8';
        $conexion = new PDO($dsn, $usuario, $clave, $opciones);

        return $conexion;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode([
            "error" => "Error de conexión a la base de datos",
            "detalle" => $e->getMessage()
        ]));
    }
}
