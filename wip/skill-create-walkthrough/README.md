# Skill Create Walkthrough (Tích hợp Walkthrough & Chat Log)

Thư mục này đóng gói kỹ năng `create-walkthrough` để hỗ trợ AI Agent hoặc người dùng tự động sinh tài liệu tóm tắt hành trình (Walkthrough) và nhật ký hội thoại chi tiết (Chat Log) của dự án.

## Cấu trúc thư mục của Skill
- `SKILL.md`: Tài liệu hướng dẫn sử dụng, khai báo trigger rules, append & merge rules.
- `scripts/`:
  - `build-history.py`: Kịch bản Python tích hợp (All-in-one) quét logs từ IDE, lọc thông minh, làm sạch ký tự escape, định dạng log lai tối ưu (bọc Action trong `<details>`), tự động chèn nhãn anchor link `#q1`, `#q2`... và copy đồng bộ phục vụ dashboard.

## Nơi lưu trữ tài liệu gốc (Source of Truth)
* **Walkthroughs**: Được quản lý trong git dưới thư mục `history/walkthrough/`.
* **Chat Logs**: Được quản lý trong git dưới thư mục `history/chatlog/`.

*Lưu ý: Các file này được quản lý độc lập ngoài thư mục `public` của dự án. Việc đồng bộ sang các thư mục hiển thị (như `public/dashboard/`) là trách nhiệm của các công cụ bên ngoài hoặc quy trình sao chép thủ công.*

## Wishlist (Các cải tiến dự kiến)
- **Tham số hóa CLI (Arguments Parsing)**: Cho phép truyền các tham số dòng lệnh như `--workspace`, `--output`, `--limit-turns` để script chạy linh hoạt hơn mà không cần sửa cứng các đường dẫn `/Users/thiennq/...` trong code.
- **Tự động sao chép Asset (Screenshots/Videos)**: Quét các tool call `browser_subagent` có sinh ra ảnh chụp màn hình hoặc video minh họa, tự động copy các file đó sang thư mục assets của dashboard và chèn mã nhúng `![Image](path)` tương ứng vào chatlog Markdown.
- **Cải tiến bộ lọc Thinking nâng cao**: Sử dụng danh sách từ khóa phủ định (blacklist keywords) để loại bỏ các khối suy nghĩ mang tính thủ tục kỹ thuật chi tiết hơn, giúp giữ lại 100% các khối suy nghĩ mang tính giải quyết vấn đề thực sự.
