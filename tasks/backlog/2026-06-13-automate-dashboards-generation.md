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

Sau khi nghiên cứu giải pháp và lập báo cáo so sánh (trong task `2026-06-13-research-dashboards-automation.md`), chúng ta sẽ triển khai thực tế cả 3 phương án tự động hóa dưới dạng các công cụ (tools) độc lập. Mỗi công cụ sẽ tự động sinh mã nguồn tĩnh cho trang `/writeup` và `/dashboard` từ dữ liệu markdown trong `history/`.

Để tối ưu hóa, 2 web app này sẽ được tạo tự động 80-90% từ các thư viện mã nguồn mở có sẵn hoặc CLI generator, hạn chế tối đa sự can thiệp thủ công từ con người hoặc AI (chỉ chiếm tối đa 10% phần cấu hình/tùy biến giao diện).

## Mục tiêu

Xây dựng và triển khai thực tế 3 phương án tự động hóa (Tự code, Astro, VitePress) trong thư mục `tools/`. Thiết lập cấu hình đầu ra của cả 3 phương án xuất trực tiếp vào `public/writeup` và `public/dashboard` để phục vụ việc xem log và deploy.

## Yêu cầu

### Input / Trigger
- Chạy thủ công bằng các npm scripts được cấu hình ở root tương ứng cho từng phương án.
- Đầu vào là các tệp Markdown nhật ký trong `history/chatlog/conversations.md` và `history/walkthrough/`.

### Output / Behavior
- Cả 3 phương án sau khi chạy build đều phải tự động sinh ra mã nguồn tĩnh hoàn chỉnh (HTML, JS, CSS) lưu tại `public/writeup/` và `public/dashboard/`.
- Nội dung hiển thị phải chuẩn xác, đầy đủ (bao gồm việc đọc danh sách walkthroughs, nạp nội dung conversations.md, cuộn và highlight link neo chéo, và Drawer hiển thị chi tiết câu hỏi).
- Giao diện có thể sử dụng layout/theme mặc định của thư viện/Astro (cho phép tối giản hóa).

### Constraints & Rules
- Không tự ý sửa đổi thủ công mã nguồn giao diện sau khi chạy build tự động.
- Đầu ra build tĩnh của 2 trang phải tương thích hoàn toàn để deploy lên GitHub Pages hiện tại (`https://thiennq.github.io/dat-farm/`).
- 80-90% mã nguồn hiển thị được quản lý bởi CLI/thư viện ngoài, AI (LLM) chỉ viết 10% phần tích hợp và tệp cấu hình.

## Thiết kế kỹ thuật

Triển khai cấu trúc thư mục sau:
- `tools/builder-custom/`: Node.js script để tự động copy và sinh tệp cấu hình JSON cho cả 2 trang.
- `tools/builder-astro/`: Dự án Astro tĩnh đọc markdown ngoài root và render.
- `tools/builder-vitepress/`: Cấu hình VitePress docs nạp markdown từ history.

Cấu hình các lệnh chạy ở `package.json` root:
- `npm run build:custom`
- `npm run build:astro`
- `npm run build:vitepress`

### Files cần tạo/sửa
| File | Action |
|------|--------|
| `tasks/backlog/2026-06-13-automate-dashboards-generation.md` | SỬA |
| `package.json` | SỬA |
| Thư mục `tools/` | MỚI |

## Checklist

- [ ] Triển khai và tối ưu hóa Phương án 1: Custom Node.js Builder trong `tools/builder-custom/`
- [ ] Triển khai và tối ưu hóa Phương án 2: Astro Generator trong `tools/builder-astro/`
- [ ] Triển khai và tối ưu hóa Phương án 3: VitePress Project trong `tools/builder-vitepress/`
- [ ] Thiết lập đầu ra build (dist/outDir) của cả 3 phương án xuất trực tiếp vào `public/writeup` và `public/dashboard`
- [ ] Thêm các npm scripts tương ứng vào `package.json` ở root
- [ ] Chạy thử nghiệm build tĩnh cho cả 3 phương án, kiểm tra tính đúng đắn của dữ liệu hiển thị trên trình duyệt
- [ ] Đảm bảo khả năng tương thích deploy lên GitHub Pages sau khi build bằng cả 3 phương án
- [ ] Cập nhật hướng dẫn sử dụng vào `SKILL.md` và `README.md`

## Notes & Open Questions

- Cần khảo sát kỹ độ tương thích đường dẫn tương đối (`./`) trên GitHub Pages của thư viện được chọn.
