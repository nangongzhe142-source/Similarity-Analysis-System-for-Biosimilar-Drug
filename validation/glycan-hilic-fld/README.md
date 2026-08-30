# GLY-02 非临床演示数据

运行 `scripts/generate_glycan_hilic_example.py` 生成候选药和参照药各一份 HILIC-FLD CSV。

- 仅用于验证上传、异步调度、hplc-py 峰处理、glypy 组成核对和页面展示。
- 单批参照药不能构建天然波动区间，结果应显示“参照批次不足”。
- CSV 不含 MS 证据，糖型归属应显示“保留时间推定”，不得显示为 MS 确证。
- 厂商原始文件会走 Rscript/chromConverter；规范 CSV 会直接进入下游，避免伪造厂商格式。
