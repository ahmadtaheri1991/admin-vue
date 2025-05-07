<template>
  <div>
    <div class="toolbar">
      <v-btn @click="editor.chain().focus().toggleBold().run()">Bold</v-btn>
      <v-btn @click="editor.chain().focus().toggleItalic().run()">
        Italic
      </v-btn>
      <v-btn @click="editor.chain().focus().toggleMark().run()">
        Underline
      </v-btn>
      <!-- دکمه‌های دیگر می‌توانند اینجا اضافه شوند -->
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
