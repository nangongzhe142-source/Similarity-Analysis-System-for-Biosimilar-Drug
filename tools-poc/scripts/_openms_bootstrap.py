"""pyOpenMS 非 ASCII 路径规避引导。

背景：OpenMS 的 C++ 内核在定位 share 目录时无法处理包含非 ASCII 字符的路径。
本仓库位于 `d:\\生物类似药判别系统\\...`，虚拟环境随之落在中文路径下，
直接 `import pyopenms` 会以 `OpenMS FATAL ERROR! Cannot find shared data!` 退出。

复现该错误：不设置 OPENMS_DATA_PATH，直接在本仓库内运行 `python -c "import pyopenms"`。

规避方式：把 share 目录（163 个文件，约 12 MB）复制到一个纯 ASCII 路径，
并在 **导入 pyopenms 之前** 设置 OPENMS_DATA_PATH 指向该副本。
副本放在用户临时目录下，不写入系统 PATH，不做全局安装。

用法：任何需要 pyopenms 的脚本，必须在 `import pyopenms` 之前先
    from _openms_bootstrap import ensure_openms_data_path
    ensure_openms_data_path()
"""

from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

ASCII_CACHE_DIR_NAME = "openms-share-ascii"


def _is_ascii(text: str) -> bool:
    return all(ord(character) < 128 for character in text)


def ensure_openms_data_path() -> Path:
    """确保 OPENMS_DATA_PATH 指向一个纯 ASCII 的 OpenMS share 目录。

    返回最终使用的 share 目录路径。若原始路径本身就是 ASCII，则原样返回，不复制。
    """
    existing = os.environ.get("OPENMS_DATA_PATH")
    if existing and _is_ascii(existing) and Path(existing).is_dir():
        return Path(existing)

    # 定位 site-packages 中随 pyopenms 一同安装的 share 目录，不导入 pyopenms 本身，
    # 因为导入会立刻触发那个 FATAL ERROR。
    site_packages = Path(__file__).resolve().parents[1] / ".venv" / "Lib" / "site-packages"
    source_share = site_packages / "pyopenms" / "share" / "OpenMS"
    if not source_share.is_dir():
        raise FileNotFoundError(
            f"未找到 pyopenms 的 share 目录: {source_share}. 请确认虚拟环境已安装 pyopenms。"
        )

    if _is_ascii(str(source_share)):
        os.environ["OPENMS_DATA_PATH"] = str(source_share)
        return source_share

    target_share = Path(tempfile.gettempdir()) / ASCII_CACHE_DIR_NAME / "OpenMS"
    if not _is_ascii(str(target_share)):
        raise RuntimeError(
            f"临时目录本身包含非 ASCII 字符，无法规避: {target_share}. "
            "请将仓库或临时目录迁移到纯 ASCII 路径。"
        )

    # 以文件数量作为廉价的完整性检查，避免每次运行都重复复制 12 MB。
    source_file_count = sum(1 for _ in source_share.rglob("*"))
    target_file_count = sum(1 for _ in target_share.rglob("*")) if target_share.is_dir() else -1
    if target_file_count != source_file_count:
        if target_share.exists():
            shutil.rmtree(target_share)
        target_share.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(source_share, target_share)

    os.environ["OPENMS_DATA_PATH"] = str(target_share)
    return target_share
