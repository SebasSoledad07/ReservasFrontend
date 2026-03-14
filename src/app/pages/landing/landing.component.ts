import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  readonly features = [
    {
      icon: '🏢',
      title: 'Multi-empresa',
      desc: 'Cada empresa tiene su propio panel aislado con sus reservas separadas.',
    },
    {
      icon: '🔗',
      title: 'Link público de reserva',
      desc: 'Compartí un link único y tus clientes reservan sin necesitar cuenta.',
    },
    {
      icon: '🔒',
      title: 'Seguridad JWT',
      desc: 'Autenticación con tokens firmados. Solo vos ves las reservas de tu empresa.',
    },
    {
      icon: '⚡',
      title: 'Tiempo real',
      desc: 'Las reservas se reflejan al instante en tu panel de control.',
    },
    {
      icon: '📱',
      title: 'Responsive',
      desc: 'Funciona perfecto desde el celular, tablet y escritorio.',
    },
    {
      icon: '✂️',
      title: 'Multi-servicio',
      desc: 'Gestioná distintos tipos de servicios bajo una sola cuenta.',
    },
  ];

  readonly steps = [
    { num: '01', title: 'Registrá tu empresa', desc: 'Creá una cuenta con el nombre de tu empresa en segundos.' },
    { num: '02', title: 'Compartí tu link', desc: 'Copiá el link público y enviaselo a tus clientes.' },
    { num: '03', title: 'Gestioná tus turnos', desc: 'Vé todas las reservas en tu panel y cancelá cuando sea necesario.' },
  ];
}
