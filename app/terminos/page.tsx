import { LegalShell, H2 } from '@/components/legal/LegalShell'

export const metadata = { title: 'Términos y Condiciones — Vision OS' }

export default function TerminosPage() {
  return (
    <LegalShell title="Términos y Condiciones" updated="junio de 2026">
      <p>
        Estos Términos regulan el uso de <b>Vision OS</b>, un producto operado por <b>Byrcointh LLC</b> ("la Plataforma"). Al crear una cuenta o usar el servicio, aceptás estos términos en su totalidad.
      </p>

      <H2>1. El servicio</H2>
      <p>
        Vision OS es una plataforma para gestionar turnos, pacientes, pagos y marketing de negocios de servicios. El servicio se ofrece "tal cual está", y trabajamos continuamente para mejorarlo y mantenerlo disponible.
      </p>

      <H2>2. Tu cuenta</H2>
      <p>
        Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad en tu cuenta. Debés brindar información veraz y mantenerla actualizada. Debés ser mayor de edad y tener capacidad legal para contratar.
      </p>

      <H2>3. Uso correcto</H2>
      <p>
        Te comprometés a usar la Plataforma de forma legal y a no: (a) cargar datos de terceros sin su consentimiento; (b) usar el servicio para fines ilícitos o spam; (c) intentar vulnerar la seguridad del sistema o el acceso a datos de otros negocios.
      </p>

      <H2>4. Datos de tus clientes</H2>
      <p>
        Vos sos el responsable de los datos de tus clientes/pacientes que cargues. Te comprometés a tratarlos conforme a la legislación de protección de datos aplicable y a contar con el consentimiento necesario, especialmente para datos sensibles (como la historia clínica) y para enviar mensajes por WhatsApp.
      </p>

      <H2>5. Planes, prueba gratis y pagos</H2>
      <p>
        Ofrecemos una <b>prueba gratuita de 14 días</b>, sin necesidad de tarjeta. Al finalizar la prueba, para seguir usando el servicio debés contratar un plan pago. Los planes se cobran por <b>suscripción mensual</b> y se <b>renuevan automáticamente</b> cada mes hasta que la canceles.
      </p>
      <p>
        Los pagos se procesan a través de <b>Stripe</b> (tarjeta internacional, en USD) o <b>Mercado Pago</b> (en pesos). Podés <b>cancelar cuando quieras</b> desde la sección "Mi plan"; el acceso se mantiene hasta el fin del período ya pagado. La falta de pago puede suspender el acceso al servicio. Los precios pueden actualizarse informándote con anticipación.
      </p>

      <H2>6. Disponibilidad</H2>
      <p>
        Hacemos nuestro mejor esfuerzo para que el servicio esté disponible de forma continua, pero pueden existir interrupciones por mantenimiento o causas ajenas. Recomendamos exportar tus datos periódicamente como respaldo.
      </p>

      <H2>7. Limitación de responsabilidad</H2>
      <p>
        En la medida permitida por la ley, Vision OS no será responsable por daños indirectos, pérdida de ganancias o de datos derivados del uso o la imposibilidad de uso del servicio. Nuestra responsabilidad total se limita al monto abonado por el servicio en los últimos meses.
      </p>

      <H2>8. Baja del servicio</H2>
      <p>
        Podés dejar de usar el servicio y solicitar la eliminación de tu cuenta cuando quieras. Nos reservamos el derecho de suspender cuentas que incumplan estos términos.
      </p>

      <H2>9. Cambios</H2>
      <p>
        Podemos modificar estos términos. Los cambios importantes serán comunicados y la versión vigente estará siempre disponible en esta página.
      </p>

      <H2>10. Ley aplicable</H2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto, las partes se someten a los tribunales ordinarios competentes.
      </p>

      <H2>11. Contacto</H2>
      <p>
        Por consultas sobre estos términos, escribinos a <b>rociotorres@byrcointh.online</b>.
      </p>
    </LegalShell>
  )
}
