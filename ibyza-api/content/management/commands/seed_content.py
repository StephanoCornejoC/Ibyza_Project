from django.core.management.base import BaseCommand
from content.models import PreguntaFrecuente, Testimonio, Beneficio

FAQS = [
    ('Cuanto demora el proceso de separacion?', 'La separacion se confirma en 24 horas habiles tras verificar el pago.'),
    ('Como puedo agendar una visita al proyecto?', 'Desde la pagina de contacto puedes agendar una visita. Te contactaremos para confirmar.'),
    ('Cuales son los metodos de pago aceptados?', 'Aceptamos tarjetas de credito/debito via Culqi y transferencia bancaria.'),
    ('Hay opciones de financiamiento?', 'Si, trabajamos con varios bancos para ofrecer creditos hipotecarios. Consulta con un asesor.'),
    ('Los departamentos estan entregados?', 'Depende del proyecto. Revisa el estado ("en venta", "preventa", "entregado") en cada proyecto.'),
]

TESTIMONIOS = [
    ('Maria Gonzales', 'Propietaria Mira Verde', 'Excelente experiencia, el proceso fue transparente y profesional.', 5),
    ('Carlos Mendoza', 'Inversionista', 'Inverti en Bolivar 205 y fue la mejor decision. Recomiendo IBYZA.', 5),
    ('Ana Rodriguez', 'Propietaria Boreal', 'El equipo fue amable y la entrega puntual. Muy satisfecha.', 5),
]

BENEFICIOS = [
    ('Ubicacion privilegiada', 'Todos nuestros proyectos estan en zonas consolidadas de Arequipa.', 'MapPin'),
    ('Calidad garantizada', 'Construimos con los mas altos estandares y acabados premium.', 'ShieldCheck'),
    ('Asesoria personalizada', 'Un asesor te acompana en todo el proceso de compra.', 'HeadphonesIcon'),
    ('Financiamiento flexible', 'Trabajamos con los principales bancos del pais.', 'CreditCard'),
]


class Command(BaseCommand):
    help = 'Seed FAQ, Testimonios y Beneficios de ejemplo.'

    def handle(self, *args, **options):
        for idx, (pregunta, respuesta) in enumerate(FAQS, 1):
            obj, created = PreguntaFrecuente.objects.get_or_create(
                pregunta=pregunta,
                defaults={'respuesta': respuesta, 'orden': idx, 'activo': True},
            )
            self.stdout.write(('+ ' if created else '~ ') + f'FAQ: {pregunta[:50]}')

        for idx, (nombre, cargo, texto, stars) in enumerate(TESTIMONIOS, 1):
            obj, created = Testimonio.objects.get_or_create(
                nombre=nombre,
                defaults={'cargo': cargo, 'testimonio': texto, 'calificacion': stars, 'orden': idx, 'activo': True},
            )
            self.stdout.write(('+ ' if created else '~ ') + f'Testimonio: {nombre}')

        for idx, (titulo, desc, icono) in enumerate(BENEFICIOS, 1):
            obj, created = Beneficio.objects.get_or_create(
                titulo=titulo,
                defaults={'descripcion': desc, 'icono': icono, 'orden': idx, 'activo': True},
            )
            self.stdout.write(('+ ' if created else '~ ') + f'Beneficio: {titulo}')

        self.stdout.write(self.style.SUCCESS('Seed completado'))
