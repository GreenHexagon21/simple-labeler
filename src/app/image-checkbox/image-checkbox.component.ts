import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-image-checkbox',
  templateUrl: './image-checkbox.component.html',
  styleUrls: ['./image-checkbox.component.scss'],
})
export class ImageCheckboxComponent {
  @Input() checked = false;
  @Input() label!: string;
  @Input() image = '';
  @Input() groupLabel?: string;
  @Input() id!: string;

  @ViewChild('checkbox', { static: true }) checkbox!: ElementRef<HTMLInputElement>;

  @Output() checkboxChanged = new EventEmitter<{ checked: boolean; label?: string; groupLabel?: string }>();
  @Output() arrowRight = new EventEmitter<number>();
  @Output() arrowLeft = new EventEmitter<number>();
  @Output() hide = new EventEmitter<void>();

  /** Public API used by parent to reset state without touching native element directly */
  setChecked(next: boolean): void {
    this.checked = next;
    if (this.checkbox?.nativeElement) {
      this.checkbox.nativeElement.checked = next;
    }
  }

  /** Sync when the user clicks the native input */
  onNativeChange(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    this.checked = !!target.checked;
    this.emitChange();
  }

  private emitChange(): void {
    this.checkboxChanged.emit({
      checked: this.checked,
      label: this.label,
      groupLabel: this.groupLabel,
    });
  }

  toggleCheckbox(): void {
    this.setChecked(!this.checked);
    this.emitChange();
  }

  /** Keyboard handling scoped to the checkbox; stop propagation to keep focus logic predictable */
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    event.stopPropagation();

    switch (event.key) {
      case 'Enter':
      case ' ' /* space char in some browsers */:
        this.toggleCheckbox();
        event.preventDefault();
        break;

      // Some environments report Space via code
      default:
        if ((event as any).code === 'Space') {
          this.toggleCheckbox();
          event.preventDefault();
          break;
        }
    }

    switch (event.key) {
      case 'ArrowUp':
        this.focusSibling(-1);
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.focusSibling(1);
        event.preventDefault();
        break;
      case 'PageUp':
        this.focusAdjacentGroup(-1);
        event.preventDefault();
        break;
      case 'PageDown':
        this.focusAdjacentGroup(1);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.arrowLeft.emit(-1);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.arrowRight.emit(1);
        event.preventDefault();
        break;
      case 'ű':
        this.hide.emit();
        event.preventDefault();
        break;
      case 'Home':
        this.focusByIndex(0);
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  /** ===== Focus helpers (DOM queries kept lightweight & scoped) ===== */

  private allCheckboxes(): HTMLInputElement[] {
    return Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
  }

  private indexIn(all: HTMLInputElement[]): number {
    return all.findIndex((cb) => cb.id === this.id);
  }

  private focusByIndex(index: number): void {
    const all = this.allCheckboxes();
    if (!all.length) return;
    const idx = Math.max(0, Math.min(index, all.length - 1));
    all[idx]?.focus();
    all[idx]?.closest('.checkbox-flex')?.scrollIntoView({ block: 'center' });
  }

  private focusSibling(offset: number): void {
    const all = this.allCheckboxes();
    if (!all.length) return;
    const current = this.indexIn(all);
    const next = ((current + offset) % all.length + all.length) % all.length;
    all[next]?.focus();
    all[next]?.closest('.checkbox-flex')?.scrollIntoView({ block: 'center' });
  }

  private focusAdjacentGroup(direction: 1 | -1): void {
    const all = this.allCheckboxes();
    if (!all.length) return;
    const current = this.indexIn(all);
    if (current < 0) return;

    const curGroup = all[current].closest('.group')?.id;

    let offset = direction;
    let next = ((current + offset) % all.length + all.length) % all.length;

    // Skip within same group until we find a different one or wrap
    while (all[next].closest('.group')?.id === curGroup && next !== current) {
      offset += direction;
      next = ((current + offset) % all.length + all.length) % all.length;
    }

    all[next]?.focus();
    all[next]?.closest('.checkbox-flex')?.scrollIntoView({ block: 'center' });
  }
}
