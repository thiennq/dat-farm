# Quy tắc Không tự đồng bộ Tasks (No Auto-Sync Tasks Rule)

## Bối cảnh (Context)
Trong dự án, các tệp tin nhiệm vụ (tasks) được lưu trữ chính thức tại thư mục `tasks/` (bao gồm `tasks/backlog/` và `tasks/done/`). Đồng thời, trang Writeup Dashboard có thể sử dụng các bản sao tĩnh của các tệp này trong thư mục `public/writeup/md/tasks/` (hoặc `public/writeup/tasks/`) để hiển thị báo cáo.

## Quy tắc (Rule)
1. **Không tự động đồng bộ**: Tuyệt đối không tự ý sao chép, di chuyển hoặc đồng bộ hóa các tệp tin nhiệm vụ từ thư mục `tasks/` sang thư mục `public/writeup/tasks/` (hoặc `public/writeup/md/tasks/`) và ngược lại.
2. **Chỉ thực hiện khi có yêu cầu**: Việc sao chép hoặc di chuyển tệp nhiệm vụ sang thư mục hiển thị của Writeup Dashboard chỉ được phép thực hiện khi:
   - Có yêu cầu trực tiếp và rõ ràng từ User.
   - Nhiệm vụ đó nằm trong các bước của một checklist cụ thể trong task backlog đang được triển khai.
3. **Giữ nguyên cấu trúc độc lập**: Khi không có yêu cầu đồng bộ, hãy giữ cho hai thư mục này hoàn toàn độc lập để tránh tạo ra các tệp rác hoặc thay đổi không mong muốn trong thư mục phân phối tĩnh (`public/`).
