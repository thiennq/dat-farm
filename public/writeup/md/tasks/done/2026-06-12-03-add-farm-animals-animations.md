---
title: "Phase 3: Add Farm Animals & Random Movements"
status: "done"
priority: "high"
created: "2026-06-12"
depends_on: ["2026-06-12-02-create-tilemap-and-player.md"]
tags: ["phaser", "animals", "ai", "animation"]
---

# Phase 3: Add Farm Animals & Random Movements

## Bối cảnh

Để nông trại trông sinh động và giống Stardew Valley hơn, chúng ta cần đưa các con vật nuôi (như gà, bò, cừu, chó, mèo) vào bản đồ. Các con vật này sẽ tự động đi lại tự do trên đồng cỏ, dừng lại ăn cỏ hoặc nằm nghỉ với các hoạt cảnh tương ứng.

## Mục tiêu

Tải tài nguyên động vật, thiết lập hành vi di chuyển ngẫu nhiên (Simple AI) và chạy các hoạt cảnh động vật trên nông trại.

## Yêu cầu

### Input / Trigger
- Trò chơi tự động cập nhật trạng thái di chuyển của động vật theo thời gian (time-based updates).

### Output / Behavior
- Có ít nhất 3-5 con vật thuộc các loài khác nhau (gà, bò, lợn...) xuất hiện rải rác trên đồng cỏ.
- Mỗi con vật tự động chọn hành động ngẫu nhiên: đứng yên (idle), ăn cỏ (eat), hoặc đi bộ (walk) theo hướng ngẫu nhiên.
- Động vật không đi xuyên qua các vật cản lớn (như hàng rào bao quanh hoặc nhà cửa).

### Constraints & Rules
- Logic di chuyển của động vật cần nhẹ nhàng, không gây giật lag (sử dụng Phaser Timer/Events thay vì tính toán quá nặng mỗi frame).
- Tránh việc động vật đi lạc ra ngoài ranh giới bản đồ nông trại.

## Thiết kế kỹ thuật

### Files cần tạo/sửa

| File | Action |
|------|--------|
| `src/scenes/FarmScene.js` | SỬA |

### Random Movement AI (Pseudocode)
```javascript
// Cứ mỗi 2-4 giây, con vật sẽ chọn hành động mới
scene.time.addEvent({
  delay: Phaser.Math.Between(2000, 4000),
  callback: () => {
    const action = Phaser.Math.Between(0, 4); // 0: Idle, 1: Walk Up, 2: Walk Down, 3: Walk Left, 4: Walk Right
    // Set velocity & play animation tương ứng...
  },
  loop: true
});
```

## Checklist

- [x] Trong `preload()` của `FarmScene.js`, load spritesheet của động vật (như gà/chicken, bò/cow, cừu/sheep hoặc chó/mèo)
- [x] Tạo các animations đứng yên (idle) và di chuyển (walk/eat) cho từng loài vật từ spritesheet của chúng
- [x] Tạo một Phaser Group để dễ quản lý các sprite động vật
- [x] Spawn một số lượng động vật ngẫu nhiên trên các vị trí đồng cỏ của bản đồ
- [x] Hiện thực logic AI di chuyển ngẫu nhiên (Random Walk) bằng cách dùng Phaser Timers cho mỗi con vật
- [x] Thiết lập va chạm giữa động vật với các biên bản đồ hoặc hàng rào để giữ chúng ở trong trang trại
- [x] Tinh chỉnh tốc độ di chuyển của động vật chậm hơn Player để tạo cảm giác tự nhiên
- [x] Chạy kiểm thử toàn diện dự án qua `npm run dev` để kiểm tra hiệu năng, hoạt cảnh và độ mượt mà
- [x] Tạo file walkthrough tổng kết quá trình làm việc

## Notes & Open Questions

- Nếu sprite sheet của động vật không hỗ trợ đủ 4 hướng đi, chúng ta có thể lật hình (flipX) khi di chuyển trái/phải và dùng hoạt cảnh đứng yên khi di chuyển lên/xuống.
