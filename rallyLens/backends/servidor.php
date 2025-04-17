<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Configuración de errores (solo para desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Conexión a la base de datos
$conn = conectar2("rallyfotografico", "root", "");

// Manejo de preflight request (CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener y decodificar los datos de entrada
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
        $sc = "SELECT id, id_administrador, id_participante, estado, votos, fec_mod FROM fotografia ORDER BY id";
        $stm = $conn->prepare($sc);
        $stm->execute();
        return ["success" => true, "data" => $stm->fetchAll(PDO::FETCH_ASSOC)];
    } catch (Exception $e) {
        return ["error" => $e->getMessage(), "codigo" => $e->getCode()];
    }
}

// Función para listar participantes
function listadoParticipantes()
{
    global $conn;
    try {
        $sc = "SELECT id, nombre, apellidos, telefono, correo FROM participante ORDER BY id";
        $stm = $conn->prepare($sc);
        $stm->execute();
        return ["success" => true, "data" => $stm->fetchAll(PDO::FETCH_ASSOC)];
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
        $sql = "INSERT INTO participante (nombre, apellidos, telefono, correo, password) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);

        $telefono = isset($p->telefono) ? $p->telefono : null;

        $stmt->execute([
            htmlspecialchars(strip_tags($p->nombre)),
            htmlspecialchars(strip_tags($p->apellidos)),
            htmlspecialchars(strip_tags($telefono)),
            $p->correo,
            password_hash($p->password, PASSWORD_BCRYPT)
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
        if (!isset($p->$campo) || empty(trim($admin->$campo))) {
            $faltantes[] = $campo;
        }
    }

    //Si falta algún campo, mostrar cuáles faltan
    if (!empty($faltantes)) {
        return ["error" => "Campos requeridos faltantes", "campos_faltantes" => $faltantes];
    }

    try {
        //Buscar el admin por correo y obtener la contraseña
        $stmt = $conn->prepare("SELECT id, nombre, apellidos, telefono, correo, password, foto_perfil FROM administrador WHERE correo = ?");

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

//Función para conectar a la base de datos
function conectar2($bd, $usuario, $clave)
{
    try {
        $opciones = [
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ];

        $dsn = 'mysql:host=localhost;dbname=' . $bd . ';charset=utf8';
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
