---
name: game-asset-builder
description: Sinh tự động spritesheet pixel art và convert bản đồ game từ TMX sang JSON
---

# Kỹ năng Dựng tài nguyên game (game-asset-builder)

Kỹ năng này giúp AI Agent tự động hoá việc tạo ảnh động (spritesheet) cho thực thể game và chuyển đổi bản đồ thiết kế (TMX) sang JSON tương thích Phaser 3.

## Hướng dẫn Sử dụng Kỹ năng

### 1. Sinh Spritesheet cho Động vật/Nhân vật mới
Khi nhận yêu cầu thêm loài động vật mới (ví dụ: heo, vịt, mèo...):
1. **Thiết kế màu**: Xác định các ký tự đại diện cho mã màu RGB/RGBA (ví dụ: `w` cho trắng, `p` cho hồng, `.` cho trong suốt).
2. **Thiết kế hoạt ảnh**: Vẽ các khung lưới 16x16 (với con nhỏ) hoặc 32x32 (với con lớn) cho các trạng thái:
   - **Idle** (Đứng yên)
   - **Walk** (Di chuyển)
   - **Eat** (Ăn)
   Theo các hướng: **Down** (xuống), **Up** (lên), **Left** (trái). Hướng **Right** (phải) sẽ được tự động tạo bằng cách lật ngang ảnh.
3. Chạy mã Python trong `scripts/generate_animals.py` để sinh và lưu ảnh trực tiếp vào `public/assets/animals/`.

### 2. Chuyển đổi bản đồ Tiled (TMX) sang JSON
Khi bản đồ thiết kế `.tmx` được cập nhật:
1. Chạy kịch bản `scripts/convert_tmx.py` để phân tích XML của tệp `.tmx` và các tilesets đi kèm.
2. Đảm bảo đường dẫn tài nguyên hình ảnh được chuyển đổi từ môi trường thiết kế cục bộ (`../../graphics/environment/`) sang thư mục tĩnh của Web (`assets/environment/`).
3. Tệp JSON kết quả sẽ được ghi vào `public/assets/data/map.json`.

### 3. Đăng ký tài nguyên vào game
Sau khi tạo xong tệp tin, cập nhật mã nguồn trong game (ví dụ: `src/scenes/FarmScene.js`) để nạp ảnh tĩnh và khai báo hoạt ảnh:
- Nạp spritesheet bằng `this.load.spritesheet(...)`.
- Khai báo animations bằng `this.anims.create(...)`.
