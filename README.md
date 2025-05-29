# 📘 Manual de Instalación y Despliegue

## 📄 Descripción

Este manual te guiará paso a paso en el proceso de despliegue completo de esta aplicación web, abarcando tanto el **Frontend** como el **Backend**.

---

## 🚀 Introducción

Antes de comenzar, ten en cuenta los siguientes aspectos clave:

- La aplicación está desarrollada con **Angular**.
- La comunicación con el servidor se realiza mediante un único archivo: `servidor.php`.
- El **Frontend** se desplegará en **[Netlify](https://www.netlify.com/)**.
- El **Backend** se alojará en **Arsys** (aunque puedes usar otro hosting).
- El despliegue es **separado** (Frontend y Backend en plataformas distintas).

> ⚠️ **Nota**: Puedes utilizar otros servicios de hosting, pero podrían variar rutas, carpetas o configuraciones necesarias.

---

## 🌐 Despliegue del Frontend (Netlify)

Usaremos **Netlify** para desplegar el Frontend, ya que es ideal para aplicaciones estáticas como las generadas por Angular.

### ✅ Pasos:

1. Crea una cuenta en [Netlify](https://www.netlify.com/).
2. Enlaza tu cuenta de **GitHub** desde Netlify.
3. Selecciona el repositorio que contiene tu proyecto Angular.
4. En la sección **"Build settings"**:
   - Comando de build:

     ```bash
     ng build --configuration production
     ```

   - Carpeta de salida (por ejemplo):

     ```
     dist/nombre-del-proyecto
     ```

5. Haz clic en **"Deploy site"**.
6. Realiza algún cambio en la rama seleccionada (si usas despliegue automático) para comprobar que el despliegue funciona.
7. Accede al dominio generado por Netlify para ver tu aplicación en producción.

---

## 🖥️ Despliegue del Backend (Arsys)

El backend se alojará en **Arsys**, aunque puedes adaptarlo a cualquier proveedor.

### ✅ Pasos:

1. **Importar la base de datos**:
   - Accede al panel de control de Arsys.
   - Dirígete a la sección **MySQL** e importa tu base de datos local.

2. **Acceso por FTP**:
   - Entra a la sección **FTP**.
   - Copia los datos de acceso (host, usuario, contraseña).
   - Conéctate mediante **FileZilla** o un cliente similar.

3. **Subir `servidor.php`**:
   - Sube el archivo a la carpeta pública (normalmente llamada `html`, `www`, etc.).

4. **Actualizar rutas en Angular**:
   - Edita tu archivo `environment.ts`:

     ```ts
     export const environment = {
       production: true,
       baseUrl: 'https://tudominio.com/servidor.php'
     };
     ```

5. **Activar HTTPS (SSL)**:
   - Desde el panel de Arsys, activa el certificado SSL para tu dominio.
   - Espera unos minutos hasta que se apliquen los cambios.

---

## ⚙️ Consideraciones Técnicas

Asegúrate de incluir estas cabeceras en `servidor.php` para evitar problemas de CORS:

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
?>
```
---

## 📦 Requisitos Previos

Antes de comenzar el despliegue, asegúrate de tener lo siguiente:

### 🛠️ Herramientas necesarias:

- [Node.js](https://nodejs.org/) (versión recomendada: LTS)
- [Angular CLI](https://angular.io/cli) instalado globalmente:
  
  ```bash
  npm install -g @angular/cli
