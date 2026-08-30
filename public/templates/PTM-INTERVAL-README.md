# PTM区间引擎输入说明

参照药和候选药分别上传一个CSV或TSV文件。每个文件可以包含多个独立生产批次和技术重复。

必填列：

- `lot_id`：独立生产批号；
- `protein_chain`：蛋白链，例如HC、LC；
- `residue`：氨基酸单字母；
- `position`：序列位置；
- `modification`：修饰类型；
- `value_percent`：修饰比例，必须为0至100之间的百分数数值。

可选列：`replicate_id`、`quant_status`、`loq_percent`、`identification_q_value`、`localization_probability`、`risk_level`。

技术重复不会被当作独立批次，而是先在同一批号、同一位点内求平均。区间方法和最低参照批次数必须在运行前确定。输出只标记区间状态、候选药特有变体和数据完整性问题，不给出相似性结论。
