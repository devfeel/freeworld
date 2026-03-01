"""
将武器图片的背景变为透明 - 智能版
基于边缘颜色识别背景
"""

from PIL import Image
import os

INPUT_DIR = "D:/AICode/MaFaGame/MaFaWeb/assets/icons/items-create/weapp_icons"
OUTPUT_DIR = "D:/AICode/MaFaGame/MaFaWeb/assets/icons/items-create/weapp_icons_transparent"


def get_bg_color(img):
    """获取背景颜色 - 检查四个角"""
    w, h = img.size
    corners = [
        (0, 0),  # 左上
        (w-1, 0),  # 右上
        (0, h-1),  # 左下
        (w-1, h-1),  # 右下
    ]

    colors = []
    for x, y in corners:
        colors.append(img.getpixel((x, y)))

    # 返回最常见的角落颜色
    from collections import Counter
    most_common = Counter(colors).most_common(1)[0][0]
    return most_common[:3]  # 返回RGB


def make_transparent(img):
    """基于角落颜色将背景变为透明"""
    img = img.convert('RGBA')
    w, h = img.size

    # 获取背景色
    bg_color = get_bg_color(img)
    print(f"    检测到背景色: {bg_color}")

    # 容差范围
    tolerance = 45

    new_data = []
    for y in range(h):
        for x in range(w):
            pixel = img.getpixel((x, y))
            r, g, b = pixel[:3]

            # 检查是否接近背景色
            diff = abs(r - bg_color[0]) + abs(g - bg_color[1]) + abs(b - bg_color[2])

            if diff < tolerance:
                new_data.append((0, 0, 0, 0))  # 透明
            else:
                new_data.append(pixel)

    img.putdata(new_data)
    return img


def process_image(input_path, output_path):
    img = Image.open(input_path)
    transparent_img = make_transparent(img)
    transparent_img.save(output_path, 'PNG')
    print(f"  -> {os.path.basename(output_path)}")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    files = [f for f in os.listdir(INPUT_DIR) if f.endswith('.png')]

    print(f"开始处理 {len(files)} 张图片...")

    for filename in files:
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, filename)
        print(f"处理: {filename}")
        process_image(input_path, output_path)

    print(f"\n完成! 输出目录: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
