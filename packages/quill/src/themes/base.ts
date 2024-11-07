import { merge } from 'lodash-es';
import type Quill from '../core/quill.js';
import Emitter from '../core/emitter.js';
import Theme from '../core/theme.js';
import type { ThemeOptions } from '../core/theme.js';
import ColorPicker from '../ui/color-picker.js';
import IconPicker from '../ui/icon-picker.js';
import Picker from '../ui/picker.js';
import Tooltip from '../ui/tooltip.js';
import type { Range } from '../core/selection.js';
import type Clipboard from '../modules/clipboard.js';
import type History from '../modules/history.js';
import type Keyboard from '../modules/keyboard.js';
import type Uploader from '../modules/uploader.js';
import type Selection from '../core/selection.js';
import Delta from 'quill-delta';

const ALIGNS = [false, 'center', 'right', 'justify'];

const COLORS = [
  '#000000',
  '#e60000',
  '#ff9900',
  '#ffff00',
  '#008a00',
  '#0066cc',
  '#9933ff',
  '#ffffff',
  '#facccc',
  '#ffebcc',
  '#ffffcc',
  '#cce8cc',
  '#cce0f5',
  '#ebd6ff',
  '#bbbbbb',
  '#f06666',
  '#ffc266',
  '#ffff66',
  '#66b966',
  '#66a3e0',
  '#c285ff',
  '#888888',
  '#a10000',
  '#b26b00',
  '#b2b200',
  '#006100',
  '#0047b2',
  '#6b24b2',
  '#444444',
  '#5c0000',
  '#663d00',
  '#666600',
  '#003700',
  '#002966',
  '#3d1466',
];

const FONTS = [false, 'serif', 'monospace'];

const HEADERS = ['1', '2', '3', false];

const SIZES = ['small', false, 'large', 'huge'];

class BaseTheme extends Theme {
  pickers: Picker[];
  tooltip?: Tooltip;

  constructor(quill: Quill, options: ThemeOptions) {
    super(quill, options);
    const listener = (e: MouseEvent) => {
      if (!document.body.contains(quill.root)) {
        document.body.removeEventListener('click', listener);
        return;
      }
      if (
        this.tooltip != null &&
        // @ts-expect-error
        !this.tooltip.root.contains(e.target) &&
        // @ts-expect-error
        document.activeElement !== this.tooltip.textbox &&
        !this.quill.hasFocus()
      ) {
        this.tooltip.hide();
      }
      if (this.pickers != null) {
        this.pickers.forEach((picker) => {
          // @ts-expect-error
          if (!picker.container.contains(e.target)) {
            picker.close();
          }
        });
      }
    };
    quill.emitter.listenDOM('click', document.body, listener);
  }

  addModule(name: 'clipboard'): Clipboard;
  addModule(name: 'keyboard'): Keyboard;
  addModule(name: 'uploader'): Uploader;
  addModule(name: 'history'): History;
  addModule(name: 'selection'): Selection;
  addModule(name: string): unknown;
  addModule(name: string) {
    const module = super.addModule(name);
    if (name === 'toolbar') {
      // @ts-expect-error
      this.extendToolbar(module);
    }
    return module;
  }

  buildButtons(
    buttons: NodeListOf<HTMLElement>,
    icons: Record<string, Record<string, string> | string>,
  ) {
    Array.from(buttons).forEach((button) => {
      const className = button.getAttribute('class') || '';
      className.split(/\s+/).forEach((name) => {
        if (!name.startsWith('ql-')) return;
        name = name.slice('ql-'.length);
        if (icons[name] == null) return;
        if (name === 'direction') {
          // @ts-expect-error
          button.innerHTML = icons[name][''] + icons[name].rtl;
        } else if (typeof icons[name] === 'string') {
          // @ts-expect-error
          button.innerHTML = icons[name];
        } else {
          // @ts-expect-error
          const value = button.value || '';
          // @ts-expect-error
          if (value != null && icons[name][value]) {
            // @ts-expect-error
            button.innerHTML = icons[name][value];
          }
        }
      });
    });
  }

  buildPickers(
    selects: NodeListOf<HTMLSelectElement>,
    icons: Record<string, string | Record<string, string>>,
  ) {
    this.pickers = Array.from(selects).map((select) => {
      if (select.classList.contains('ql-align')) {
        if (select.querySelector('option') == null) {
          fillSelect(select, ALIGNS);
        }
        if (typeof icons.align === 'object') {
          return new IconPicker(select, icons.align);
        }
      }
      if (
        select.classList.contains('ql-background') ||
        select.classList.contains('ql-color')
      ) {
        const format = select.classList.contains('ql-background')
          ? 'background'
          : 'color';
        if (select.querySelector('option') == null) {
          fillSelect(
            select,
            COLORS,
            format === 'background' ? '#ffffff' : '#000000',
          );
        }
        return new ColorPicker(select, icons[format] as string);
      }
      if (select.querySelector('option') == null) {
        if (select.classList.contains('ql-font')) {
          fillSelect(select, FONTS);
        } else if (select.classList.contains('ql-header')) {
          fillSelect(select, HEADERS);
        } else if (select.classList.contains('ql-size')) {
          fillSelect(select, SIZES);
        }
      }
      return new Picker(select);
    });
    const update = () => {
      this.pickers.forEach((picker) => {
        picker.update();
      });
    };
    this.quill.on(Emitter.events.EDITOR_CHANGE, update);
  }
}
BaseTheme.DEFAULTS = merge({}, Theme.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        formula() {
          this.quill.theme.tooltip.edit('formula');
        },
        image() {
          let fileInput = this.container.querySelector(
            'input.ql-image[type=file]',
          );
          if (fileInput == null) {
            fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute(
              'accept',
              this.quill.uploader.options.mimetypes.join(', '),
            );
            fileInput.classList.add('ql-image');
            fileInput.addEventListener('change', () => {
              const range = this.quill.getSelection(true);
              this.quill.uploader.upload(range, fileInput.files);
              fileInput.value = '';
            });
            this.container.appendChild(fileInput);
          }
          fileInput.click();
        },
        video() {
          this.quill.theme.tooltip.edit('video');
        },
      },
    },
  },
});

