<template>
  <div>
    <div v-if="editor" class="toolbar">
      <v-btn
        :color="
          editor.isActive('bold')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        text="Bold"
      />

      <v-btn
        :color="
          editor.isActive('italic')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        text="Italic"
      />

      <v-btn
        :color="
          editor.isActive('strike')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        text="Strike"
      />

      <v-btn
        :color="
          editor.isActive('underline')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        text="Underline"
      />

      <v-btn
        :color="
          editor.isActive('highlight')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ 'is-active': editor.isActive('highlight') }"
        text="Highlight"
      />

      <v-btn
        :color="
          editor.isActive({ textAlign: 'left' })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        text="Left"
      />

      <v-btn
        :color="
          editor.isActive({ textAlign: 'center' })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        text="Center"
      />

      <v-btn
        :color="
          editor.isActive({ textAlign: 'right' })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        text="Right"
      />

      <v-btn
        :color="
          editor.isActive({ textAlign: 'justify' })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().setTextAlign('justify').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
        text="Justify"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().unsetAllMarks().run()"
        text="Clear marks"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().clearNodes().run()"
        text="Clear nodes"
      />

      <v-btn
        :color="
          editor.isActive('paragraph')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().setParagraph().run()"
        :class="{ 'is-active': editor.isActive('paragraph') }"
        text="Paragraph"
      />

      <v-btn
        :color="
          editor.isActive('heading', { level: 1 })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        text="H1"
      />

      <v-btn
        :color="
          editor.isActive('heading', { level: 2 })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        text="H2"
      />

      <v-btn
        :color="
          editor.isActive('heading', { level: 3 })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        text="H3"
      />

      <v-btn
        :color="
          editor.isActive('heading', { level: 4 })
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
        text="H4"
      />

      <v-btn
        :color="
          editor.isActive('bulletList')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        text="Bullet list"
      />

      <v-btn
        :color="
          editor.isActive('orderedList')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        text="Ordered list"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().setHorizontalRule().run()"
        text="Horizontal rule"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().setHardBreak().run()"
        text="Hard break"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn custom-disabled-btn"
        size="small"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().chain().focus().undo().run()"
        text="Undo"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().chain().focus().redo().run()"
        text="Redo"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        "
        text="Insert Table"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addColumnBefore().run()"
        :disabled="!editor.can().addColumnBefore()"
        text="Add Column Before"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addColumnAfter().run()"
        :disabled="!editor.can().addColumnAfter()"
        text="Add Column After"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().deleteColumn().run()"
        :disabled="!editor.can().deleteColumn()"
        text="Delete Column"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addRowBefore().run()"
        :disabled="!editor.can().addRowBefore()"
        text="Add Row Before"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addRowAfter().run()"
        :disabled="!editor.can().addRowAfter()"
        text="Add Row After"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().deleteRow().run()"
        :disabled="!editor.can().deleteRow()"
        text="Delete Row"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().deleteTable().run()"
        :disabled="!editor.can().deleteTable()"
        text="Delete Table"
      />

      <v-btn
        color="rgba(61, 37, 20, 0.08)"
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().toggleHeaderCell().run()"
        :disabled="!editor.can().toggleHeaderCell()"
        text="Toggle Header Cell"
      />

      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        style="display: none"
        @change="onFileChange"
      />
    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { onUnmounted, watch, ref, reactive } from "vue";

const model = defineModel();

const editor = useEditor({
  content: model.value,
  extensions: [
    StarterKit,
    TextStyle,
    Underline,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Highlight,
    Image,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  onUpdate: () => {
    model.value = editor.value.getHTML();
  },
});

const fileInput = ref(null);

const addImage = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";

  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.value.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  input.click();
};

const files = reactive([]);
const onFileChange = (event) => {
  const file = event.target.files[0];
  console.log(file);
  files[0] = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      editor.value.chain().focus().setImage({ src: e.target.result }).run();
    };
    reader.readAsDataURL(file);
  }
};

watch(
  () => model.value,
  (value) => {
    if (editor.value.getHTML() === value) return;

    editor.value.commands.setContent(value, false);
  }
);

onUnmounted(() => editor.value.destroy());
</script>

<style lang="scss">
.tiptap-btn {
  margin: 2px;
  padding-left: 10px;
  padding-right: 10px;
  min-width: auto;
  border-radius: 8px !important;
  font-weight: 400;
}

.tiptap-image-upload .tiptap-image-upload-dragger {
  padding: 2rem 1.5rem;
  border: 1.5px dashed rgba(47, 50, 55, 0.2);
  border-radius: 0.5rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.tiptap-image-upload input[type="file"] {
  display: none;
}

.tiptap-image-upload .tiptap-image-upload-dropzone {
  position: relative;
  width: 3.125rem;
  height: 3.75rem;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.tiptap-image-upload .tiptap-image-upload-dropzone-rect-secondary {
  position: absolute;
  top: 0;
  right: 0.25rem;
  bottom: 0;
  color: rgba(213, 214, 215, 1);
}

.tiptap-image-upload .tiptap-image-upload-icon-container {
  position: absolute;
  width: 1.75rem;
  height: 1.75rem;
  bottom: 0;
  right: 0;
  background-color: rgba(98, 41, 255, 1);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tiptap-image-upload .tiptap-image-upload-dropzone-rect-primary {
  color: rgba(37, 39, 45, 0.1);
  position: absolute;
}

.tiptap-image-upload .tiptap-image-upload-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: rgba(255, 255, 255, 1);
}

.ProseMirror {
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0;
  padding: 10px;
  margin-top: 10px;

  img {
    display: block;
    margin: 0 auto;
    max-height: 200px;
    border-radius: 5px;
  }
}

.tiptap {
  table {
    border-collapse: collapse;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td,
    th {
      border: 1px solid rgb(61, 37, 20, 0.12);
      box-sizing: border-box;
      min-width: 1em;
      padding: 6px 8px;
      position: relative;
      vertical-align: top;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: rgb(61, 37, 20, 0.05);
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: rgb(61, 37, 20, 0.08);
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: #6a00f5;
      bottom: -2px;
      pointer-events: none;
      position: absolute;
      right: -2px;
      top: 0;
      width: 4px;
    }
  }

  .tableWrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }
}
</style>
