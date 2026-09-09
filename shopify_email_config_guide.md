# Guía para Configurar Correos y Personalización en Shopify

Esta guía contiene los pasos necesarios para configurar el correo de origen de tu tienda (para que los correos lleguen desde `info@arduino.hn`) y cómo personalizar la apariencia de los correos y la página de pagos para reflejar la marca **ArduinoHN**.

## 1. Cambiar el correo de remitente a `info@arduino.hn`

Para que los correos lleguen desde tu dominio y no desde direcciones genéricas de Shopify o correos personales:

1. Inicia sesión en el panel de administración de tu tienda Shopify.
2. Ve a **Configuración** (Settings), ubicado en la esquina inferior izquierda.
3. Haz clic en **Notificaciones** (Notifications).
4. Busca la sección **Correo electrónico del remitente** (Sender email).
5. Cambia la dirección actual por `info@arduino.hn`.
6. **Autenticación del Dominio:** Shopify te pedirá autenticar tu dominio. Te proporcionarán una serie de registros DNS (como CNAME). Deberás ingresar a la plataforma de tu proveedor de dominio (donde compraste `arduino.hn`) y agregar estos registros. Esto es crucial para asegurar que los correos no se vayan a la carpeta de SPAM y eliminen la etiqueta de "enviado a través de shopifyemail.com".

## 2. Personalizar el diseño de los correos electrónicos

Para hacer que los correos destaquen y promocionen más a ArduinoHN:

1. En el menú de **Configuración > Notificaciones**.
2. Haz clic en la sección **Notificaciones a clientes** (Customer notifications) que ves en tu pantalla.
3. En la nueva pantalla, busca el botón **Personalizar** (Customize), que generalmente se encuentra en la parte superior o esquina superior derecha.
4. En este editor visual podrás:
   * **Agregar tu logotipo:** Sube el logo oficial de ArduinoHN.
   * **Cambiar el color de acento:** Ajusta el color de los botones para que coincidan con la paleta de colores de tu marca.
5. *(Opcional)* Si quieres hacer cambios más avanzados en un correo específico, puedes regresar a **Notificaciones a clientes**, hacer clic en el correo que deseas modificar (por ejemplo, **Confirmación de pedido**) y usar la opción para editar el código HTML.

## 3. Personalizar la página de estado del pedido y el Checkout

Para asegurar que la experiencia visual de la marca se mantenga incluso después de la compra:

1. Ve a **Configuración > Pantalla de pago** (Checkout).
2. Haz clic en el botón **Personalizar** (Customize) en la sección de apariencia.
3. Esto abrirá el editor de temas de Shopify. Aquí puedes subir tu logo, cambiar los colores de fondo y los colores de los botones para la página donde los clientes ingresan sus datos de pago y la página donde revisan el estado de su orden.
4. Haz clic en **Guardar** cuando termines.

---
*Nota: Guarda este documento para cuando tu proveedor te entregue los accesos a los correos corporativos.*
