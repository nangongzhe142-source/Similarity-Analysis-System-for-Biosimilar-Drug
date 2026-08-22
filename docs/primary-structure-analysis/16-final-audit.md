# P16 — 一级结构分析软件最终审计

**日期**：2026-08-21  
**范围**：计划 P0–P16；检查点 5。  
**不是**：GxP / 21 CFR Part 11 认证、其余 7 个质量属性大类、V2 尚未写完规则的 4 个一级结构项目。

契约版本：`schemaVersion` **1.0.0**，`ruleSetVersion` **v2-sheet3-8bd6b18f**（V2 工作簿 SHA-256 前 8 位）。

---

## 1. 支持的 methodId

配置源：`src/data/method-analysis-config.ts`。33 条一级结构方法全覆盖，无空白。

### 1.1 可分析（`analyzable`，20 条）

上传与任务入口仅在 `status === "analyzable"` 且已声明 profile 时出现。

| itemId | methodId | profile |
|---|---|---|
| intact-mass | intact-mass-primary-1 | intact-mass |
| intact-mass | intact-mass-orthogonal-1 | peptide-map |
| intact-mass | intact-mass-orthogonal-2 | intact-mass |
| deglycosylated-intact-mass | deglycosylated-intact-mass-primary-1 | intact-mass |
| deglycosylated-intact-mass | deglycosylated-intact-mass-orthogonal-1 | peptide-map |
| deglycosylated-intact-mass | deglycosylated-intact-mass-orthogonal-2 | intact-mass |
| light-chain-mass | light-chain-mass-primary-1 | intact-mass |
| light-chain-mass | light-chain-mass-orthogonal-1 | peptide-map |
| light-chain-mass | light-chain-mass-orthogonal-2 | intact-mass |
| non-deglycosylated-heavy-chain-mass | non-deglycosylated-heavy-chain-mass-primary-1 | intact-mass |
| non-deglycosylated-heavy-chain-mass | non-deglycosylated-heavy-chain-mass-orthogonal-1 | peptide-map |
| non-deglycosylated-heavy-chain-mass | non-deglycosylated-heavy-chain-mass-orthogonal-2 | intact-mass |
| deglycosylated-heavy-chain-mass | deglycosylated-heavy-chain-mass-primary-1 | intact-mass |
| deglycosylated-heavy-chain-mass | deglycosylated-heavy-chain-mass-orthogonal-1 | peptide-map |
| deglycosylated-heavy-chain-mass | deglycosylated-heavy-chain-mass-orthogonal-2 | intact-mass |
| ms1-sequence-coverage | ms1-sequence-coverage-primary-1 | ms1-coverage |
| ms1-sequence-coverage | ms1-sequence-coverage-orthogonal-1 | msms-sequence |
| ms1-sequence-coverage | ms1-sequence-coverage-orthogonal-2 | ms1-coverage |
| msms-sequence-coverage | msms-sequence-coverage-primary-1 | msms-sequence |
| msms-sequence-coverage | msms-sequence-coverage-orthogonal-1 | msms-sequence |

`peptide-map` 五条方法会出 TIC 叠加图，**verdict 固定为 REVIEW**；无上传时用标明的合成 TIC fixture（末峰 +0.40 min）。不得把该 profile 写成「肽图已鉴定」。

### 1.2 仅展示（`display-only`，4 条）

无上传。湿实验或不属于本项目可运行路径：`msms-sequence-coverage-orthogonal-2`、`n-c-terminal-sequence-primary-2`、`free-thiol-orthogonal-2`、`disulfide-bonds-orthogonal-2`。

### 1.3 规则未定义（`rule-not-defined`，9 条，D17）

无分析、无 adapter、无上传。面板文案「Sheet3 未定义该项程序规则」。

- CDR：`cdr-signature-peptides-primary-1` / `orthogonal-1` / `orthogonal-2`
- N/C 端：`n-c-terminal-sequence-primary-1` / `orthogonal-1`
- 游离巯基：`free-thiol-primary-1` / `orthogonal-1`
- 二硫键：`disulfide-bonds-primary-1` / `orthogonal-1`

游离巯基 QR 仍在 Live Demo 与 `tools-poc/scripts/s09c_free_thiol_quality_range.py`，**不进入分析服务**。

