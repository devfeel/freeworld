"""
生成适合微信小程序使用的武器图片 - 居中版
"""

from PIL import Image
import os

INPUT_DIR = "D:/AICode/MaFaGame/MaFaWeb/assets/icons/items-create/no_watermark"
OUTPUT_DIR = "D:/AICode/MaFaGame/MaFaWeb/assets/icons/items-create/weapp_icons"

WEAPONS = [
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

SIZES = [32, 48, 64, 128]

# 精确裁剪 - 让剑在图中居中
CROP_TOP = 75     # 顶部
CROP_BOTTOM = 55  # 底部 (水印)


def process_image(input_path, output_path, target_size):
    img = Image.open(input_path)
    width, height = img.size

    left = 0
    top = CROP_TOP
    right = width
    bottom = height - CROP_BOTTOM

    cropped = img.crop((left, top, right, bottom))
    resized = cropped.resize((target_size, target_size), Image.LANCZOS)
    resized.save(output_path, 'PNG')
    print(f"  {target_size}x{target_size}: {os.path.basename(output_path)}")


def process_weapon(weapon_name):
    input_path = os.path.join(INPUT_DIR, weapon_name)
    name_without_ext = weapon_name.replace('.png', '')

    for size in SIZES:
        output_path = os.path.join(OUTPUT_DIR, f"{name_without_ext}_{size}.png")
        process_image(input_path, output_path, size)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("开始生成小程序图片...")

    for weapon in WEAPONS:
        print(f"处理: {weapon}")
        process_weapon(weapon)

    print(f"\n完成! 输出目录: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
