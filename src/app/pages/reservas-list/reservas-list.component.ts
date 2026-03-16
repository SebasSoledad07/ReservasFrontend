import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import type { Reserva } from '../../models/reserva.model';

@Component({
  selector: 'app-reservas-list',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './reservas-list.component.html',
  styleUrl: './reservas-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservasListComponent implements OnInit {
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);

  readonly reservas$ = this.reservaService.reservas$;

  ngOnInit(): void {
    // Fuerza recarga con el token del usuario activo al entrar al panel.
    // Evita que se muestren reservas en caché de un login anterior.
    this.reservaService.refrescar();
  }

  private readonly cargando = signal(false);
  private readonly reservaEnProceso = signal<Reserva | null>(null);
  readonly linkCopiado = signal(false);

  /** Nombre de la empresa autenticada para mostrar en el panel */
  readonly companyDisplayName = computed(() => {
    const user = this.authService.currentUser();
    return user?.companyName ?? user?.username ?? 'Mi empresa';
  });

  /** Link público para compartir.
   *  Usa el slug del JWT si el backend lo devuelve; si no, usa el username como fallback.
   *  Asegurá que el slug/username coincide con lo configurado en el backend. */
  readonly publicLink = computed(() => {
    const user = this.authService.currentUser();
    const slug = user?.slug ?? user?.username;
    return slug ? `${window.location.origin}/publico/${slug}/reservas` : null;
  });

  copyLink(): void {
    const link = this.publicLink();
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.linkCopiado.set(true);
      setTimeout(() => this.linkCopiado.set(false), 2000);
    });
  }

  // ✅ Método cancelar simplificado
  cancelar(reserva: Reserva): void {
    if (reserva.status !== 'ACTIVE') return;

    this.cargando.set(true);
    this.reservaEnProceso.set(reserva);

    this.reservaService.cancelar(reserva.id).subscribe({
      next: () => {
        console.log('✅ Reserva cancelada:', reserva.id);
        this.cargando.set(false);
        this.reservaEnProceso.set(null);
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.reservaService.refrescar(); // Recarga si falla
        this.cargando.set(false);
        this.reservaEnProceso.set(null);
      },
    });
  }

  // ✅ Nueva reserva
  crearNueva(): void {
    console.log('Abrir formulario nueva reserva');
  }

  // ✅ Eliminar definitivamente
  eliminar(reserva: Reserva): void {
    if (!confirm(`¿Eliminar reserva de ${reserva.clientName}?`)) return;

    this.reservaService.eliminar(reserva.id).subscribe({
      next: () => console.log('🗑️ Reserva eliminada:', reserva.id),
      error: (error) => {
        console.error('Error eliminando:', error);
        this.reservaService.refrescar();
      },
    });
  }

  logout(): void {
    this.reservaService.limpiarCache(); // Limpia caché antes de salir
    this.authService.logout();
  }
}
