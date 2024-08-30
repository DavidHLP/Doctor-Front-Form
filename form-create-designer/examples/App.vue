<template>
  <div id="app">
    <fc-designer
      ref="designer"
      :config="config"
      :handle="handle"
      :locale="locale"
    >
      <!-- <template #handle>
        <div class="handle">
          <el-button text @click="getJson">导入</el-button>
          <el-button text @click="throwJsonUseDialog">导出</el-button>
          <FormDialog
            v-model="isDialogVisible"
            @confirm="handleConfirm"
            @cancel="handleCancel"
          />
        </div>
      </template> -->

      <template #handle>
        <div class="handle">
          <el-popover :visible="getvisible" placement="top" :width="300">
            <div class="flex flex-wrap">
              <div class="m-4">
                <span>请在下面选择</span>
                <el-select
                  v-model="getvalue"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="请输入"
                  remote-show-suffix
                  :remote-method="remoteMethod"
                  :loading="getloading"
                  style="width: 240px; margin-top: 20px"
                >
                  <el-option
                    v-for="item in getoptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
            <div
              style="
                text-align: right;
                margin: 0;
                margin-top: 20px;
                margin-right: 20px;
              "
            >
              <el-button size="small" text @click="getvisible = false"
                >取消</el-button
              >
              <el-button size="small" type="primary" @click="useSelectJson()">
                确认
              </el-button>
            </div>
            <template #reference>
              <el-button @click="getvisible = true">导入</el-button>
            </template>
          </el-popover>
        </div>
        <div class="handle">
          <el-popover :visible="visible" placement="top" width="250">
            <span style="margin-top: 20px">请输入表单名称</span>
            <el-input
              v-model="formname"
              style="width: 200px; margin-top: 20px"
              placeholder="请输入"
            />
            <div
              style="
                text-align: right;
                margin: 0;
                margin-top: 20px;
                margin-right: 20px;
              "
            >
              <el-button size="small" text @click="cancelPopover"
                >取消</el-button
              >
              <el-button
                size="small"
                type="primary"
                @click="throwJsonUsePopover"
              >
                提交
              </el-button>
            </div>
            <template #reference>
              <el-button @click="visible = true">导出</el-button>
            </template>
          </el-popover>
        </div>
      </template>
    </fc-designer>

    <el-dialog :title="title[type]" v-model="state" class="_fc-t-dialog">
      <div ref="editor" v-if="state"></div>
      <span style="color: red" v-if="err">输入内容格式有误!</span>
      <template #footer v-if="type > 2">
        <span slot="footer" class="dialog-footer">
          <el-button @click="state = false" size="small">取 消</el-button>
          <el-button type="primary" @click="onOk" size="small">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import jsonlint from "jsonlint-mod";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import CodeMirror from "codemirror/lib/codemirror";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/json-lint";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/vue/vue";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/addon/mode/overlay";
import "codemirror/addon/mode/simple";
import "codemirror/addon/selection/selection-pointer";
import "codemirror/mode/handlebars/handlebars";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/pug/pug";

import is from "@form-create/utils/lib/type";
import formCreate from "@form-create/element-ui";
import ZhCn from "../src/locale/zh-cn";
import En from "../src/locale/en";
import arrowDown from "@element-plus/icons-vue/dist/es/arrow-down.mjs";

import {
  ThrowJsonToBackend as TJTB,
  GetJsonFromBackendIsNotPatintId as GJFBINPI,
  GetJsonFromBackendById as GJFBBI,
} from "../src/api/App.js";

const CACHE_KEY = "fc-config-$101";
const TITLE = [
  "生成规则",
  "表单规则",
  "生成组件",
  "设置生成规则",
  "设置表单规则",
];

