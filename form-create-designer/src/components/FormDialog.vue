<template>
  <el-dialog
    v-model="internalDialogVisible"
    :title="title"
    :width="width"
    :before-close="closeDialog"
  >
    <div class="flex gap-4 mb-4">
      <span style="margin-right: 10px">表单名称</span>
      <el-input v-model="formname" style="width: 240px" placeholder="请输入" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirmDialog">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits, defineExpose } from "vue";

// 定义组件的属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const title = ref("对话框");
const formname = ref(""); // 定义表单名称

// 定义组件的事件
const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

// 内部使用的 dialogVisible 状态
const internalDialogVisible = ref(props.modelValue);

// 监听外部传入的 modelValue 属性变化
watch(
  () => props.modelValue,
  (newVal) => {
    internalDialogVisible.value = newVal;
  }
);

// 当内部状态变化时，触发事件通知父组件
watch(internalDialogVisible, (newVal) => {
  emit("update:modelValue", newVal);
});

// 打开对话框的方法
const openDialog = () => {
  internalDialogVisible.value = true;
};

// 关闭对话框的方法
const closeDialog = () => {
  internalDialogVisible.value = false;
  formname.value = ""; // 清除输入框中的数据
  emit("cancel");
};

// 确认对话框的方法
const confirmDialog = () => {
  internalDialogVisible.value = false;
  emit("confirm", formname.value); // 将 formname 传递给父组件
  formname.value = ""; // 清除输入框中的数据
};

// 暴露打开对话框的方法
defineExpose({ openDialog });
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
