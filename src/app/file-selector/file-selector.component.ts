import {
  Component,
  QueryList,
  ViewChildren,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { ImageCheckboxComponent } from '../image-checkbox/image-checkbox.component';

/**
 * Adjust these interfaces to match your tags.json structure precisely.
 */
interface Tag {
  name: string;
  example: string;
}

interface TagGroup {
  defaultTag: string;
  tags: Tag[];
}

/**
 * If your bundler allows JSON imports with types, you can:
 *   import tags from '../res/json/tags.json';
 * and destructure:
 *   const { groups, baseline } = tags as { groups: TagGroup[]; baseline: string[] };
 * For your original pattern, keep separate named imports:
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { groups } from '../res/json/tags.json';
import { baseline } from '../res/json/tags.json';

type ImageEntry = { name: string; url: string };

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})
export class FileSelectorComponent implements AfterViewInit {
  images: ImageEntry[] = [];
  currentImageIndex = 0;

  // Strongly type your config
  data: TagGroup[] = groups as unknown as TagGroup[];
  baseLabels: string[] = baseline as unknown as string[];

  label = '';
  checkedLabels = new Set<string>();

  @ViewChildren(ImageCheckboxComponent)
  checkboxes!: QueryList<ImageCheckboxComponent>;

  ngAfterViewInit(): void {
    // Initialize with baseline labels
    for (const basetag of this.baseLabels) {
      this.checkedLabels.add(basetag);
    }
    this.updateLabelText();
  }

  /** Navigate away (kept as-is but safer) */
  hide(): void {
    // If you have Angular routing, prefer Router.navigateByUrl('/').
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
        this.currentImageIndex = 0;
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

    // If moving forward, download labels for the image we just finished viewing (prevIndex)
    if (amount > 0) {
      this.downloadTextFile(prevIndex);
    }

    this.currentImageIndex = nextIndex;

    // Reset checkboxes and re-apply baseline
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
      return;
    }
    this.currentImageIndex = this.normalizeIndex(n);
  }

  /** Find the data URL for an example image by its filename */
  findImage(exampleImage: string): string {
    const found = this.images.find((img) => img.name === exampleImage);
    return found ? found.url : '';
    // Optionally: fall back to current image preview if example not present
    // return found ? found.url : (this.images[this.currentImageIndex]?.url ?? '');
  }

  /** React to a checkbox change coming from a child */
  onCheckboxChange(checkboxStatus: { checked: boolean; label?: string; groupLabel?: string }): void {
    const { checked, label, groupLabel } = checkboxStatus;

    if (checked) {
      if (label) this.checkedLabels.add(label);
      if (groupLabel) this.checkedLabels.add(groupLabel);
    } else if (label) {
      this.checkedLabels.delete(label);
      // Do not remove groupLabel on uncheck to keep group defaults persistent unless desired
    }

    this.updateLabelText();
  }

  /** Clear all checkboxes via child API (no direct DOM mutation) */
  uncheckAllCheckboxes(): void {
    this.checkboxes?.forEach((checkbox) => checkbox.setChecked(false));
    this.checkedLabels.clear();
    this.label = '';
  }

  /** Create and trigger a .txt download of current labels for a given image index */
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

  /** Keep labels textarea in sync */
  private updateLabelText(): void {
    this.label = Array.from(this.checkedLabels).join(', ');
  }

  /** Wrap index within [0, images.length-1] */
  private normalizeIndex(idx: number): number {
    if (!this.images.length) return 0;
    const len = this.images.length;
    // Proper modulo for negatives
    return ((idx % len) + len) % len;
  }

  /** Keyboard shortcuts on the page */
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

  /** trackBy helpers to avoid re-render churn */
  trackByGroup = (_: number, group: TagGroup) => group?.defaultTag ?? _;
  trackByTag = (_: number, tag: Tag) => tag?.name ?? _;
}
