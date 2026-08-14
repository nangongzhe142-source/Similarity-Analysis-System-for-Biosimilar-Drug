# tools-poc — 开源工具可行性验证

本目录与 Next.js 应用完全隔离：独立的 Python 虚拟环境、独立的依赖、独立的输出。
网站不会调用这里的任何代码，`npm run build` 也不会读取本目录。

**本目录的唯一目的是证明可行性**，不是提供可用于监管申报的分析能力。

> - 「工具能运行」≠「方法学已验证」≠「符合 GxP / 21 CFR Part 11」；
> - 「两组数据数值接近」≠「生物类似性成立」。

调研与结论见 [`../docs/tool-survey/01-primary-structure.md`](../docs/tool-survey/01-primary-structure.md)。

## 环境搭建

```powershell
# 在仓库根目录执行
python -m venv tools-poc\.venv
tools-poc\.venv\Scripts\python.exe -m pip install -r tools-poc\requirements.txt
```

实测环境：Windows 10.0.26200 / Python 3.10.13 / 安装耗时 63 s（核心）+ 47 s（UniDec）/ 虚拟环境 925 MB。

### 已知环境陷阱：非 ASCII 路径

本仓库位于 `d:\生物类似药判别系统\...`，路径含中文。**OpenMS 与 UniDec 的 C/C++ 内核都无法处理非 ASCII 路径。**

- 直接 `import pyopenms` 会以 `OpenMS FATAL ERROR! Cannot find shared data!` 退出；
- UniDec 需要把输入谱图放在 ASCII 路径下才能被其 `unidec.exe` 读取。

`scripts/_openms_bootstrap.py` 负责把 OpenMS 的 share 目录（163 个文件，约 12 MB）复制到系统临时目录下的 ASCII 路径，并在导入 pyopenms **之前**设置 `OPENMS_DATA_PATH`。
UniDec 相关脚本则把谱图复制到 `%TEMP%\unidec-poc-work\` 后再运行。

这两处规避不修改系统环境变量，不做全局安装，仅在脚本进程内生效。

## 脚本清单

| 脚本 | 对应框架分析点 | 达到的部署层级 | 输出 |
|---|---|---|---|
| `s08_pyopenms_official_example.py` | —（工具级验证） | **L2** 官方文档示例，6 项断言全通过 | `output/s08_pyopenms_official_example.json` |
| `s08b_unidec_official_example.py` | —（工具级验证） | **L1+** 官方测试谱可执行，但包内无权威预期输出，不声称 L2 | `output/s08b_unidec_official_example.json` |
| `s09a_intact_mass_chain.py` | `intact-mass` 等 5 项 | **L4** 去卷积质量与理论质量核对，偏差 −2.8 ppm | `output/s09a_intact_mass_chain.json` |
| `s09b_peptide_map_coverage.py` | `ms1-sequence-coverage` 等 3 项 | **L4** 覆盖率 99.31%，单氨基酸替换被检出 | `output/s09b_peptide_map_coverage.json` |
| `s09c_free_thiol_quality_range.py` | `free-thiol` | **L4** QR 判定具备区分能力，自研实现 | `output/s09c_free_thiol_quality_range.json` |

运行全部脚本：

```powershell
$env:PYTHONIOENCODING="utf-8"
tools-poc\.venv\Scripts\python.exe tools-poc\scripts\s08_pyopenms_official_example.py
tools-poc\.venv\Scripts\python.exe tools-poc\scripts\s08b_unidec_official_example.py
tools-poc\.venv\Scripts\python.exe tools-poc\scripts\s09a_intact_mass_chain.py
tools-poc\.venv\Scripts\python.exe tools-poc\scripts\s09b_peptide_map_coverage.py
tools-poc\.venv\Scripts\python.exe tools-poc\scripts\s09c_free_thiol_quality_range.py
```

全部脚本使用固定随机种子 `20260814`，输出可完全复现。
运行日志保存在 [`../docs/tool-survey/evidence/`](../docs/tool-survey/evidence/)。

## 数据来源与性质

| 数据 | 性质 | 来源 | 是否可作为结论依据 |
|---|---|---|---|
| BSA 序列与二硫键注释 | 真实公开数据 | UniProt P02769，缓存于 `data/` 并记录 sha256 | 可，仅作为演示对象 |
| UniDec 测试谱 | 官方示例数据 | pip 包内 `unidec/bin/TestSpectra/` | 可，仅证明引擎可执行 |
| 电荷态包络谱 | **合成数据** | 由理论质量正演生成 | **否** |
| 肽段实测母离子质量 | **合成数据** | 由理论肽段质量加噪声生成 | **否** |
| 游离巯基批次数值 | **合成数据** | 正态分布抽样 | **否** |

所有输出 JSON 均带 `dataSource` 字段。合成数据一律标记为 `synthetic-demo`，
**不得**在网站上以任何形式呈现为真实测量结果。

## 未做的事

- 未处理任何真实实验数据（本项目当前无真实数据）；
- 未读取厂商原始格式（RAW/WIFF），未做 mzML 转换；
- 未做 MS/MS 碎片离子级别的序列确认，仅做 MS1 质量匹配；
- 未做保留时间比对与修饰搜索；
- 未接入 Next.js，未提供任何在线计算接口。
