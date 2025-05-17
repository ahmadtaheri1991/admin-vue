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
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addColumnBefore().run()"
        :disabled="!editor.can().addColumnBefore()"
        text="Add Column Before"
      />

      <v-btn
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addColumnAfter().run()"
        :disabled="!editor.can().addColumnAfter()"
        text="Add Column After"
      />

      <v-btn
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().deleteColumn().run()"
        :disabled="!editor.can().deleteColumn()"
        text="Delete Column"
      />

      <v-btn
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addRowBefore().run()"
        :disabled="!editor.can().addRowBefore()"
        text="Add Row Before"
      />

      <v-btn
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().addRowAfter().run()"
        :disabled="!editor.can().addRowAfter()"
        text="Add Row After"
      />

      <v-btn
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().deleteRow().run()"
        :disabled="!editor.can().deleteRow()"
        text="Delete Row"
      />

      <v-btn
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
        class="tiptap-btn"
        size="small"
        @click="editor.chain().focus().deleteTable().run()"
        :disabled="!editor.can().deleteTable()"
        text="Delete Table"
      />

      <v-btn
        :color="
          editor.isActive('table')
            ? 'rgb(106, 0, 245)'
            : 'rgba(61, 37, 20, 0.08)'
        "
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

    <!-- <img
      v-if="files[0]"
      :src="files[0]"
      contenteditable="false"
      draggable="true"
      class="ProseMirror-selectednode mx-auto d-inline-block"
    />

    <div
      v-else
      class="react-renderer node-imageUpload ProseMirror-selectednode"
      contenteditable="false"
      draggable="true"
      @click="fileInput.click()"
    >
      <div
        class="tiptap-image-upload"
        tabindex="0"
        data-node-view-wrapper=""
        style="white-space: normal"
      >
        <div class="tiptap-image-upload-dragger">
          <div class="tiptap-image-upload-dropzone">
            <svg
              width="43"
              height="57"
              viewBox="0 0 43 57"
              fill="currentColor"
              class="tiptap-image-upload-dropzone-rect-primary"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.75 10.75C0.75 5.64137 4.89137 1.5 10 1.5H32.3431C33.2051 1.5 34.0317 1.84241 34.6412 2.4519L40.2981 8.10876C40.9076 8.71825 41.25 9.5449 41.25 10.4069V46.75C41.25 51.8586 37.1086 56 32 56H10C4.89137 56 0.75 51.8586 0.75 46.75V10.75Z"
                fill="currentColor"
                fill-opacity="0.11"
                stroke="currentColor"
                stroke-width="1.5"
              ></path>
            </svg>
            <svg
              width="10"
              height="10"
              class="tiptap-image-upload-dropzone-rect-secondary"
              viewBox="0 0 10 10"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 0.75H0.343146C1.40401 0.75 2.42143 1.17143 3.17157 1.92157L8.82843 7.57843C9.57857 8.32857 10 9.34599 10 10.4069V10.75H4C1.79086 10.75 0 8.95914 0 6.75V0.75Z"
                fill="currentColor"
              ></path>
            </svg>
            <div class="tiptap-image-upload-icon-container">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                class="tiptap-image-upload-icon"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.1953 4.41771C10.3478 4.08499 9.43578 3.94949 8.5282 4.02147C7.62062 4.09345 6.74133 4.37102 5.95691 4.83316C5.1725 5.2953 4.50354 5.92989 4.00071 6.68886C3.49788 7.44783 3.17436 8.31128 3.05465 9.2138C2.93495 10.1163 3.0222 11.0343 3.3098 11.8981C3.5974 12.7619 4.07781 13.5489 4.71463 14.1995C5.10094 14.5942 5.09414 15.2274 4.69945 15.6137C4.30476 16 3.67163 15.9932 3.28532 15.5985C2.43622 14.731 1.79568 13.6816 1.41221 12.5299C1.02875 11.3781 0.91241 10.1542 1.07201 8.95084C1.23162 7.74748 1.66298 6.59621 2.33343 5.58425C3.00387 4.57229 3.89581 3.72617 4.9417 3.10998C5.98758 2.4938 7.15998 2.1237 8.37008 2.02773C9.58018 1.93176 10.7963 2.11243 11.9262 2.55605C13.0561 2.99968 14.0703 3.69462 14.8919 4.58825C15.5423 5.29573 16.0585 6.11304 16.4177 7.00002H17.4999C18.6799 6.99991 19.8288 7.37933 20.7766 8.08222C21.7245 8.78515 22.4212 9.7743 22.7637 10.9036C23.1062 12.0328 23.0765 13.2423 22.6788 14.3534C22.2812 15.4644 21.5367 16.4181 20.5554 17.0736C20.0962 17.3803 19.4752 17.2567 19.1684 16.7975C18.8617 16.3382 18.9853 15.7172 19.4445 15.4105C20.069 14.9934 20.5427 14.3865 20.7958 13.6794C21.0488 12.9724 21.0678 12.2027 20.8498 11.4841C20.6318 10.7655 20.1885 10.136 19.5853 9.6887C18.9821 9.24138 18.251 8.99993 17.5001 9.00002H15.71C15.2679 9.00002 14.8783 8.70973 14.7518 8.28611C14.4913 7.41374 14.0357 6.61208 13.4195 5.94186C12.8034 5.27164 12.0427 4.75043 11.1953 4.41771Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M11 14.4142V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V14.4142L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.7078 11.2936C12.7054 11.2912 12.703 11.2888 12.7005 11.2864C12.5208 11.1099 12.2746 11.0008 12.003 11L12 11L11.997 11C11.8625 11.0004 11.7343 11.0273 11.6172 11.0759C11.502 11.1236 11.3938 11.1937 11.2995 11.2864C11.297 11.2888 11.2946 11.2912 11.2922 11.2936L7.29289 15.2929C6.90237 15.6834 6.90237 16.3166 7.29289 16.7071C7.68342 17.0976 8.31658 17.0976 8.70711 16.7071L11 14.4142Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <input
          ref="fileInput"
          accept="image/*"
          type="file"
          name="file"
          @change="onFileChange"
        />
      </div>
    </div> -->
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

  img {
    display: block;
    margin: 0 auto;
    max-height: 200px;
    border-radius: 5px;
  }
}

.ProseMirror table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.ProseMirror td,
.ProseMirror th {
  border: 2px solid #ced4da;
  box-sizing: border-box;
  min-width: 1em;
  padding: 3px 5px;
  position: relative;
  vertical-align: top;
}

.ProseMirror th {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: left;
}

.ProseMirror .selectedCell:after {
  background: rgba(200, 200, 255, 0.4);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}
</style>