class BaseTooltip extends Tooltip {
  textbox: HTMLInputElement | null;
  labelbox: HTMLInputElement | null;
  linkRange?: Range;

  constructor(quill: Quill, boundsContainer?: HTMLElement) {
    super(quill, boundsContainer);
    this.labelbox = this.root.querySelector(
      'input[type="text"][data-type="text"]',
    );
    this.textbox = this.root.querySelector(
      'input[type="text"][data-type="link"]',
    );
    this.listen();
  }

  listen() {
    // @ts-expect-error Fix me later
    this.labelbox.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.textbox?.focus();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        this.cancel();
        event.preventDefault();
      }
    });
    // @ts-expect-error Fix me later
    this.textbox.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.save();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        this.cancel();
        event.preventDefault();
      }
    });
  }

  cancel() {
    this.hide();
    this.restoreFocus();
  }

  edit(mode = 'link', preview: string | null = null, from = 'other') {
    this.root.classList.remove('ql-hidden');
    this.root.classList.add('ql-editing');
    if (this.textbox == null || this.labelbox == null) return;

    const isCreate = from === 'create';
    if (preview != null) {
      this.labelbox.value = isCreate
        ? preview
        : this.quill.getText(this.linkRange);
    }

    if (preview != null) {
      this.textbox.value = isCreate ? '' : preview;
    } else if (mode !== this.root.getAttribute('data-mode')) {
      this.textbox.value = '';
    }
    const bounds = this.quill.getBounds(this.quill.selection.savedRange);
    if (bounds != null) {
      this.position(bounds);
    }

    this.labelbox.setAttribute(
      'placeholder',
      this.labelbox.getAttribute(`data-${mode}`) || '',
    );
    this.textbox.select();
    this.textbox.setAttribute(
      'placeholder',
      this.textbox.getAttribute(`data-${mode}`) || '',
    );
    this.root.setAttribute('data-mode', mode);

    setTimeout(() => {
      if (!this.quill.selection.savedRange.length) {
        this.labelbox?.focus();
      } else {
        this.textbox?.focus();
      }
    });
  }

  restoreFocus() {
    this.quill.focus({ preventScroll: true });
  }

  save() {
    // @ts-expect-error Fix me later
    let { value } = this.textbox;

    switch (this.root.getAttribute('data-mode')) {
      case 'link': {
        if (this.labelbox == null) return 
        const { scrollTop } = this.quill.root;
        const { value: text } = this.labelbox;
        if (!value || !text) {
          this.cancel();
          this.restoreFocus();
          return;
        }
        if (!value.startsWith('https://') && !value.startsWith('http://')) {
          value = 'https://' + value;
        }

        if (!this.linkRange) {
          this.linkRange = {
            index: this.quill.selection.savedRange.index,
            length: this.quill.selection.savedRange.length,
          }
        }
        const delta = new Delta()
          .retain(this.linkRange.index)
          .delete(this.linkRange.length)
          .insert(text);
        this.quill.updateContents(delta, Emitter.sources.USER);
        this.linkRange.length = text.length;

        this.quill.formatText(
          this.linkRange,
          'link',
          value,
          Emitter.sources.USER,
        );
        this.quill.setSelection(
          this.linkRange.index + text.length,
          Emitter.sources.USER,
        );
        delete this.linkRange;

        this.quill.root.scrollTop = scrollTop;
        break;
      }
      case 'video': {
        value = extractVideoUrl(value);
      } // eslint-disable-next-line no-fallthrough
      case 'formula': {
        if (!value) break;
        const range = this.quill.getSelection(true);
        if (range != null) {
          const index = range.index + range.length;
          this.quill.insertEmbed(
            index,
            // @ts-expect-error Fix me later
            this.root.getAttribute('data-mode'),
            value,
            Emitter.sources.USER,
          );
          if (this.root.getAttribute('data-mode') === 'formula') {
            this.quill.insertText(index + 1, ' ', Emitter.sources.USER);
          }
          this.quill.setSelection(index + 2, Emitter.sources.USER);
        }
        break;
      }
      default:
    }
    // @ts-expect-error Fix me later
    this.textbox.value = '';
    this.hide();
    this.restoreFocus();
  }
}

function extractVideoUrl(url: string) {
  let match =
    url.match(
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/,
    ) ||
    url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `${match[1] || 'https'}://www.youtube.com/embed/${
      match[2]
    }?showinfo=0`;
  }
  // eslint-disable-next-line no-cond-assign
  if ((match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/))) {
    return `${match[1] || 'https'}://player.vimeo.com/video/${match[2]}/`;
  }
  return url;
}

function fillSelect(
  select: HTMLSelectElement,
  values: Array<string | boolean>,
  defaultValue: unknown = false,
) {
  values.forEach((value) => {
    const option = document.createElement('option');
    if (value === defaultValue) {
      option.setAttribute('selected', 'selected');
    } else {
      option.setAttribute('value', String(value));
    }
    select.appendChild(option);
  });
}

export { BaseTooltip, BaseTheme as default };
