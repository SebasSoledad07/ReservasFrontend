import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReservaService } from '../services/reserva.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly reservaService = inject(ReservaService);

  readonly mobileMenuOpen = signal(false);
  readonly user = this.authService.currentUser;

  readonly companyDisplayName = computed(() => {
    const u = this.user();
    return u?.companyName ?? u?.username ?? 'Mi empresa';
  });

  readonly initials = computed(() => {
    const name = this.companyDisplayName();
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.reservaService.limpiarCache();
    this.authService.logout();
  }
}
