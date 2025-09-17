import {
  Component,
  QueryList,
  ViewChildren,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { ImageCheckboxComponent } from '../image-checkbox/image-checkbox.component';

interface Tag { name: string; example: string; }
interface TagGroup { defaultTag: string; tags: Tag[]; }

import { groups } from '../res/json/tags.json';
import { baseline } from '../res/json/tags.json';

type ImageEntry = { name: string; url: string };

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})
export class FileSelectorComponent implements AfterViewInit {
  private static readonly STORAGE_KEY = 'fileSelector.progressIndex'; // NEW

  images: ImageEntry[] = [];
  currentImageIndex = 0;

  data: TagGroup[] = groups as unknown as TagGroup[];
  baseLabels: string[] = baseline as unknown as string[];

  label = '';
  checkedLabels = new Set<string>();

  @ViewChildren(ImageCheckboxComponent)
  checkboxes!: QueryList<ImageCheckboxComponent>;

  ngAfterViewInit(): void {
    for (const basetag of this.baseLabels) {
      this.checkedLabels.add(basetag);
    }
    this.updateLabelText();
    // Try to restore immediately if images were already present somehow (optional)
    this.restoreProgressIfValid(); // NEW (safe no-op when images is empty)
  }

  /** Persist index on unload just in case */
  @HostListener('window:beforeunload') // NEW
  private onBeforeUnload(): void {
    this.saveProgress();
  }

  /** Navigate away (kept as-is but safer) */
  hide(): void {
    window.location.assign('http://localhost:4200/');
  }

  /** Handle folder selection and load images as data URLs */
  onFolderSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []) as File[];
    const imageLoadPromises: Promise<ImageEntry>[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        imageLoadPromises.push(
          new Promise<ImageEntry>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, url: String(reader.result) });
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
          })
        );
      }
    }

    Promise.all(imageLoadPromises)
      .then((loaded) => {
        loaded.sort((a, b) => a.name.localeCompare(b.name));
        this.images = loaded;

        // Restore saved index ONLY if valid for this new image set; else default to 0.  // NEW
        if (!this.restoreProgressIfValid()) {
          this.currentImageIndex = 0;
        }
      })
      .catch((error) => {
        console.error('Error loading images:', error);
      });
  }

  /** Clamp/cycle and optionally download labels for previous image when moving forward */
  imageStep(amount: number): void {
    if (!this.images.length) return;

    const prevIndex = this.currentImageIndex;
    const nextIndex = this.normalizeIndex(prevIndex + amount);

    if (amount > 0) {
      this.downloadTextFile(prevIndex);
    }

    this.currentImageIndex = nextIndex;
    this.saveProgress(); // NEW

    this.uncheckAllCheckboxes();
    for (const basetag of this.baseLabels) {
      this.checkedLabels.add(basetag);
    }
    this.updateLabelText();
  }

  /** When user types a new index manually */
  onIndexInputChange(value: number | string): void {
    const n = Number(value);
    if (!Number.isFinite(n) || !this.images.length) {
      this.currentImageIndex = 0;
      this.saveProgress(); // NEW
      return;
    }
    this.currentImageIndex = this.normalizeIndex(n);
    this.saveProgress(); // NEW
  }

  findImage(exampleImage: string): string {
    const found = this.images.find((img) => img.name === exampleImage);
    return found ? found.url : '';
  }

  onCheckboxChange(checkboxStatus: { checked: boolean; label?: string; groupLabel?: string }): void {
    const { checked, label, groupLabel } = checkboxStatus;

    if (checked) {
      if (label) this.checkedLabels.add(label);
      if (groupLabel) this.checkedLabels.add(groupLabel);
    } else if (label) {
      this.checkedLabels.delete(label);
    }

    this.updateLabelText();
  }

  uncheckAllCheckboxes(): void {
    this.checkboxes?.forEach((checkbox) => checkbox.setChecked(false));
    this.checkedLabels.clear();
    this.label = '';
  }

  private downloadTextFile(imageIndex: number): void {
    if (!this.images.length) return;
    if (imageIndex < 0 || imageIndex >= this.images.length) return;

    const baseName = this.images[imageIndex].name.replace(/\.[^/.]+$/, '');
    const textContent = this.label ?? '';
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  private updateLabelText(): void {
    this.label = Array.from(this.checkedLabels).join(', ');
  }

  private normalizeIndex(idx: number): number {
    if (!this.images.length) return 0;
    const len = this.images.length;
    return ((idx % len) + len) % len;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.imageStep(-1);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.imageStep(1);
        event.preventDefault();
        break;
      case 'ű':
        this.hide();
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  trackByGroup = (_: number, group: TagGroup) => group?.defaultTag ?? _;
  trackByTag = (_: number, tag: Tag) => tag?.name ?? _;

  // ---------- Persistence helpers (NEW) ----------

  /** Save current index to localStorage */
  private saveProgress(): void {
    try {
      localStorage.setItem(
        FileSelectorComponent.STORAGE_KEY,
        JSON.stringify({ index: this.currentImageIndex })
      );
    } catch {
      // ignore storage errors
    }
  }

  /** Load saved index (number or null if not found/invalid) */
  private loadSavedIndex(): number | null {
    try {
      const raw = localStorage.getItem(FileSelectorComponent.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { index?: unknown };
      const idx = Number(parsed?.index);
      return Number.isFinite(idx) ? idx : null;
    } catch {
      return null;
    }
  }

  /**
   * Applies saved index if it’s valid for current images.
   * Returns true if applied; false otherwise.
   * Rules:
   *  - if no images -> false
   *  - if saved index is null/NaN -> false
   *  - if saved index >= images.length -> false (fallback handled by caller)
   */
  private restoreProgressIfValid(): boolean {
    if (!this.images.length) return false;
    const saved = this.loadSavedIndex();
    if (saved == null) return false;
    if (saved >= this.images.length || saved < 0) return false; // “unless saved index is bigger…”
    this.currentImageIndex = saved;
    return true;
    // (We could also reset checkboxes/baseline here if needed)
  }
}
