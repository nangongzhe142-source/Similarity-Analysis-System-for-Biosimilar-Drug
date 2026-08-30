# BioCompare 共价连接模块交付说明

交付日期：2026-08-25

## 已交付

- COV-01 游离巯基：Ellman 公式计算、可配置预警线、可选 HMW 背景关联、候选药/参照药文件入口、Sage 可选位点筛查入口。
- COV-02 二硫键连接图谱：Pyteomics 理论连接肽、OpenMS 格式转换、Kojak 主检索、xiSEARCH 正交复核、证据映射和质量阻断。
- 统一异步 API：沿用 `POST /api/jobs`、任务状态、结果接口、隔离工作目录和产物白名单。
- 网页入口：`/modules/free-thiol`、`/modules/disulfide-map`。

## 本地引擎

- Kojak 2.1.0：`C:\Users\MI\bioTools\Kojak\Kojak.exe`
- xiSEARCH 1.8.13：`C:\Users\MI\bioTools\xiSEARCH\xiSEARCH_1.8.13\xiSEARCH.jar`
- Temurin JRE 17：`C:\Users\MI\bioTools\temurin17-jre\jdk-17.0.20.1+1-jre\bin\java.exe`
- OpenMS 3.5.0、Sage 0.14.6、Pyteomics：复用既有安装。

## 验证结果

- 外部进程实机拉起成功；合成 mzML/MGF/FASTA 经 OpenMS、Kojak、xiSEARCH 完成技术链路。
- COV-02 合成样例任务按设计返回 `quality-blocked`：尚无品种专属预期二硫键配置，也没有达到证据阈值的真实连接肽。
- Ellman 在线示例返回 `4.8763250883 mol SH/mol protein`，生成预警线和 HMW 背景提示，`decision=null`。
- 自动测试：44 passed。
- Next.js 生产构建：通过。

## 监管边界和待完成项

- 工具只标记证据、覆盖和偏离，不自动给出候选药与参照药是否相似的结论。
- COV-02 正式可用前，必须补充品种专属预期二硫键表，并用真实非还原肽图冻结 FDR、谱图人工复核和异常配对规则。
- COV-01 IAM/NEM 位点入口已能提交技术筛查任务，但正式位点定位与相对丰度方法尚未冻结，因此保持质量阻断。
- HMW 当前通过输入结果值进行背景关联；后续可再接为 PUR-01 已完成任务的自动读取。

## 主要代码

- `worker/covalent_bonds.py`
- `backend/calculation_router.py`
- `backend/calculation_units.py`
- `backend/calculation_tasks.py`
- `backend/engine_adapter_registry.py`
- `backend/external_engines.py`
- `worker/batch_pipeline_cli.py`
- `app/modules/[moduleId]/module-workspace.tsx`
- `app/result-views.tsx`
- `app/project-provider.tsx`
- `lib/project.ts`
- `lib/types.ts`
- `tests/test_covalent_bonds.py`

