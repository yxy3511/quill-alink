<h1 align="center">
  <a href="https://quilljs.com/" title="Quill">Quill Rich Text Editor</a>
</h1>
<p align="center">
  <a href="https://quilljs.com/" title="Quill"><img alt="Quill Logo" src="https://quilljs.com/assets/images/logo.svg" width="180"></a>
</p>
<p align="center">
  <a title="Documentation" href="https://quilljs.com/docs/quickstart"><strong>Documentation</strong></a>
  &#x2022;
  <a title="Development" href="https://github.com/slab/quill/blob/main/.github/DEVELOPMENT.md"><strong>Development</strong></a>
  &#x2022;
  <a title="Contributing" href="https://github.com/slab/quill/blob/main/.github/CONTRIBUTING.md"><strong>Contributing</strong></a>
  &#x2022;
  <a title="Interactive Playground" href="https://quilljs.com/playground/"><strong>Interactive Playground</strong></a>
</p>
<p align="center">
  <a href="https://github.com/slab/quill/actions" title="Build Status"><img src="https://github.com/slab/quill/actions/workflows/main.yml/badge.svg" alt="Build Status"></a>
  <a href="https://npmjs.com/package/quill" title="Version"><img src="https://img.shields.io/npm/v/quill.svg" alt="Version"></a>
  <a href="https://npmjs.com/package/quill" title="Downloads"><img src="https://img.shields.io/npm/dm/quill.svg" alt="Downloads"></a>
</p>

<hr/>

[Quill](https://quilljs.com/) is a modern rich text editor built for compatibility and extensibility. It was created by [Jason Chen](https://twitter.com/jhchen) and [Byron Milligan](https://twitter.com/byronmilligan) and actively maintained by [Slab](https://slab.com).

To get started, check out [https://quilljs.com/](https://quilljs.com/) for documentation, guides, and live demos!

## Quickstart

Instantiate a new Quill object with a css selector for the div that should become the editor.

```html
<!-- Include Quill stylesheet -->
<link
  href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css"
  rel="stylesheet"
/>

<!-- Create the toolbar container -->
<div id="toolbar">
  <button class="ql-bold">Bold</button>
  <button class="ql-italic">Italic</button>
</div>

<!-- Create the editor container -->
<div id="editor">
  <p>Hello World!</p>
  <p>Some initial <strong>bold</strong> text</p>
  <p><br /></p>
</div>

<!-- Include the Quill library -->
<script src="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js"></script>

<!-- Initialize Quill editor -->
<script>
  const quill = new Quill("#editor", {
    theme: "snow",
  });
</script>
```

Take a look at the [Quill](https://quilljs.com/) website for more documentation, guides and [live playground](https://quilljs.com/playground/)!

## Download

```shell
npm install quill
```

### CDN

```html
<!-- Main Quill library -->
<script src="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js"></script>

<!-- Theme included stylesheets -->
<link
  href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css"
  rel="stylesheet"
/>
<link
  href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.bubble.css"
  rel="stylesheet"
/>

<!-- Core build with no theme, formatting, non-essential modules -->
<link
  href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.core.css"
  rel="stylesheet"
/>
<script src="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.core.js"></script>
```

## Community

Get help or stay up to date.

- [Contribute](https://github.com/slab/quill/blob/main/.github/CONTRIBUTING.md) on [Issues](https://github.com/slab/quill/issues)
- Ask questions on [Discussions](https://github.com/slab/quill/discussions)

## License

BSD 3-clause


```
### Demo
alink分支主要是按需求修改了添加链接和编辑链接时的样式。可以在编辑url的同时修改文本。

![image](https://github.com/user-attachments/assets/edf5a2e5-c450-4861-9e63-ff77bcfffc78)
![image](https://github.com/user-attachments/assets/e28f1a95-005f-41f8-b2eb-d05368d0293d)
![image](https://github.com/user-attachments/assets/b6b211c2-0320-4f94-8b1b-41fbf87629af)



