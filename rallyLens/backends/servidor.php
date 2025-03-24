<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");

header('Content-Type: application/json');
//include("conexion.php");
$conn = Conectar2("rallyfotografico", "root", "");

$datos = file_get_contents('php://input');
$objeto = json_decode($datos);

//$objeto = new stdClass();
//$objeto->servicio = "listarParticipantes";

if ($objeto != null) {
	switch ($objeto->servicio) {
		case "listarAdmins":
			print json_encode(listadoAdmins());
			break;
		case "listarFotos":
			print json_encode(listadoFotos());
			break;
		case "listarParticipantes":
			print json_encode(listadoParticipantes());
			break;
		case "registrarParticipante":
			registrarParticipante($objeto);
			break;
	}
}

//Función para listar administradores
function listadoAdmins()
{
	global $conn;
	try {
		$sc = "Select id, nombre, apellidos, telefono, correo, password From administrador Order By id";
		$stm = $conn->prepare($sc);
		$stm->execute();
		return ($stm->fetchAll(PDO::FETCH_ASSOC));
	} catch (Exception $e) {
		die($e->getMessage());
	}
}

//Función para listar fotografías
function listadoFotos()
{
	global $conn;
	try {
		$sc = "select id, id_administrador, id_participante, estado, votos, fec_mod From fotografia Order by id";
		$stm = $conn->prepare($sc);
		$stm->execute();
		return ($stm->fetchAll(PDO::FETCH_ASSOC));
	} catch (Exception $e) {
		die($e->getMessage());
	}
}

//Función para listar participantes
function listadoParticipantes()
{
	global $conn;
	try {
		$sc = "Select id, nombre, apellidos, telefono, correo, password From participante Order By id";
		$stm = $conn->prepare($sc);
		$stm->execute();
		return ($stm->fetchAll(PDO::FETCH_ASSOC));
	} catch (Exception $e) {
		die($e->getMessage());
	}
}

//Función para registrar un nuevo participante
function registrarParticipante($objeto)
{
	global $conn;
	try {
		$listadoParticipante =  listadoParticipantes();

		foreach ($listadoParticipante as $participante) {
			echo $participante;
		}

		/*$sql = "INSERT INTO personas(DNI, NOMBRE, APELLIDOS) VALUES (?, ?, ?)";
		$conn->prepare($sql)->execute(
			array(
				$objeto->dni,
				$objeto->nombre,
				$objeto->apellidos
			)
		);*/
		return true;
	} catch (Exception $e) {
		die($e->getMessage());
		return false;
	}
}

function borrarPersona($id)
{
	global $conn;
	try {
		$sql = "Delete From personas Where ID = ?";
		$conn->prepare($sql)->execute(array($id));
		return true;
	} catch (Exception $e) {
		die($e->getMessage());
		return false;
	}
}

function modificarPersona($objeto)
{
	global $conn;
	try {
		$sql = "UPDATE personas SET 
							dni				= ?,
							nombre		= ?, 
							apellidos	= ?
						WHERE ID = ?";
		$conn->prepare($sql)->execute(
			array(
				$objeto->dni,
				$objeto->nombre,
				$objeto->apellidos,
				$objeto->id
			)
		);
		return true;
	} catch (Exception $e) {
		die($e->getMessage());
		return false;
	}
}

function selPersonaID($id)
{
	global $conn;
	try {
		$sc = "Select dni, nombre, apellidos From personas Where ID = ?";
		$stm = $conn->prepare($sc);
		$stm->execute(array($id));
		return ($stm->fetch(PDO::FETCH_ASSOC));
	} catch (Exception $e) {
		die($e->getMessage());
	}
}

function Conectar($bd, $usuario, $clave)
{
	$conn = null;
	try {
		//  NOS CONECTAMOS (y seleccionamos la bd):
		$conn = new PDO('mysql:host=localhost;dbname=' . $bd, $usuario, $clave);
	} catch (PDOException $e) {
		print "¡Error!: " . $e->getMessage() . "<br/>";
	}
	return $conn;
}


function conectar2($bd, $usuario, $clave)
{
	try {
		$opciones = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8");
		@$bd = new PDO('mysql:host=localhost;dbname=' . $bd, $usuario, $clave, $opciones);
		$bd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //aquí le digo que voy a utilizar excepciones
		return $bd;
	} catch (PDOException $e) {
		echo ("No se ha podido conectar a la base de datos. Código de error: " . $e->getMessage());
	}
}


/*funciones de conexión*/
function Consulta($conn, $sc)
{
	$rs = null;
	try {
		$rs = $conn->query($sc);
	} catch (PDOException $e) {
		print "¡Error!: " . $e->getMessage() . "<br/>";
	}
	return $rs;
}