export default {
  name: "app",
  components: {
    arrowDown,
  },
  data() {
    return {
      getlist: [],
      getoptions: [],
      getvalue: null,
      getloading: false,
      getvisible: false,
      formname: "",
      visible: false,
      FormData: {},
      state: false,
      value: null,
      title: TITLE,
      editor: null,
      err: false,
      type: -1,
      autoSaveId: null,
      lang: "cn",
      locale: null,
      topImg: true,
      config: {
        fieldReadonly: false,
        showSaveBtn: true,
      },
      handle: [
        {
          label: "中英切换",
          handle: () => {
            this.changeLocale();
          },
        },
      ],
    };
  },
  watch: {
    state(n) {
      if (!n) {
        this.value = null;
        this.err = false;
      }
    },
    value() {
      this.load();
    },
  },
  methods: {
    goPro() {
      location.href = "https://pro.form-create.com/view";
    },
    getCache() {
      function def() {
        return { opt: null, rule: null };
      }

      try {
        let cache = localStorage.getItem(CACHE_KEY);
        if (!cache) {
          return def();
        }
        cache = JSON.parse(cache);
        cache.rule = formCreate.parseJson(cache.rule);
        cache.opt.submitBtn = false;
        return cache;
      } catch (e) {
        return def();
      }
    },
    setCache({ opt, rule }) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          opt,
          rule: formCreate.toJson(rule),
        })
      );
    },
    loadAutoSave() {
      const s = this.autosave;
      if (s === false) return;
      this.autoSaveId = setInterval(
        () => {
          this.setCache({
            opt: this.$refs.designer.getOption(),
            rule: this.$refs.designer.getRule(),
          });
        },
        is.Number(s) ? s : 2000
      );
    },
    changeLocale() {
      if (this.lang === "cn") {
        this.locale = En;
        this.lang = "en";
      } else {
        this.locale = ZhCn;
        this.lang = "cn";
      }
    },
    load() {
      let val;
      if (this.type === 2) {
        val = this.value;
      } else if (this.type === 0) {
        val = formCreate.toJson(this.value, 2);
      } else {
        val = JSON.stringify(this.value, null, 2);
      }
      this.$nextTick(() => {
        this.editor = CodeMirror(this.$refs.editor, {
          lineNumbers: true,
          mode: this.type === 2 ? { name: "vue" } : "application/json",
          gutters: ["CodeMirror-lint-markers"],
          lint: true,
          line: true,
          tabSize: 2,
          lineWrapping: true,
          value: val || "",
        });
        this.editor.on("blur", () => {
          this.err = this.editor.state.lint.marked.length > 0;
        });
      });
    },
    onValidationError(e) {
      this.err = e.length !== 0;
    },
    // showJson() {
    //   this.state = true;
    //   this.type = 0;
    //   this.value = this.$refs.designer.getRule();
    // },
    // showOption() {
    //   this.state = true;
    //   this.type = 1;
    //   this.value = this.$refs.designer.getOption();
    // },
    // showTemplate() {
    //   this.state = true;
    //   this.type = 2;
    //   this.value = this.makeTemplate();
    // },
    // setJson() {
    //   this.state = true;
    //   this.type = 3;
    //   this.value = [];
    // },
    // setOption() {
    //   this.state = true;
    //   this.type = 4;
    //   this.value = { form: {} };
    // },

    //导出表单数据
    async throwJsonUsePopover() {
      try {
        this.FormData["jsonStr"] = JSON.stringify(
          this.$refs.designer.getRule()
        );
        this.FormData["optionsStr"] = JSON.stringify(
          this.$refs.designer.getOption()
        );

        const response = await TJTB(this.FormData, this.formname);
        console.log("数据传输成功:", response);
      } catch (error) {
        console.error("数据传输失败:", error);
      }
      this.formname = "";
      this.visible = false;
    },

    cancelPopover() {
      this.formname = ""; // 重置表单名称
      this.visible = false; // 隐藏弹出框
    },

    //导入表单数据
    async useSelectJson(ids) {
      const response = await GJFBBI(this.getvalue);

      console.log(response);
      // 直接设置表单规则
      this.$refs.designer.setRule(
        formCreate.parseJson(response.data.formJsonString.jsonStr)
      );
      // 直接设置表单选项
      this.$refs.designer.setOption(
        JSON.parse(response.data.formJsonString.optionsStr)
      );
      this.loadAutoSave();
      this.getvalue = null;
      this.getvisible = false; // 隐藏弹出框
    },
    remoteMethod(query) {
      if (query) {
        this.getloading = true;
        setTimeout(() => {
          this.getloading = false;
          this.getoptions = this.getlist.filter((item) => {
            return item.label.toLowerCase().includes(query.toLowerCase());
          });
        }, 200);
      } else {
        this.getoptions = [];
      }
    },

    onOk() {
      if (this.err) return;
      const json = this.editor.getValue();
      let val = JSON.parse(json);
      if (this.type === 3) {
        if (!Array.isArray(val)) {
          this.err = true;
          return;
        }
        this.$refs.designer.setRule(formCreate.parseJson(json));
      } else {
        if (!is.Object(val) || !val.form) {
          this.err = true;
          return;
        }
        this.$refs.designer.setOption(val);
      }
      this.state = false;
    },
    makeTemplate() {
      const rule = this.$refs.designer.getRule();
      const opt = this.$refs.designer.getOption();
      return `<template>
  <form-create
    v-model="fapi"
    :rule="rule"
    :option="option"
    @submit="onSubmit"
  ></form-create>
</template>

<script>
import formCreate from "@form-create/element-ui";

export default {
  data () {
    return {
        fapi: null,
        rule: formCreate.parseJson('${formCreate
          .toJson(rule)
          .replaceAll("\\", "\\\\")}'),
        option: formCreate.parseJson('${JSON.stringify(opt)}')
    }
  },
  methods: {
    onSubmit (formData) {
      //todo 提交表单
    }
  }
}
<\/script>`;
    },
  },
  async mounted() {
    const cache = this.getCache();
    if (cache.rule) {
      this.$refs.designer.setRule(cache.rule);
    }
    if (cache.opt) {
      this.$refs.designer.setOption(cache.opt);
    }
    this.$nextTick(() => {
      this.loadAutoSave();
    });
    const response = await GJFBINPI("");
    this.getlist = response.data.map((item) => {
      return { value: item.id, label: item.formName };
    });
  },
  beforeDestroy() {
    const id = this.autoSaveId;
    id && clearInterval(id);
  },
  beforeCreate() {
    window.jsonlint = jsonlint;
  },
};
</script>

