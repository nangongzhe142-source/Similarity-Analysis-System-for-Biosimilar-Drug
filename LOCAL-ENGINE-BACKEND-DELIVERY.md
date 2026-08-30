# BioCompare 本地 UniDec / FragPipe 异步任务服务

## 交付边界

本次新增后端本地进程调度骨架。BioCompare 不调用外部 Web API，也不重写质谱核心算法；它只创建隔离目录、保存输入、组装受控命令、启动本地程序、捕获日志、登记状态和返回产物路径。

业务模块固定映射如下：

- `IM-01`、`DM-02`、`LC-03`、`HC-04`、`DHC-05` → UniDec。
- `PTM-06` → FragPipe headless workflow。

目录结构为：

```text
.runtime/local-engine-tasks/
  {projectId}/
    {moduleKey}/
      {taskId}/
        inputs/   # 原始上传，只读保留
        work/     # 提交给第三方程序的副本及中间文件
        outputs/  # FragPipe --workdir / 业务结果目录
        logs/     # stdout.log、stderr.log、backend-error.log
        task.json
        command.json
        result.json
```

## 环境配置

复制 `.env.example` 中以下变量到 `.env.local`，路径必须指向真正的命令行启动器，不能填写安装包路径：

```dotenv
# pip安装示例：指向 site-packages\unidec\bin 下的核心程序，不是 Scripts\unidec.exe GUI入口
UNIDEC_BIN=C:\BioCompare\.venv\Lib\site-packages\unidec\bin\unidec.exe
FRAGPIPE_BIN=C:\Program Files\FragPipe\fragpipe.bat
LOCAL_ENGINE_TASK_ROOT=C:\BioCompareData\engine-tasks
LOCAL_ENGINE_WORKERS=2
LOCAL_ENGINE_TIMEOUT_SECONDS=7200
```

FragPipe 还需要其自身工作流涉及的 Java、MSFragger、Philosopher 等组件已经在 FragPipe 中配置完成。非学术或商业用途须单独确认 FragPipe/MSFragger 许可。

## API 调用

创建任务：`POST /engine-tasks`，使用 `multipart/form-data`：

- `projectId`：上层生物类似药项目编号，只允许字母、数字、`_`、`-`。
- `moduleKey`：固定模块键，详见 `GET /engine-tasks/modules`。
- `parametersJson`：JSON 字符串。
- `files`：一个或多个输入文件。

UniDec 参数示例：

```json
{"configFile":"unidec.conf","timeoutSeconds":1800}
```

UniDec 原生核心命令接受配置文件，而不是直接接受未经预处理的原始谱：

```text
unidec.exe <configuration-file>
```

因此应同时上传配置文件及其引用的数据文件；配置中的相对文件名在任务 `work` 目录内解析。现有 `/jobs` 接口仍保留原来的 BioCompare UniDec Python 适配器，适用于需要由系统先生成配置的旧流程。

FragPipe 参数示例：

```json
{
  "workflowFile":"MAM.workflow",
  "manifestFile":"samples.manifest",
  "timeoutSeconds":14400
}
```

FragPipe 最终命令契约为：

```text
fragpipe --headless --workflow <workflow> --manifest <manifest> --workdir <outputs>
```

提交接口立即返回 `202` 和任务 ID，不等待专业程序结束。随后轮询：

- `GET /engine-tasks/{taskId}`：状态与产物清单。
- `GET /engine-tasks/{taskId}/logs?stream=stdout&tail=300`：实时标准输出。
- `GET /engine-tasks/{taskId}/logs?stream=stderr&tail=300`：实时错误输出。
- `GET /engine-tasks/{taskId}/result`：完成后的结果路径清单。
- `GET /engine-tasks/{taskId}/artifacts/{path}`：下载指定产物。

分子量任务状态流：`staging → queued → running → completed`。FragPipe PTM任务即使进程返回0，也只表示上游程序运行成功：存在输出时进入 `awaiting_downstream`，未登记到输出时进入 `quality-blocked`，不得标记为PTM位点定量比对完成。下游必须继续执行目标-诱饵FDR、PTM定位概率质量闸门、XIC定量、字段适配和多批参照区间分析。现有OpenMS+Sage路径保持为独立、优先验证的PTM/MAM路径，FragPipe只是可选适配器。

其他异常终态为 `failed`、`timed_out` 或 `interrupted`。后端重启时残留的运行中任务会被标记为 `interrupted`，避免页面长期误报运行中。

## 安全与容错

- 仅能选择登记过的业务模块，接口不接收任意可执行程序路径。
- 公共接口禁止非空 `additionalArgs`。Windows `.bat/.cmd` 必须经过 `cmd.exe`，因此不能依赖一般引号规则防御 `&|<>^%!` 等元字符；新增参数必须开发成后端具名字段并实施类型、范围或枚举白名单。
- 原生程序参数通过列表传入 `subprocess.Popen(..., shell=False)`；Windows 批处理启动器仅由受信任的 `FRAGPIPE_BIN` 配置触发。
- UUID 任务目录避免并发冲突；输入、工作副本、输出和日志分开存放。
- stdout/stderr 分流、逐行刷新，可在运行期间读取。
- 超时会终止整个进程树；非零退出码、缺失程序和参数错误均进入失败状态并保留日志。
- 产物下载仅允许任务状态中登记的精确路径；任务输入、工作目录中的输入副本、路径越界请求以及任务结束后新增的未登记文件均不可通过产物接口下载。
- `command.json` 保存实际命令、工作目录和超时值，便于审计。正式环境如命令中包含敏感参数，应在后续加入字段级脱敏。
