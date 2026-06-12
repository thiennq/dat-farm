---
title: "Phase 2: Create Tilemap & Player Movement"
status: "done"
priority: "high"
created: "2026-06-12"
depends_on: ["2026-06-12-01-setup-project-and-assets.md"]
tags: ["phaser", "tilemap", "player", "animation"]
---

# Phase 2: Create Tilemap & Player Movement

## Bối cảnh

Sau khi có cấu hình dự án và asset, chúng ta cần dựng màn hình game nông trại bằng Phaser JS, hiển thị bản đồ nền và cho phép nhân vật Player di chuyển trên nông trại với đầy đủ animation đi lại 4 hướng (lên, xuống, trái, phải).

## Mục tiêu

Khởi tạo game Phaser, vẽ bản đồ nền nông trại (tilemap), hiển thị nhân vật chính và lập trình điều khiển di chuyển kèm theo hoạt cảnh tương ứng.

## Yêu cầu

### Input / Trigger
- Người dùng điều khiển nhân vật bằng các phím mũi tên (Arrow Keys) hoặc cụm phím WASD.

### Output / Behavior
- Hiển thị tilemap nền nông trại (gồm các lớp nền cỏ, đường đất, một vài vật cản như hàng rào/cây cối).
- Player xuất hiện trên bản đồ, di chuyển mượt mà theo điều khiển phím.
- Khi Player di chuyển, animation đi bộ tương ứng với hướng di chuyển sẽ hoạt động. Khi dừng lại, nhân vật chuyển sang trạng thái đứng yên (idle) hướng về phía di chuyển cuối cùng.
- Camera luôn di chuyển theo tâm là Player.

### Constraints & Rules
- Bật tính năng `pixelArt: true` trong cấu hình Phaser để tránh ảnh bị mờ/nhòe khi zoom.
- Xử lý mượt mà việc chuyển đổi giữa đi bộ và đứng yên.

## Thiết kế kỹ thuật

### Files cần tạo/sửa

| File | Action |
|------|--------|
| `src/main.js` | MỚI |
| `src/scenes/FarmScene.js` | MỚI |

### API / Animation Design
Các animation key cần tạo cho Player:
- `player-walk-down`, `player-walk-up`, `player-walk-left`, `player-walk-right`
- `player-idle-down`, `player-idle-up`, `player-idle-left`, `player-idle-right`

## Checklist

- [x] Tạo file `src/main.js` để cấu hình game Phaser (sử dụng Arcade Physics, chế độ pixelArt, kích thước 800x600 hoặc tự co giãn)
- [x] Tạo file `src/scenes/FarmScene.js` định nghĩa class `FarmScene` kế thừa từ `Phaser.Scene`
- [x] Trong `preload()`, load các asset tileset và spritesheet của nhân vật Player
- [x] Trong `create()`, dựng tilemap tĩnh hoặc xếp các tile đất/cỏ làm nền cho trang trại
- [x] Khởi tạo sprite Player và bật physics (vật lý va chạm cơ bản nếu cần)
- [x] Tạo các animations di chuyển và đứng yên cho Player từ spritesheet đã load
- [x] Thiết lập lắng nghe đầu vào bàn phím (cursors/WASD)
- [x] Trong `update()`, tính toán hướng di chuyển, đặt velocity cho Player và phát animation tương ứng
- [x] Cấu hình Camera chính của scene tự động theo dõi (follow) Player
- [x] Chạy kiểm thử xem nhân vật đã di chuyển và phát animation chuẩn chưa

## Notes & Open Questions

- Định dạng spritesheet của Player: Cần kiểm tra xem spritesheet của Player có kích thước mỗi frame là bao nhiêu (ví dụ: 16x16, 32x32, 48x48 hoặc 64x64) để thiết lập thông số `frameWidth` và `frameHeight` chính xác trong `scene.load.spritesheet()`.
