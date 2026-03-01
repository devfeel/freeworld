"""
去除剑图片右下角水印
"""

from PIL import Image
import os

INPUT_DIR = "D:/AICode/MaFaGame/MaFaWeb/assets/icons/items-create"
OUTPUT_DIR = "D:/AICode/MaFaGame/MaFaWeb/assets/icons/items-create/no_watermark"

# 需要处理的图片
IMAGES = [
    "sword_wooden.png",
    "sword_iron.png",
    "sword_steel.png",
    "sword_fine_steel.png",
    "sword_silver.png",
    "sword_mithril.png",
    "sword_golden.png",
    "sword_dragon_scale.png",
    "sword_titan.png",
    "sword_god_slayer.png",
]

# 水印区域 (右下角)
# 根据图片内容调整裁剪区域
CROP_RIGHT = 60  # 右边裁掉
CROP_BOTTOM = 50  # 下边裁掉


def remove_watermark(input_path, output_path):
    """裁剪掉右下角水印区域"""
    img = Image.open(input_path)
    width, height = img.size

    # 裁剪区域: 保留左边和上边
    left = 0
    top = 0
    right = width - CROP_RIGHT
    bottom = height - CROP_BOTTOM

    # 裁剪
    cropped = img.crop((left, top, right, bottom))

    # 保存
    cropped.save(output_path, 'PNG')
    print(f"处理完成: {output_path} (裁剪后尺寸: {right}x{bottom})")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("开始去除水印...")

    for img_name in IMAGES:
        input_path = os.path.join(INPUT_DIR, img_name)
        output_path = os.path.join(OUTPUT_DIR, img_name)

        if os.path.exists(input_path):
            remove_watermark(input_path, output_path)
        else:
            print(f"文件不存在: {input_path}")

    print(f"\n完成! 输出目录: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
