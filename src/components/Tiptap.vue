<template>
  <div>
    <div v-if="editor" class="toolbar">
      <v-btn
        style="margin: 2px; padding-left: 10px; padding-right: 10px"
        size="small"
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        text="Bold"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        text="Italic"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleStrike().run()"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        text="Strike"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleCode().run()"
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
        text="Code"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().unsetAllMarks().run()"
        text="Clear marks"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().clearNodes().run()"
        text="Clear nodes"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().setParagraph().run()"
        :class="{ 'is-active': editor.isActive('paragraph') }"
        text="Paragraph"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        text="H1"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        text="H2"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        text="H3"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
        text="H4"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
        text="H5"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
        text="H6"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        text="Bullet list"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        text="Ordered list"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        text="Code block"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        text="Blockquote"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().setHorizontalRule().run()"
        text="Horizontal rule"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().setHardBreak().run()"
        text="Hard break"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().chain().focus().undo().run()"
        text="Undo"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().chain().focus().redo().run()"
        text="Redo"
      />

      <v-btn
        style="margin: 2px"
        size="small"
        @click="editor.chain().focus().setColor('#958DF1').run()"
        :class="{
          'is-active': editor.isActive('textStyle', { color: '#958DF1' }),
        }"
        text="Purple"
      />
    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { onUnmounted, watch } from "vue";

console.log(TextStyle);

const model = defineModel();

const editor = useEditor({
  content: model.value,
  extensions: [StarterKit, TextStyle],
  onUpdate: () => {
    console.log(editor.value.chain().focus());
    model.value = editor.value.getHTML();
  },
});

watch(
  () => model.value,
  (value) => {
    if (editor.value.getHTML() === value) return;

    editor.value.commands.setContent(value, false);
  }
);

onUnmounted(() => editor.value.destroy());
</script>
