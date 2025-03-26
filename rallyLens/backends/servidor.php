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
    }
}

// Función para listar administradores
function listadoAdmins() {
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
function listadoFotos() {
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
function listadoParticipantes() {
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

// Función para registrar un nuevo participante
function registrarParticipante($objeto) {
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

// Función para conectar a la base de datos
function conectar2($bd, $usuario, $clave) {
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