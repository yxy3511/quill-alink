import merge from 'lodash.merge';
import Emitter from '../core/emitter';
import BaseTheme, { BaseTooltip } from './base';
import LinkBlot from '../formats/link';
import { Range } from '../core/selection';
import icons from '../ui/icons';

const TOOLBAR_CONFIG = [
  [{ header: ['1', '2', '3', false] }],
  ['bold', 'italic', 'underline', 'link'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

class SnowTooltip extends BaseTooltip {
  static TEMPLATE = [
    '<div class="ql-toolbar-row"><a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>',
    '<div class="ql-btns"><a class="ql-action"><i class="icon iconfont icon-edit"></i></a>',
    '<a class="ql-remove"><i class="icon iconfont icon-delete"></i></a>',
    '<a class="ql-viewlink"><i class="icon iconfont icon-outlined"></i></a></div></div>',
    '<div class="input-row row-text">文本：<input type="text" data-type="text" data-link="请输入文本" data-video="Embed URL"></div>',
    '<div class="input-row row-link">链接：<input type="text" data-type="link" data-link="粘贴或输入一个超链接" data-video="Embed URL"></div>',
    '<button class="ql-submit">确定</button>',
  ].join('');

  preview = this.root.querySelector('a.ql-preview');

  listen() {
    super.listen();
    this.root.querySelector('.ql-submit').addEventListener('click', event => {
      this.save();
      event.preventDefault();
    });
    this.root.querySelector('a.ql-action').addEventListener('click', event => {
      this.edit('link', this.preview.textContent);
      event.preventDefault();
    });

    this.root
      .querySelector('a.ql-viewlink')
      .addEventListener('click', event => {
        if (this.preview.textContent) {
          window.open(this.preview.textContent, '_blank');
        }
        event.preventDefault();
      });
    this.root.querySelector('a.ql-remove').addEventListener('click', event => {
      if (this.linkRange != null) {
        const range = this.linkRange;
        this.restoreFocus();
        this.quill.formatText(range, 'link', false, Emitter.sources.USER);
        delete this.linkRange;
      }
      event.preventDefault();
      this.hide();
    });
    this.quill.on(
      Emitter.events.SELECTION_CHANGE,
      (range, oldRange, source) => {
        if (range == null) return;
        if (range.length === 0 && source === Emitter.sources.USER) {
          const [link, offset] = this.quill.scroll.descendant(
            // @ts-expect-error
            LinkBlot,
            range.index,
          );
          if (link != null) {
            this.linkRange = new Range(range.index - offset, link.length());
            const preview = LinkBlot.formats(link.domNode);
            this.preview.textContent = preview;
            this.preview.setAttribute('href', preview);
            this.show();
            this.position(this.quill.getBounds(this.linkRange));
            return;
          }
        } else {
          delete this.linkRange;
        }
        this.hide();
      },
    );
  }

  show() {
    super.show();
    this.root.removeAttribute('data-mode');
  }
}

class SnowTheme extends BaseTheme {
  constructor(quill, options) {
    if (
      options.modules.toolbar != null &&
      options.modules.toolbar.container == null
    ) {
      options.modules.toolbar.container = TOOLBAR_CONFIG;
    }
    super(quill, options);
    this.quill.container.classList.add('ql-snow');
  }

  extendToolbar(toolbar) {
    toolbar.container.classList.add('ql-snow');
    this.buildButtons(toolbar.container.querySelectorAll('button'), icons);
    this.buildPickers(toolbar.container.querySelectorAll('select'), icons);
    // @ts-expect-error
    this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
    if (toolbar.container.querySelector('.ql-link')) {
      this.quill.keyboard.addBinding(
        { key: 'k', shortKey: true },
        (range, context) => {
          toolbar.handlers.link.call(toolbar, !context.format.link);
        },
      );
    }
  }
}
SnowTheme.DEFAULTS = merge({}, BaseTheme.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        link(value) {
          if (value) {
            const range = this.quill.getSelection();
            // if (range == null || range.length === 0) return;
            const preview = this.quill.getText(range);
            // if (
            //   /^\S+@\S+\.\S+$/.test(preview) &&
            //   preview.indexOf('mailto:') !== 0
            // ) {
            //   preview = `mailto:${preview}`;
            // }
            const { tooltip } = this.quill.theme;
            tooltip.edit('link', preview, 'create');
          } else {
            this.quill.format('link', false);
          }
        },
      },
    },
  },
});

export default SnowTheme;
