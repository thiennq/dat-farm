---
title: "Tự động hóa Quy trình sinh Web App Dashboards"
status: "backlog"
priority: "high"
created: "2026-06-13"
depends_on: ["2026-06-13-research-dashboards-automation.md"]
tags: ["automation", "dashboard", "writeup", "generator"]
---

# Tự động hóa Quy trình sinh Web App Dashboards

## Bối cảnh

Sau khi hoàn thành việc nghiên cứu giải pháp và được phê duyệt phương án (trong task `2026-06-13-research-dashboards-automation.md`), chúng ta cần tiến hành lập trình/cấu hình để tự động hóa việc sinh 2 trang `/writeup` và `/dashboard` của dự án. 

Để tối ưu hóa, 2 web app này sẽ được tạo tự động 80-90% từ các thư viện mã nguồn mở có sẵn hoặc CLI generator, hạn chế tối đa sự can thiệp thủ công từ con người hoặc AI (chỉ chiếm tối đa 10% phần cấu hình/tùy biến giao diện).

## Mục tiêu

Thiết lập và viết tài liệu hướng dẫn chuyển đổi 2 trang `/writeup` và `/dashboard` thành các ứng dụng được sinh tự động thông qua câu lệnh CLI hoặc thư viện mã nguồn mở đã được phê duyệt, xuất bản kết quả (build output) trực tiếp vào thư mục `public/writeup` và `public/dashboard`.

## Yêu cầu

### Input / Trigger
- Chạy thủ công bằng một câu lệnh cài đặt/chạy dễ dàng (ví dụ: `npx <command>` hoặc script npm như `npm run build:docs`).
- Đầu vào là các tệp Markdown nhật ký trong `history/chatlog/conversations.md` và `history/walkthrough/`.

### Output / Behavior
- Sinh ra toàn bộ mã nguồn tĩnh (HTML, JS, CSS) của 2 trang `/writeup` và `/dashboard` nằm tương ứng tại `public/writeup/` và `public/dashboard/`.
- Cả hai trang sau khi sinh tự động vẫn hoạt động tốt, tải mượt mà nội dung markdown và hỗ trợ xem walkthrough, chat log đầy đủ.
- Giao diện có thể sử dụng layout/theme mặc định của thư viện mã nguồn mở được chọn (được phép tối giản hóa, không bắt buộc giữ Cozy Dark Mode cũ).

### Constraints & Rules
- Không tự ý sửa đổi thủ công mã nguồn giao diện của 2 trang này sau khi đã chuyển sang quy trình tự động.
- Đầu ra build tĩnh của 2 trang phải tương thích hoàn toàn để deploy lên GitHub Pages hiện tại (`https://thiennq.github.io/dat-farm/`).
- 80-90% mã nguồn hiển thị được quản lý bởi CLI/thư viện ngoài, AI (LLM) chỉ viết 10% phần tích hợp và tệp cấu hình.

## Thiết kế kỹ thuật

- Tiến hành cài đặt thư viện/viết script và cấu hình tệp cấu hình cần thiết dựa trên kết quả phê duyệt nghiên cứu.
- Tạo các script npm tương ứng trong `package.json` để chạy quy trình build tự động.

### Files cần tạo/sửa
| File | Action |
|------|--------|
| `tasks/backlog/2026-06-13-automate-dashboards-generation.md` | SỬA |
| `package.json` | SỬA |

## Checklist

- [ ] Khởi tạo cấu hình/script cho phương án tự động hóa đã được phê duyệt
- [ ] Thiết lập build output xuất vào `public/writeup` và `public/dashboard`
- [ ] Thêm npm script (hoặc lệnh npx) vào `package.json` để chạy thủ công dễ dàng
- [ ] Chạy thử nghiệm và xác minh nội dung hiển thị chuẩn xác (markdown, walkthrough, chatlog)
- [ ] Kiểm thử build tĩnh và xác minh khả năng deploy hoạt động tốt trên gh-pages
- [ ] Cập nhật hướng dẫn sử dụng vào `SKILL.md` hoặc `README.md` của skill

## Notes & Open Questions

- Cần khảo sát kỹ độ tương thích đường dẫn tương đối (`./`) trên GitHub Pages của thư viện được chọn.
