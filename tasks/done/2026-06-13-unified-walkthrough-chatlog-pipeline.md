---
title: "Tích hợp quy trình sinh tài liệu Walkthrough & Chat Log và dựng Dashboard hiển thị song song"
status: "done"
priority: "high"
created: "2026-06-13"
depends_on: []
tags: ["documentation", "automation", "python", "dashboard"]
---

# Tích hợp quy trình sinh tài liệu Walkthrough & Chat Log và dựng Dashboard hiển thị song song

## Bối cảnh

Hiện tại, quy trình ghi nhận nhật ký của AI (`walkthrough`) và trích xuất lịch sử hội thoại chi tiết (`chatlog`) đang bị phân mảnh ở hai kỹ năng độc lập. Việc này dẫn đến một số vấn đề:
1. Lãng phí token của LLM khi AI phải tự đi quét và tóm tắt logs thô lộn xộn.
2. Dữ liệu giữa tệp Walkthrough và Chatlog dễ bị lệch pha, thiếu đồng bộ về các bước thực hiện.
3. Người đọc tài liệu khó theo dõi đồng thời bức tranh tổng quan (Walkthrough) và chi tiết kỹ thuật (Chatlog).

Hợp nhất hai kỹ năng thành một pipeline thống nhất và xây dựng một Dashboard xem song song cả hai định dạng sẽ tăng cường tính tự động hoá, tính nhất quán của tài liệu và nâng cao trải nghiệm người đọc.

## Mục tiêu

Hợp nhất quy trình sinh Walkthrough và Chat Log vào kỹ năng `skill-create-walkthrough`, tự động sinh link neo chéo (anchor links) giữa hai định dạng, và dựng Dashboard hiển thị song song tại thư mục độc lập `public/dashboard/`.

## Yêu cầu

### Input / Trigger
* Người dùng gọi lệnh `/create-walkthrough` (hoặc chạy script offline).

### Output / Behavior
1. **Thư mục Skill mới**: Đổi tên `wip/skill-create-writeup` thành `wip/skill-create-walkthrough`.
2. **Quy trình gộp**:
   * **Bước 1 (Python)**: Quét logs từ IDE và xuất ra `chatlog-hybrid.md` (lọc sạch, bọc Action trong `<details>`).
   * **Bước 2 (LLM)**: Đọc `chatlog-hybrid.md` kết hợp với `git log` để viết tóm tắt hành trình `walkthroughs/XX.md`.
3. **Liên kết chéo (Cross-linking)**: Tự động gán link neo (ví dụ: `#q1`, `#q2`...) tại mỗi đầu Phase trong file Walkthrough dẫn thẳng đến phần hội thoại tương ứng trong Chat Log.
4. **Dashboard độc lập**: Tạo giao diện Dashboard xem song song tại `public/dashboard/` hiển thị mượt mà cả hai định dạng (Walkthrough & Chatlog).

### Constraints & Rules
* Dashboard mới phải đặt tại `public/dashboard/` để tránh ảnh hưởng đến Writeup Dashboard hiện tại ở `public/writeup/`.
* Các đường dẫn tuyệt đối local trong logs phải được làm sạch thành đường dẫn tương đối từ thư mục gốc của repo.

## Thiết kế kỹ thuật

### Files cần tạo/sửa
| File | Action |
|------|--------|
| `wip/skill-create-walkthrough/SKILL.md` | MỚI |
| `wip/skill-create-walkthrough/README.md` | MỚI |
| `wip/skill-create-walkthrough/scripts/1-scout-history.py` | MỚI |
| `wip/skill-create-walkthrough/scripts/2-clean-history.py` | MỚI |
| `wip/skill-create-walkthrough/scripts/3-hybrid-history.py` | MỚI |
| `public/dashboard/index.html` | MỚI |
| `public/dashboard/style.css` | MỚI |
| `public/dashboard/script.js` | MỚI |
| `wip/skill-create-writeup/` | XÓA |

## Checklist

- [x] Di chuyển và đổi tên thư mục `wip/skill-create-writeup` thành `wip/skill-create-walkthrough`
- [x] Cập nhật tệp `SKILL.md` và `README.md` trong thư mục skill mới để mô tả quy trình gộp thống nhất
- [x] Nâng cấp script `3-hybrid-history.py` để hỗ trợ cơ chế gán ID (`id="q1"`, `id="q2"`...) vào các lượt câu hỏi để làm đích đến cho anchor link
- [x] Thiết kế và tạo trang Dashboard độc lập tại `public/dashboard/index.html`
- [x] Lập trình CSS/JS cho Dashboard hỗ trợ 2 Tab (Walkthrough & Chatlog) và khả năng chuyển đổi/cuộn mượt mà qua các anchor link
- [x] Kiểm thử tự động/thủ công toàn bộ quy trình sinh tài liệu và kiểm tra giao diện hiển thị trên Dashboard mới

## Notes & Open Questions

- Cần xem xét cách tích hợp tự động chạy script Python vào trực tiếp lệnh `/create-walkthrough` để giảm thiểu thao tác gõ lệnh thủ công của người dùng.