---

## 2. 支持的输入格式

摄取白名单：`analysis-service/app/security/limits.py`（D16）。

| 格式 | 扩展名 | 上限 | 本机实际用途 |
|---|---|---|---|
| mzML | `.mzml` | 2 GB | 完整质量 / MS1 / MS/MS 主路径 |
| mzXML | `.mzxml` | 2 GB | 摄取与 pyOpenMS 可读；默认 golden 未以 mzXML 为输入 |
| MGF | `.mgf` | 1 GB | MS/MS 搜库可接受 |
| 文本谱/峰表 | `.txt` `.csv` `.tsv` | 20 MB | 完整质量两列谱；MS1 质量表；肽图色谱点 |
| FASTA | `.fasta` `.fa` `.faa` | 2 MB | 理论序列 |
| 图片 | `.png` `.jpg` `.jpeg` `.webp` | 20 MB，像素 ≤ 4000×4000 | 全部测量文件均为图时走图片降级 |
| Thermo RAW | `.raw` | 4 GB | Docker `msconvert` → mzML。P6 实机：4 个 pwiz Thermo 样本 |
| SCIEX WIFF | `.wiff` | 4 GB | **仅摄取允许**。`convert_raw_to_mzml` 按 Thermo RAW 调用，**未用 WIFF 样本验证** |

拒绝：无扩展名、未知扩展名、ZIP/GZIP/RAR/7z 伪装、XXE、CSV 列数 > 256。中文文件名在落盘前被清洗为 ASCII（D22）。

---

## 3. 实际验证的软件版本（本机 2026-08-21）

下列版本由当前 `tools-poc/.venv` 与宿主命令读出，不是范围约束。

| 软件 | 版本 | 用途 |
|---|---|---|
| pyOpenMS | 3.5.0 | 读谱、理论质量、酶切、碎片离子 |
| UniDec | 8.2.1（`unidec.exe` 子进程去卷积） | 完整/亚基质量 |
| Comet | UWPR **2024.01 rev. 0**，`analysis-service/tools/comet/win64/comet.exe` | MS/MS 搜库 |
| ProteoWizard msconvert | 镜像 `chambm/pwiz-skyline-i-agree-to-the-vendor-licenses`，digest 前缀 `52d83017`（P6 日志）；容器内 `mywine msconvert --mzML` | RAW→mzML |
| OpenCV | 5.0.0（headless） | 图片降级 |
| scikit-image | 0.25.2 | 图片降级 |
| pytesseract | 0.3.13 | OCR 包装 |
| Tesseract | 5.5.0.20241111（宿主 `C:\Program Files\Tesseract-OCR`） | OCR |
| FastAPI | 0.141.1 | 分析服务 |
| Pydantic | 2.13.4 | 契约 |
| NumPy | 2.2.6 | 数值 / 肽图 fixture |
| matplotlib | 3.10.9 | 后端 PNG |
| Pillow | 12.3.0 | 图片校验 |
| Next.js | 16.3.0 | 前端 |
| React | 19.2.8 | 前端 |
| TypeScript | 5.9.3 | 前端 |

Tesseract 语言包：P10 实机用 **eng + osd**。`tessdata/tessdata.manifest.json` 还登记了 tessdata_best **chi_sim**；工作区 `tessdata/` 当前只有 manifest 与下载脚本，**traineddata 文件未作为仓库内容出现在本次审计的文件列举里**。中文轴标签 OCR 不得标成已验证。

分析服务无独立 `.venv`。科学栈与 pytest 使用 **`tools-poc/.venv`**。

---

## 4. 三种证据模式

等级：`raw-data-analysis` > `structured-export-analysis` > `image-only-exploratory`。

### 4.1 原始数据模式

用户上传 mzML /（已转换的）Thermo RAW / MGF。`dataSource` 为 `measured`（用户文件）或 `official-example` / `public`（fixture）。完整质量：pyOpenMS 读谱 → UniDec 去卷积。MS1：酶切 + ppm 匹配。MS/MS：Comet FDR 1%。失败为 `job.status = FAILED`，不得显示为「不相似」。

Golden（合成/官方，标明来源）：