<style>
._fc-top {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #282828;
  position: relative;
  cursor: default;
}

:focus-visible {
  outline: 0 none;
}

.top_img {
  cursor: pointer;
}

._fc-top .close {
  position: absolute;
  right: 15px;
  top: 6px;
  color: #ffffff;
  background-color: #c6c6c652;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
  cursor: pointer;
}

._fc-top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 20px;
}

._fc-top-copyright {
  display: flex;
}

._fc-top-link {
}

._fc-top a {
  height: 35px;
  font-size: 14px;
  line-height: 35px;
  color: #aaa;
  text-decoration: none;
}

._fc-top a + a {
  margin-left: 20px;
}

._fc-t-header {
  height: 60px;
  margin: 0 20px;
  position: relative;
  display: flex;
  align-items: center;
  cursor: default;
}

._fc-t-logo {
  height: 26px;
}

._fc-t-name {
  display: inline-block;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-left: 5px;
}

._fc-t-menu {
  position: absolute;
  right: 0;
}

._fc-t-menu i {
  font-size: 12px;
}

.handle {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

._fc-t-menu .el-dropdown,
.handle .el-dropdown {
  cursor: pointer;
}

.handle .el-icon {
  margin-left: 0;
}

body {
  min-height: 100vh;
  padding: 0;
  margin: 0;
  display: flex !important;
  flex-direction: column !important;
}

#app {
  display: flex;
  flex-direction: column;
  flex: 1;
}

._fc-copyright {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  font-size: 16px;
  border-top: 1px solid #ececec;
  background-color: #fff;
  cursor: pointer;
}

._fc-t-dialog .CodeMirror {
  height: 450px;
}

._fc-t-dialog .CodeMirror-line {
  line-height: 16px !important;
  font-size: 13px !important;
}

.CodeMirror-lint-tooltip {
  z-index: 2021 !important;
}

._fc-t-dialog .el-dialog__body {
  padding: 0px 20px;
}

._fc-b-item {
  display: flex;
}

._fc-zz {
  background-image: -webkit-linear-gradient(
    left,
    #cd7f32,
    #d81159 10%,
    #ffbc42 20%,
    #75d701 30%,
    #30a9de 40%,
    #d81159 60%,
    #ffbc42 70%,
    #75d701 80%,
    #30a9de 90%,
    #cd7f32
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% 100%;
  -webkit-animation: flowlight 5s linear infinite;
  animation: flowlight 5s linear infinite;
  font-weight: 700;
}

@keyframes flowlight {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@-webkit-keyframes flowlight {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.pro-version {
  color: #cd7f32 !important;
  font-weight: 600;
}
</style>