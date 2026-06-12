---
title: "Nghiên cứu & Đề xuất giải pháp tự động hóa Web App Dashboards"
status: "backlog"
priority: "high"
created: "2026-06-13"
depends_on: []
tags: ["research", "dashboard", "writeup"]
---

# Nghiên cứu & Đề xuất giải pháp tự động hóa Web App Dashboards

## Bối cảnh

Để chuyển đổi 2 trang `/writeup` và `/dashboard` từ viết thủ công sang tự động sinh code 80-90%, chúng ta cần nghiên cứu và triển khai đồng thời 3 giải pháp:
1. **Tự code (Custom Script)**: Viết mã nguồn Node.js để tự xử lý logic và sinh trang tĩnh.
2. **Astro**: Sử dụng Static Site Generator hiện đại.
3. **1 Framework chuyên viết docs thân thiện với Node.js**: Ví dụ như VitePress (hoặc Docsify, Docusaurus).

Trước khi bắt tay vào triển khai thực tế trên toàn bộ hệ thống, chúng ta cần thực hiện nghiên cứu chuyên sâu về khả năng tích hợp, cấu hình đường dẫn động và khả năng sinh code tự động của cả 3 phương án trên.

## Mục tiêu

Nghiên cứu chi tiết cấu trúc, cách thức hoạt động, khả năng đọc dữ liệu từ thư mục `history/` và xuất kết quả ra `public/` của 3 phương án: Custom Script, Astro, và VitePress. Lập báo cáo so sánh chi tiết ưu nhược điểm gửi User để chuẩn bị cho giai đoạn triển khai thực tế.

## Yêu cầu

### Input
- Thư mục nguồn dữ liệu markdown `history/chatlog/conversations.md` và `history/walkthrough/`.
- Tài liệu kỹ thuật của Astro và VitePress (hoặc các framework viết docs tương tự).

### Output
- Một tài liệu báo cáo nghiên cứu chi tiết dạng Markdown (`research_report.md` lưu tại thư mục artifacts hoặc scratch) so sánh cụ thể cả 3 phương án.
- Báo cáo phải đánh giá cụ thể các yếu tố: độ phức tạp cài đặt, thời gian build, dung lượng bundle build, khả năng tương thích khi deploy lên GitHub Pages và tỷ lệ tự động hóa code (đạt 80-90%).

## Checklist

- [ ] Nghiên cứu và phác thảo phương án 1: Tự code (sử dụng script Node.js kết hợp `marked` và mẫu CSS/JS có sẵn)
- [ ] Nghiên cứu và phác thảo phương án 2: Sử dụng Astro (khởi tạo, cấu hình dynamic routing để đọc markdown từ ngoài project root)
- [ ] Nghiên cứu và phác thảo phương án 3: Sử dụng một framework chuyên viết docs thân thiện với Node.js như VitePress (cách thức symlink hoặc config `srcDir` để nạp tệp markdown)
- [ ] Viết báo cáo so sánh chi tiết ưu nhược điểm và độ khả thi của cả 3 phương án
- [ ] Gửi báo cáo cho User phê duyệt phương án triển khai