- s09a：BSA 氧化完整质量 **66398.19 Da**，另有 66398 / 66560 / +162 Da
- s09b：118 肽，覆盖率 **99.31% / 96.57%**，327 位 G→A
- Comet：BSA-FT-HCD → PSM **YICDNQDTISSK**（integration 套件含 RAW 转换）

### 4.2 结构化导出模式

两列 txt/csv 谱、MS1 质量表、肽图色谱 CSV。证据等级 `structured-export-analysis`。不是仪器原始扫描。

### 4.3 图片降级模式

**仅当**候选与参照上传全部为图片时启用 `ImageFallbackAdapter`。混有谱图则走对应 profile，不降级。

- `dataSource = image-only`，证据 `image-only-exploratory`
- **verdict 一律 REVIEW**
- 校准不可靠时 `calibrationReliable = false`，不输出物理单位（Da / m·z⁻¹ / 保留时间）
- 叠加图横轴为归一化列，**不得标为保留时间**
- **不得**用图像相似度判定生物类似性

DOCX 六张图已在 P10 实跑；OCR 数字错误（如 `1544.7`→`15447`）已记录，不得当实测质量。

---

## 5. 未支持项与规则缺口

| 缺口 | 状态 |
|---|---|
| CDR / N/C 端 / 游离巯基 / 二硫键 程序判定 | D17：不分析 |
| pLink 2/3 二硫键交联搜索 | P14 **Blocked/L0**；GitHub `license` null；pLink 2.3.11 授权 2025-01-10 已过期；未安装 |
| 分析服务 `disulfide-map` / `free-thiol` adapter | 不存在 |
| WIFF 转换 | 未验证 |
| 真实抗体生产 mzML 作为默认 CI | 工作区大文件在 fixtures/.gitignore；默认 pytest 用合成 + 官方小样 |
| `peptide-map` 真实 LC 对齐/峰鉴定 | 未做；仅 TIC 叠加 + REVIEW |
| Sheet3 数值限度 | K 列「无统一相似性数值限度」；ΔDa / 覆盖率**不是**合格线 |
| V0.1 工作簿丢失 / `generate_data.py` | P2 已记；本计划未修 |
| 其余 7 个质量属性大类、151 条方法 | 无分析服务接入 |
| GxP / 21 CFR Part 11 | **非目标**（见下） |

---

## 6. GxP 非目标

本软件是本地研发辅助：任务 JSON 落盘、输入 SHA-256、工具版本与参数进溯源面板。它**不是**：

- 经过验证的 GxP 系统
- 21 CFR Part 11 电子签名 / 审计追踪产品
- 可出具监管结论的判定引擎

界面结论只解释 V2 Sheet3 已写明的比较类型。两组图谱接近 ≠ 生物类似性成立。

---

## 7. 复现命令

PowerShell 5.1 **不要用 `&&`**，用 `;`。`npm run check` 内部的 `&&` 由 npm 处理。仓库路径含中文：原生二进制须经 ASCII 暂存（D22）。

```powershell
Set-Location "d:\生物类似药判别系统\生物类似药相似性分析系统"
npm install
npm run check
```

分析服务（与 pytest 同一解释器）：

```powershell
$venv = "d:\生物类似药判别系统\生物类似药相似性分析系统\tools-poc\.venv\Scripts"
Set-Location "d:\生物类似药判别系统\生物类似药相似性分析系统\analysis-service"
$env:WORKSPACE_ROOT = "$PWD\workspaces"
$env:CORS_ORIGINS = "http://localhost:3000"
& "$venv\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8765
```

前端（另一窗口）：

```powershell
Set-Location "d:\生物类似药判别系统\生物类似药相似性分析系统"
npm run dev
```

浏览器：`http://localhost:3000/item/intact-mass`。服务默认 `http://127.0.0.1:8765`（可用 `NEXT_PUBLIC_ANALYSIS_SERVICE_URL` 覆盖）。CORS 仅 `http://localhost:3000`。

可选集成测试（Docker + 约 9 GB pwiz 镜像，单次 RAW 转换约 1 分钟）：

```powershell
Set-Location "d:\生物类似药判别系统\生物类似药相似性分析系统\analysis-service"
..\tools-poc\.venv\Scripts\python.exe -m pytest tests/ -m integration
```

健康检查：`GET http://127.0.0.1:8765/health`。
