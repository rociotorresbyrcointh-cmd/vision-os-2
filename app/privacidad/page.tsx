import { LegalShell, H2 } from '@/components/legal/LegalShell'

export const metadata = { title: 'Política de Privacidad — Vision OS' }

export default function PrivacidadPage() {
  return (
    <LegalShell title="Política de Privacidad" updated="junio de 2026">
      <p>
        En <b>Vision OS</b> ("nosotros", "la Plataforma") nos tomamos en serio la privacidad de tus datos y los de tus clientes.
        Esta política explica qué información recopilamos, cómo la usamos y cuáles son tus derechos. Al usar la Plataforma, aceptás lo aquí descrito.
      </p>

      <H2>1. Qué datos recopilamos</H2>
      <p>
        <b>Datos de tu cuenta:</b> nombre del negocio, correo electrónico y la información de configuración que cargues (profesionales, servicios, horarios, etc.).
      </p>
      <p>
        <b>Datos de tus clientes/pacientes:</b> la información que vos cargás para gestionar tu negocio (nombre, teléfono, DNI, turnos, historia clínica si la activás, pagos). Vos sos responsable de esos datos; nosotros actuamos como encargados del tratamiento por tu cuenta.
      </p>
      <p>
        <b>Datos técnicos:</b> información mínima necesaria para el funcionamiento y la seguridad (por ejemplo, sesión de inicio).
      </p>

      <H2>2. Cómo usamos los datos</H2>
      <p>
        Usamos los datos exclusivamente para prestar el servicio: mostrar tu agenda, gestionar turnos, pagos, reportes y las funciones que actives. <b>No vendemos ni compartimos tus datos con terceros</b> para fines publicitarios.
      </p>

      <H2>3. Dónde se almacenan</H2>
      <p>
        Los datos se almacenan de forma segura en servidores profesionales en la nube (infraestructura de Supabase / Amazon Web Services). La conexión está cifrada (HTTPS) y las contraseñas se guardan encriptadas. Cada negocio solo puede acceder a su propia información (aislamiento por organización).
      </p>

      <H2>4. Servicios de terceros</H2>
      <p>
        Para algunas funciones usamos proveedores que procesan datos por nuestra cuenta, como el alojamiento de la base de datos (Supabase), el hosting de la aplicación (Vercel) y, si usás el asistente de contenido, un proveedor de inteligencia artificial. Cada uno cumple con sus propios estándares de seguridad.
      </p>

      <H2>5. Tus derechos</H2>
      <p>
        Podés acceder, corregir, exportar o eliminar tus datos en cualquier momento desde la propia aplicación (por ejemplo, exportar a Excel o usar la papelera). Si querés eliminar tu cuenta por completo, escribinos.
      </p>

      <H2>6. Conservación</H2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa. Si dejás de usar el servicio, podés solicitar su eliminación.
      </p>

      <H2>7. Cambios</H2>
      <p>
        Podemos actualizar esta política. Te avisaremos de cambios importantes y la versión vigente siempre estará disponible en esta página.
      </p>

      <H2>8. Contacto</H2>
      <p>
        Por cualquier consulta sobre privacidad, escribinos a <b>rociobyrcointh@gmail.com</b>.
      </p>
    </LegalShell>
  )
}
