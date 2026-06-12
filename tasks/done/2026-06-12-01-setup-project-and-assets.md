---
title: "Phase 1: Setup Project & Sourcing Assets"
status: "done"
priority: "high"
created: "2026-06-12"
depends_on: []
tags: ["phaser", "vite", "setup", "assets"]
---

# Phase 1: Setup Project & Sourcing Assets

## Bối cảnh

Để bắt đầu làm bản demo nông trại pixel, chúng ta cần thiết lập môi trường phát triển cơ bản với Vite, cài đặt game engine Phaser JS, và chuẩn bị đầy đủ các asset hình ảnh pixel art chất lượng từ một nguồn mở công khai (như repository PyDew-Valley).

## Mục tiêu

Cấu hình dự án Vite + Phaser và tải/sắp xếp đầy đủ các tài nguyên hình ảnh (spritesheets, tilesets) cần thiết vào thư mục dự án.

## Yêu cầu

### Input / Trigger
- Khởi tạo trực tiếp bằng các tool file/command.

### Output / Behavior
- Thư mục dự án có đầy đủ cấu hình Vite, Phaser JS, và thư mục `public/assets/` chứa:
  - Sprite sheet nhân vật chính (Player) với các hướng di chuyển.
  - Sprite sheet động vật (ví dụ: bò, gà, hoặc chó mèo).
  - Tileset địa hình nông trại (cỏ, đất, cây cối, hàng rào).

### Constraints & Rules
- Không cài thêm thư viện game ngoài Phaser JS.
- Các asset lấy từ nguồn mở, dọn dẹp thư mục tạm sau khi hoàn tất copy.

## Thiết kế kỹ thuật

### Files cần tạo/sửa

| File | Action |
|------|--------|
| `package.json` | MỚI |
| `vite.config.js` | MỚI |
| `index.html` | MỚI |
| `public/assets/` | MỚI |

## Checklist

- [x] Tạo file `package.json` định nghĩa dependency `phaser` và `vite`
- [x] Tạo file cấu hình `vite.config.js` cơ bản
- [x] Tạo file `index.html` với div `#game-container` cho game canvas
- [x] Khởi tạo thư mục `public/assets/`
- [x] Clone tạm thời repository `https://github.com/clear-code-projects/PyDew-Valley` vào thư mục tạm `scratch/pydew_temp` trong workspace
- [x] Copy các file hình ảnh nhân vật (character), động vật (monsters/animals nếu có hoặc thú nuôi) và nền đất (ground/tileset) từ thư mục `graphics` của repo tạm vào `public/assets/`
- [x] Xóa bỏ thư mục tạm `scratch/pydew_temp` để dọn dẹp dự án
- [x] Run `npm install` để chuẩn bị chạy dự án

## Notes & Open Questions

- Cần kiểm tra kỹ đường dẫn copy của các asset trong repo PyDew-Valley để lấy đúng các file spritesheet của Player (có animation di chuyển 4 hướng) và Tileset nền cỏ/đất nông trại.
