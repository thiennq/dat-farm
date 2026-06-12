# Skill Game Asset Builder (WIP)

Gói Kỹ năng (Skill) hỗ trợ AI Agent tự động hoá việc tạo và chuyển đổi tài nguyên đồ hoạ & bản đồ cho dự án game nông trại.

## Cấu trúc Gói
*   `SKILL.md`: Bản thiết kế hướng dẫn chi tiết cho AI Agent cách sử dụng kỹ năng này.
*   `scripts/generate_animals.py`: Kịch bản Python tự sinh spritesheet cho gà, bò, cừu bằng thư viện PIL.
*   `scripts/convert_tmx.py`: Kịch bản Python chuyển đổi bản đồ XML TMX của Tiled sang JSON cho Phaser.

---

## Wishlist & Kế hoạch Thực hiện Chi tiết (Technical Specifications & Resume Plan)

Để phục vụ việc khôi phục tiến độ lập trình mà không phụ thuộc vào lịch sử chat, dưới đây là đặc tả kỹ thuật chi tiết của các phần việc trong tương lai:

### 1. Tổng quát hóa Script tạo Spritesheet
*   **Tệp tin mới**: `wip/skill-game-asset-builder/scripts/build_spritesheet.py` (thay thế cho `generate_animals.py`).
*   **Cú pháp gọi lệnh**:
    ```bash
    python wip/skill-game-asset-builder/scripts/build_spritesheet.py <config_path.json> <output_path.png>
    ```
*   **Đặc tả cấu trúc file cấu hình JSON (`config_path.json`)**:
    ```json
    {
      "frame_width": 16,
      "frame_height": 16,
      "cols": 4,
      "rows": 4,
      "color_map": {
        ".": [0, 0, 0, 0],
        "w": [255, 255, 255, 255],
        "r": [230, 50, 50, 255]
      },
      "frames": [
        // Danh sách các khung hình dạng ma trận chuỗi ký tự (chiều cao = frame_height, độ dài mỗi chuỗi = frame_width)
        [
          "....wwww....",
          "....wrbw...."
        ]
      ],
      "operations": [
        // Hỗ trợ tự sinh frame bằng các thao tác biến đổi
        {
          "type": "flip_horizontal", // Lật ngang
          "source_frame_indices": [8, 9, 10, 11], // Các frame gốc (ví dụ: hướng đi bên trái)
          "target_insert_index": 12 // Vị trí chèn các frame kết quả (ví dụ: hướng đi bên phải)
        },
        {
          "type": "color_replace", // Thay thế màu (ví dụ: tạo biến thể động vật màu nâu)
          "replace_map": {
            "w": "y" // Thay thế màu trắng bằng màu vàng/nâu
          },
          "source_frame_indices": [0, 1, 2, 3],
          "target_insert_index": 16
        }
      ]
    }
    ```

### 2. Tổng quát hóa Script chuyển đổi Bản đồ TMX
*   **Cú pháp gọi lệnh**:
    ```bash
    python wip/skill-game-asset-builder/scripts/convert_tmx.py <input_map.tmx> <output_map.json>
    ```
*   **Yêu cầu kỹ thuật**:
    - Thay thế đường dẫn hardcode `/Users/thiennq/workspace/personal/farm/public/assets/data/...` bằng đối số dòng lệnh hoặc đường dẫn tương đối (relative path) tính từ thư mục chạy script.
    - Cho phép cấu hình prefix đường dẫn ảnh (ví dụ: thay thế `../../graphics/` bằng cấu hình tùy biến thay vì mặc định `assets/` như hiện tại).

### 3. Thiết kế Prompt hướng dẫn LLM sinh JSON cấu hình
*   Xây dựng file `templates/llm_prompt_template.txt` chứa chỉ thị hệ thống (System Prompt) huấn luyện LLM:
    - Hiểu rõ về phong cách pixel art (16x16, 32x32).
    - Cách sắp xếp các frame hoạt ảnh theo chuẩn Phaser (Dòng 0: Down, Dòng 1: Up, Dòng 2: Left, Dòng 3: Right).
    - Định dạng đầu ra JSON bắt buộc chuẩn schema được thiết kế ở mục 1.

### 4. Tự động chèn hoạt ảnh vào Phaser Scene
*   Viết script Node.js hoặc Python để parse file AST (Abstract Syntax Tree) của tệp Javascript (e.g. `FarmScene.js`) hoặc sử dụng Regex thông minh để chèn:
    ```javascript
    this.load.spritesheet('animal_name', 'assets/animals/animal_name.png', { frameWidth: X, frameHeight: Y });
    ```
    và
    ```javascript
    this.anims.create({ key: 'animal_name_walk', frames: this.anims.generateFrameNames('animal_name', { start: 0, end: 3 }), ... });
    ```

---

## Nhật ký Trạng thái & Kế hoạch Tiếp tục (Execution Checklist)

*   [x] Khởi tạo cấu trúc thư mục Skill `wip/skill-game-asset-builder/`.
*   [x] Sao chép các scripts gốc (`generate_animals.py`, `convert_tmx.py`).
*   [ ] Thực hiện nâng cấp mục 1: Viết script `build_spritesheet.py` và kiểm thử với file cấu hình JSON của Gà/Bò.
*   [ ] Thực hiện nâng cấp mục 2: Viết lại `convert_tmx.py` để nhận arguments động.
*   [ ] Thực hiện nâng cấp mục 3: Tạo prompt template sinh JSON cấu hình cho LLM.
*   [ ] Thực hiện nâng cấp mục 4: Tự động tích hợp hoạt ảnh vào game Phaser.

