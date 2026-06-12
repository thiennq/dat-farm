# Tổng Hợp & Đọc Hiểu Các Kịch Bản Trong Thư Mục `scratch/`

Tài liệu này cung cấp tóm tắt, mục đích sử dụng, cơ chế hoạt động và dữ liệu vào/ra của các kịch bản Python hỗ trợ thu thập và định dạng chatlog trong thư mục `scratch/`.

---

## Danh Sách Các Kịch Bản

### 1. [1-scout-history.py](file:///Users/thiennq/workspace/personal/farm/scratch/1-scout-history.py)
*   **Mục đích**: Tìm kiếm, đếm và kiểm tra nhanh các cuộc hội thoại (conversations) liên quan đến workspace dự án nông trại hiện tại, sau đó trích xuất toàn bộ lịch sử trò chuyện thô (`transcript.jsonl`) của chúng thành các tệp tin Markdown tổng hợp.
*   **Cơ chế hoạt động**:
    *   Quét thư mục chứa logs hệ thống của AI Agent (`.gemini/antigravity-ide/brain/`).
    *   Đọc tệp tin nhật ký của mỗi phiên chat, lọc ra các phiên có chứa đường dẫn của dự án nông trại (`/Users/thiennq/workspace/personal/farm`).
    *   Sắp xếp thứ tự các cuộc hội thoại theo thời gian (từ cũ đến mới).
    *   In tóm tắt các cuộc hội thoại và tiêu đề các lượt yêu cầu (User prompt preview) ra màn hình.
    *   Gộp toàn bộ nội dung hội thoại (Turn User & Turn AI) theo đúng thứ tự thời gian vào hai file đầu ra: `chatlog.md` ở gốc dự án và `public/writeup/md/chatlog.md`.

### 2. [2-clean-history.py](file:///Users/thiennq/workspace/personal/farm/scratch/2-clean-history.py)
*   **Mục đích**: Định dạng và dọn dẹp các tệp nhật ký Markdown vừa gộp để hiển thị sạch đẹp, súc tích nhất trên giao diện Dashboard.
*   **Cơ chế hoạt động**:
    *   Áp dụng liên tiếp 3 bước lọc (cleaning passes) trên các tệp `chatlog.md` và `public/writeup/md/chatlog.md`:
        1.  **Làm sạch dấu nháy**: Tìm và chuyển đổi các ký tự escape dạng `\"` hoặc `\\"` thành dấu nháy kép `"` thông thường.
        2.  **Rút gọn nhãn gọi công cụ**: Thay thế cụm từ thừa thãi `- Call tool \`tên_tool\`` thành `- \`tên_tool\`` để giao diện tinh giản hơn.
        3.  **Tối giản hóa tham số công cụ**: Dùng Regular Expressions để nhận diện các tham số JSON phức tạp của các cuộc gọi `list_dir`, `view_file`, `write_to_file`, `run_command` và rút gọn chúng về định dạng `- \`tool_name\`: \`main_parameter\``.
