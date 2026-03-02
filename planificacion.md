# ⛪ Gestión de Sistema NC - Plan Maestro de Desarrollo

## 📄 Información General
* **Nombre del Sistema:** Gestión de Sistema NC (Nuevos Comienzos)
* **Tipo de Aplicación:** Web App 100% Responsive (Mobile-First)
* **Base de Datos:** Persistencia en archivos JSON locales (Única fuente de verdad)
* **Filosofía:** Camino espiritual digital que guía desde la primera visita hasta la membresía activa.

---

## 👥 1. Estructura de Roles y Seguridad
Acceso mediante usuario y contraseña con permisos granulares:

| Rol | Alcance y Permisos |
| :--- | :--- |
| **Pastor Principal** | Acceso total: Finanzas, Gestión de Usuarios, Evaluación Espiritual, Bajas y Dashboard Completo. |
| **Pastor Asociado** | Acceso administrativo: Gestión de personas, Finanzas, Bajas y Creación de usuarios. |
| **Líder** | Acceso operativo: Registro de visitas, Lista de personas y Ficha Informativa básica. |
| **Min. Conexión** | Registro de nuevas visitas y control de asistencia inicial. |
| **Aliado (Portal)** | Acceso temporal restringido (vía email) para completar perfil y pacto. |

---

## 📈 2. El Flujo Espiritual (Estados Obligatorios)
El sistema avanza a las personas automáticamente. **Ningún estado se puede saltar manualmente.**



1.  **Visita:** Registro inicial. (Si es su 2da  visita, el sistema lo promueve automáticamente).
2.  **Candidato a Puertas Abiertas:** Invitación formal al primer evento de conexión.
3.  **Candidato a Aliados:** El Pastor habilita el acceso al portal del aliado.
4.  **Candidato a Bautizo:** Estado automático si el usuario indica que desea bautizarse en el portal.
5.  **Miembro Activo:** Estado final tras completar perfil, pacto y bautismo.

---

## 🖥️ 3. Módulos y Formularios

### A. Registro de Visitas (Secciones)
Formulario con textos en blanco para máxima legibilidad sobre fondo oscuro:
* **Sección 1 (Personales):** Nombre Completo, Edad, Zona de residencia, WhatsApp, Email.


### B. Tu Perfil de Aliado (Portal de Autogestión)
* **Identidad:** Carga de foto de perfil (visualización en grande al hacer clic).
* **Sección 2 (Comunicación):** Canal preferido (WhatsApp/Email) y tipo de información deseada.
* **Sección 3 (Familia):** Estado civil, nombre de pareja y lógica de hijos (condicional).
* **Camino Espiritual:** ¿Has sido bautizado por una iglesia evangélica? ¿Te gustaría bautizarte? ¿Qué tiempo hace que vienes de otra iglesia?
* **Perfil Personal:** Profesión, actividades que disfruta, talentos (música, predicación, etc.) y disposición de servicio.
* **Pacto de Membresía:** Aceptación de los 9 compromisos ministeriales (Seguir a Cristo, Honrar pastores, Apoyo financiero, etc.).

### C. Gestión Financiera
* **Ingresos:** Registro de Diezmos, Ofrendas y Ofrenda Pro-Templo.
* **Egresos:** Registro de gastos mensuales con categoría (Servicios, Mantenimiento, Obra Social) y descripción.
* **Transparencia:** Reporte mensual automático del balance neto.

---

## 📊 4. Dashboard (Jerarquía de Visualización)

### Prioridad 1: Flujo de Personas (Las Almas)
* **Embudo de Integración:** Visitas vs. Aliados vs. Miembros.
* **Métrica de Bautismo:** Seguimiento a candidatos pendientes por bautizar.
* **Zona de Alerta:** Personas estancadas por más de 3 meses (Próximas a baja automática).

### Prioridad 2: Salud Financiera (La Mayordomía)
* **Balance General:** Comparativa visual de Ingresos vs. Gastos.
* **Distribución de Fondos:** Gráfica de origen (Diezmos/Ofrendas/Pro-Templo).

---

## 📧 5. Automatización y Reglas de Negocio
* **Correos Automáticos:** Disparados por eventos: Bienvenida, Invitación a Puertas Abiertas, Acceso al Portal y Bienvenida a Membresía.
* **Baja Automática:** El sistema inactiva registros estancados (>3 meses) automáticamente.
* **Baja Manual:** Acción exclusiva para Pastores con confirmación de seguridad.
* **Cierre de Portal:** El acceso del aliado se inhabilita inmediatamente al dar clic en "Finalizar Proceso" dentro del portal.

---

## 🛠️ 6. Especificaciones Técnicas
* **Frontend:** React con Tailwind CSS (Dark Mode).
* **Iconos:** Lucide-React.
* **Persistencia:** Almacenamiento JSON local, preparado para futura migración a SQL.
* **Responsive:** Diseño Mobile-First optimizado para uso en el templo.

•	Frontend: Next.js 14 (App Router) y Tailwind CSS. Utiliza Shadcn/UI para el formulario y el componente de subida de fotos.
•	Backend: Usa el Model Context Protocol (MCP) para conectar con Supabase. Define la tabla aliados_perfil para guardar estos datos adicionales, vinculada a la tabla personas.

•	Seguridad: Configura las políticas RLS para que cada aliado solo pueda ver y editar su propio perfil.



---
**Generado para:** Iglesia Nuevos Comienzos  
**Ingeniería de Sistemas - Gestión NC v2.0 (2026)**